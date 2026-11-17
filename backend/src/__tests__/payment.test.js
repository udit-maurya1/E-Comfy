import "./setup-env.js";
import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import crypto from "crypto";
import request from "supertest";
import mongoose from "mongoose";

// Razorpay is stubbed so the suite never makes a live API call. Everything the
// server actually owns — amount calculation, signature checks, stock deduction,
// cart clearing — is exercised for real.
const createOrderMock = vi.fn(async ({ amount, currency, receipt }) => ({
  id: `order_test_${receipt}`,
  amount,
  currency,
  receipt,
  status: "created",
}));

vi.mock("razorpay", () => ({
  default: class RazorpayStub {
    constructor() {
      this.orders = { create: createOrderMock };
      this.payments = { fetch: vi.fn() };
    }
  },
}));

const app = (await import("../app.js")).default;
const userModel = (await import("../models/user.model.js")).default;
const Product = (await import("../models/product.model.js")).default;
const Cart = (await import("../models/cart.model.js")).default;
const Order = (await import("../models/order.model.js")).default;
const Address = (await import("../models/address.model.js")).default;
const connectDB = (await import("../config/db.js")).default;

const RAZORPAY_SECRET = process.env.RAZOR_PAY_SECRET;
const WEBHOOK_SECRET = process.env.RAZOR_PAY_WEBHOOK_SECRET;

const sign = (secret, payload) =>
  crypto.createHmac("sha256", secret).update(payload).digest("hex");

describe("Payment API integration tests", () => {
  let buyerCookie;
  let sellerCookie;
  let productId;
  let variantId;
  let addressId;
  let razorpayOrderId;
  let orderId;

  const VARIANT_PRICE = 2500;
  const STOCK = 5;
  const QUANTITY = 2;

  beforeAll(async () => {
    await connectDB();
    await Promise.all([
      userModel.deleteMany({}),
      Product.deleteMany({}),
      Cart.deleteMany({}),
      Order.deleteMany({}),
      Address.deleteMany({}),
    ]);

    const buyer = await request(app).post("/api/auth/register").send({
      email: "buyer-pay@example.com",
      password: "password123",
      contact: "9876543241",
      fullname: "Pay Buyer",
      isSeller: false,
    });
    buyerCookie = buyer.headers["set-cookie"];

    const seller = await request(app).post("/api/auth/register").send({
      email: "seller-pay@example.com",
      password: "password123",
      contact: "9876543242",
      fullname: "Pay Seller",
      isSeller: true,
    });
    sellerCookie = seller.headers["set-cookie"];

    const product = await request(app)
      .post("/api/product/create")
      .set("Cookie", sellerCookie)
      .send({
        title: "Payment Test Jacket",
        description: "A jacket used to exercise the payment flow end to end",
        priceAmount: VARIANT_PRICE,
        priceCurrency: "INR",
      });
    productId = product.body._id;

    const variant = await request(app)
      .post(`/api/product/${productId}/variant`)
      .set("Cookie", sellerCookie)
      .field("priceAmount", VARIANT_PRICE)
      .field("priceCurrency", "INR")
      .field("stock", STOCK)
      .field("attributes", JSON.stringify({ size: "L" }));
    variantId = variant.body.variant[0]._id;

    const address = await request(app)
      .post("/api/address")
      .set("Cookie", buyerCookie)
      .send({
        fullname: "Pay Buyer",
        phone: "9876543241",
        line1: "88 Hill Road",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400050",
      });
    addressId = address.body.address._id;
  });

  afterAll(async () => {
    await Promise.all([
      userModel.deleteMany({}),
      Product.deleteMany({}),
      Cart.deleteMany({}),
      Order.deleteMany({}),
      Address.deleteMany({}),
    ]);
    await mongoose.connection.close();
  });

  describe("POST /api/payment/order", () => {
    it("should reject an unauthenticated request", async () => {
      const res = await request(app).post("/api/payment/order").send({ addressId });
      expect(res.status).toBe(401);
    });

    it("should require a delivery address", async () => {
      const res = await request(app)
        .post("/api/payment/order")
        .set("Cookie", buyerCookie)
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/address/i);
    });

    it("should reject an address that belongs to nobody", async () => {
      const res = await request(app)
        .post("/api/payment/order")
        .set("Cookie", buyerCookie)
        .send({ addressId: new mongoose.Types.ObjectId().toString() });
      expect(res.status).toBe(404);
    });

    it("should refuse to open a payment for an empty cart", async () => {
      const res = await request(app)
        .post("/api/payment/order")
        .set("Cookie", buyerCookie)
        .send({ addressId });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/empty/i);
    });

    it("should create an order whose total is computed from the cart, not the client", async () => {
      await request(app)
        .post(`/api/cart/add/${productId}/${variantId}`)
        .set("Cookie", buyerCookie)
        .send({ quantity: QUANTITY });

      const res = await request(app)
        .post("/api/payment/order")
        .set("Cookie", buyerCookie)
        // A tampered client trying to set its own price is simply ignored.
        .send({ addressId, amount: 1 });

      expect(res.status).toBe(201);

      const subtotal = VARIANT_PRICE * QUANTITY; // 5000 — above the free-shipping bar
      expect(res.body.order.subtotal.amount).toBe(subtotal);
      expect(res.body.order.shipping.amount).toBe(0);
      expect(res.body.order.total.amount).toBe(subtotal);
      expect(res.body.order.payment.status).toBe("created");
      expect(res.body.order.status).toBe("pending");

      // The address is frozen onto the order, not merely referenced.
      expect(res.body.order.shippingAddress.line1).toBe("88 Hill Road");

      // Razorpay is charged in paise.
      expect(res.body.checkout.amount).toBe(subtotal * 100);
      expect(createOrderMock).toHaveBeenCalled();

      razorpayOrderId = res.body.checkout.razorpayOrderId;
      orderId = res.body.order._id;
    });
  });

  describe("POST /api/payment/verify", () => {
    it("should reject a forged signature and fail the order", async () => {
      const res = await request(app)
        .post("/api/payment/verify")
        .set("Cookie", buyerCookie)
        .send({
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: "pay_forged",
          razorpay_signature: "deadbeef",
        });

      expect(res.status).toBe(400);

      const order = await Order.findById(orderId);
      expect(order.payment.status).toBe("failed");

      // Nothing was fulfilled on a failed verification.
      const product = await Product.findById(productId);
      expect(product.variant.id(variantId).stock).toBe(STOCK);
      const cart = await Cart.findOne({ user: order.user });
      expect(cart.items).toHaveLength(1);
    });

    it("should accept a genuine signature, deduct stock and clear the cart", async () => {
      // Re-open the order the way a retry would.
      await Order.findByIdAndUpdate(orderId, {
        $set: { "payment.status": "created", status: "pending" },
      });

      const paymentId = "pay_genuine_001";
      const signature = sign(
        RAZORPAY_SECRET,
        `${razorpayOrderId}|${paymentId}`,
      );

      const res = await request(app)
        .post("/api/payment/verify")
        .set("Cookie", buyerCookie)
        .send({
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
        });

      expect(res.status).toBe(200);
      expect(res.body.order.payment.status).toBe("paid");
      expect(res.body.order.status).toBe("confirmed");

      const product = await Product.findById(productId);
      expect(product.variant.id(variantId).stock).toBe(STOCK - QUANTITY);

      const order = await Order.findById(orderId);
      const cart = await Cart.findOne({ user: order.user });
      expect(cart.items).toHaveLength(0);
    });

    it("should be idempotent — a replayed verification must not double-deduct stock", async () => {
      const paymentId = "pay_genuine_001";
      const signature = sign(
        RAZORPAY_SECRET,
        `${razorpayOrderId}|${paymentId}`,
      );

      const res = await request(app)
        .post("/api/payment/verify")
        .set("Cookie", buyerCookie)
        .send({
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
        });

      expect(res.status).toBe(200);
      const product = await Product.findById(productId);
      expect(product.variant.id(variantId).stock).toBe(STOCK - QUANTITY);
    });
  });

  describe("POST /api/payment/webhook", () => {
    it("should reject a payload with a bad signature", async () => {
      const res = await request(app)
        .post("/api/payment/webhook")
        .set("x-razorpay-signature", "not-a-real-signature")
        .send({ event: "payment.captured" });

      expect(res.status).toBe(400);
    });

    it("should not downgrade an already-paid order on a failure event", async () => {
      const payload = JSON.stringify({
        event: "payment.failed",
        payload: {
          payment: {
            entity: { id: "pay_late", order_id: razorpayOrderId, error_description: "late" },
          },
        },
      });

      const res = await request(app)
        .post("/api/payment/webhook")
        .set("x-razorpay-signature", sign(WEBHOOK_SECRET, payload))
        .set("Content-Type", "application/json")
        .send(payload);

      expect(res.status).toBe(200);
      const order = await Order.findById(orderId);
      expect(order.payment.status).toBe("paid");
    });

    it("should confirm an order the browser never reported back", async () => {
      // A second order, abandoned mid-redirect — only the webhook settles it.
      await request(app)
        .post(`/api/cart/add/${productId}/${variantId}`)
        .set("Cookie", buyerCookie)
        .send({ quantity: 1 });

      const created = await request(app)
        .post("/api/payment/order")
        .set("Cookie", buyerCookie)
        .send({ addressId });

      const secondRazorpayOrderId = created.body.checkout.razorpayOrderId;
      const payload = JSON.stringify({
        event: "payment.captured",
        payload: {
          payment: {
            entity: {
              id: "pay_webhook_only",
              order_id: secondRazorpayOrderId,
              method: "upi",
            },
          },
        },
      });

      const res = await request(app)
        .post("/api/payment/webhook")
        .set("x-razorpay-signature", sign(WEBHOOK_SECRET, payload))
        .set("Content-Type", "application/json")
        .send(payload);

      expect(res.status).toBe(200);

      const order = await Order.findById(created.body.order._id);
      expect(order.payment.status).toBe("paid");
      expect(order.payment.method).toBe("upi");
      expect(order.status).toBe("confirmed");
    });
  });

  describe("GET /api/payment/orders", () => {
    it("should list the buyer's own orders", async () => {
      const res = await request(app)
        .get("/api/payment/orders")
        .set("Cookie", buyerCookie);

      expect(res.status).toBe(200);
      expect(res.body.orders.length).toBeGreaterThanOrEqual(2);
    });

    it("should not expose another user's order", async () => {
      const res = await request(app)
        .get(`/api/payment/orders/${orderId}`)
        .set("Cookie", sellerCookie);

      expect(res.status).toBe(404);
    });
  });

  describe("GET /api/payment/seller/orders", () => {
    it("should reject a buyer asking for the seller queue", async () => {
      const res = await request(app)
        .get("/api/payment/seller/orders")
        .set("Cookie", buyerCookie);

      expect(res.status).toBe(403);
    });

    it("should list the paid orders containing this seller's products", async () => {
      const res = await request(app)
        .get("/api/payment/seller/orders")
        .set("Cookie", sellerCookie);

      expect(res.status).toBe(200);
      expect(res.body.orders.length).toBeGreaterThanOrEqual(1);

      const order = res.body.orders[0];
      expect(order.payment.status).toBe("paid");
      expect(order.items.length).toBeGreaterThanOrEqual(1);
      expect(order.shippingAddress.pincode).toBe("400050");
      expect(order.buyer.fullname).toBe("Pay Buyer");
      expect(order.sellerSubtotal.amount).toBe(
        order.items.reduce((sum, i) => sum + i.price.amount * i.quantity, 0),
      );
      // Payment identifiers are not the seller's business.
      expect(order.payment.razorpaySignature).toBeUndefined();
      expect(order.payment.razorpayPaymentId).toBeUndefined();
    });

    it("should show a seller nothing when none of their products were bought", async () => {
      const other = await request(app).post("/api/auth/register").send({
        email: "other-seller-pay@example.com",
        password: "password123",
        contact: "9876543243",
        fullname: "Other Seller",
        isSeller: true,
      });

      const res = await request(app)
        .get("/api/payment/seller/orders")
        .set("Cookie", other.headers["set-cookie"]);

      expect(res.status).toBe(200);
      expect(res.body.orders).toEqual([]);

      const detail = await request(app)
        .get(`/api/payment/seller/orders/${orderId}`)
        .set("Cookie", other.headers["set-cookie"]);

      expect(detail.status).toBe(404);
    });

    it("should summarise sales for the seller dashboard", async () => {
      const res = await request(app)
        .get("/api/payment/seller/stats")
        .query({ days: 7 })
        .set("Cookie", sellerCookie);

      expect(res.status).toBe(200);

      const { summary } = res.body;
      expect(summary.days).toBe(7);
      // One bucket per day in range, zeros included, so the chart's time axis
      // stays evenly spaced.
      expect(summary.series.length).toBe(7);

      const seriesRevenue = summary.series.reduce((sum, d) => sum + d.revenue, 0);
      expect(seriesRevenue).toBe(summary.window.revenue);

      // Every paid order in this suite was placed just now, so the window and
      // the lifetime figures have to agree.
      expect(summary.lifetime.revenue).toBe(summary.window.revenue);
      expect(summary.lifetime.units).toBe(summary.window.units);
      expect(summary.lifetime.revenue).toBe(
        VARIANT_PRICE * summary.lifetime.units,
      );
      expect(summary.lifetime.averageOrderValue).toBe(
        Math.round(summary.lifetime.revenue / summary.lifetime.orders),
      );

      expect(summary.topProducts[0].product).toBe(productId);
      expect(summary.topProducts[0].units).toBe(summary.lifetime.units);
      expect(summary.statusBreakdown.confirmed).toBeGreaterThanOrEqual(1);
      expect(summary.catalogue.products).toBe(1);
      expect(summary.catalogue.variants).toBe(1);
    });

    it("should reject a buyer asking for seller sales figures", async () => {
      const res = await request(app)
        .get("/api/payment/seller/stats")
        .set("Cookie", buyerCookie);

      expect(res.status).toBe(403);
    });

    it("should give a seller with no products an all-zero summary", async () => {
      const other = await request(app).post("/api/auth/register").send({
        email: "empty-seller-pay@example.com",
        password: "password123",
        contact: "9876543244",
        fullname: "Empty Seller",
        isSeller: true,
      });

      const res = await request(app)
        .get("/api/payment/seller/stats")
        .set("Cookie", other.headers["set-cookie"]);

      expect(res.status).toBe(200);
      expect(res.body.summary.lifetime).toEqual({
        revenue: 0,
        units: 0,
        orders: 0,
        averageOrderValue: 0,
      });
      expect(res.body.summary.series.length).toBe(30);
      expect(res.body.summary.topProducts).toEqual([]);
    });

    it("should return one order reduced to the seller's own lines", async () => {
      const res = await request(app)
        .get(`/api/payment/seller/orders/${orderId}`)
        .set("Cookie", sellerCookie);

      expect(res.status).toBe(200);
      expect(res.body.order._id).toBe(orderId);
      expect(res.body.order.itemCount).toBe(QUANTITY);
      expect(res.body.order.items[0].product).toBe(productId);
      expect(res.body.order.shippingAddress.line1).toBe("88 Hill Road");
    });
  });
});
