import Cart from "../models/cart.model.js";
import Order from "../models/order.model.js";
import Address from "../models/address.model.js";
import Product from "../models/product.model.js";
import { getAggregatedCart } from "../dao/cart.dao.js";
import commerce from "../config/commerce.js";
import config from "../config/config.js";
import {
  createPaymentOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
} from "../services/payment.service.js";

const money = (amount, currency) => ({ amount, currency });

/**
 * Copies a saved address into the shape an order freezes it as.
 */
const snapshotAddress = (address) => ({
  address: address._id,
  fullname: address.fullname,
  phone: address.phone,
  line1: address.line1,
  line2: address.line2,
  city: address.city,
  state: address.state,
  pincode: address.pincode,
  country: address.country,
});

/**
 * Copies an aggregated cart line into the shape an order freezes it as.
 */
const snapshotItem = (item) => {
  const variant = item.product?.variant;
  const images = variant?.images?.length ? variant.images : item.product?.images;

  return {
    product: item.product?._id,
    variant: item.variant,
    title: item.product?.title || "Product",
    image: images?.[0]?.url,
    attributes: variant?.attributes,
    quantity: item.quantity,
    price: variant?.price || item.price,
  };
};

/**
 * Everything that must happen exactly once when money is confirmed received:
 * stock comes down, the cart empties, the order flips to paid.
 *
 * Both the browser callback and the Razorpay webhook call this for the same
 * order, so the first line is the guard that makes it idempotent.
 */
const finalizePaidOrder = async (order, payment = {}) => {
  if (order.payment.status === "paid") {
    return order;
  }

  order.payment.status = "paid";
  order.payment.razorpayPaymentId =
    payment.razorpayPaymentId || order.payment.razorpayPaymentId;
  order.payment.razorpaySignature =
    payment.razorpaySignature || order.payment.razorpaySignature;
  order.payment.method = payment.method || order.payment.method;
  order.payment.paidAt = new Date();
  order.status = "confirmed";
  await order.save();

  // Guarded decrement — the filter refuses to take stock below zero, so two
  // buyers racing for the last unit can't both succeed.
  for (const item of order.items) {
    const result = await Product.updateOne(
      { _id: item.product },
      { $inc: { "variant.$[v].stock": -item.quantity } },
      {
        arrayFilters: [
          { "v._id": item.variant, "v.stock": { $gte: item.quantity } },
        ],
      },
    );

    if (result.modifiedCount === 0) {
      // Payment is already captured at this point, so we don't fail the order —
      // we surface it for manual fulfilment/refund instead.
      console.warn(
        `Oversold: order ${order._id} item ${item.product}/${item.variant} x${item.quantity} could not be deducted from stock`,
      );
    }
  }

  await Cart.findOneAndUpdate({ user: order.user }, { $set: { items: [] } });

  return order;
};

/**
 * @desc create an order and open a Razorpay payment for the current cart
 * @route POST /api/payment/order
 * @access Private
 */
export const createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { addressId } = req.body;

    if (!addressId) {
      return res.status(400).json({ message: "Delivery address is required" });
    }

    const address = await Address.findOne({ _id: addressId, user: userId });
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    const cart = await getAggregatedCart(userId);
    if (!cart || !cart.items?.length) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    // Re-check stock at checkout time — the cart may have been sitting open
    // while other buyers cleared out the shelf.
    for (const item of cart.items) {
      const stock = item.product?.variant?.stock ?? 0;
      if (item.quantity > stock) {
        return res.status(400).json({
          message: `Only ${stock} left of "${item.product?.title || "an item"}" — please update your cart`,
        });
      }
    }

    const currency = cart.items[0]?.product?.variant?.price?.currency ||
      commerce.CURRENCY;
    // Same breakdown the cart screen was showing — computed by the dao, not here.
    const amounts = cart.amounts;

    const order = new Order({
      user: userId,
      items: cart.items.map(snapshotItem),
      shippingAddress: snapshotAddress(address),
      subtotal: money(amounts.subtotal, currency),
      shipping: money(amounts.shipping, currency),
      tax: money(amounts.tax, currency),
      total: money(amounts.total, currency),
    });
    await order.save();

    const razorpayOrder = await createPaymentOrder({
      amount: amounts.total,
      currency,
      receipt: order._id.toString(),
      notes: {
        orderId: order._id.toString(),
        userId: userId.toString(),
      },
    });

    order.payment.razorpayOrderId = razorpayOrder.id;
    await order.save();

    return res.status(201).json({
      message: "Order created",
      order,
      // Everything the browser needs to open the Razorpay modal. The publishable
      // key is safe to ship to the client; the secret never leaves the server.
      checkout: {
        key: config.RAZOR_PAY_KEY,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        orderId: order._id,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to start payment" });
  }
};

/**
 * @desc verify the signature returned by the Razorpay checkout and confirm the order
 * @route POST /api/payment/verify
 * @access Private
 */
export const verifyPayment = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
    } = req.body;

    const order = await Order.findOne({
      "payment.razorpayOrderId": razorpayOrderId,
      user: userId,
    });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const isValid = verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      signature: razorpaySignature,
    });

    if (!isValid) {
      order.payment.status = "failed";
      order.payment.failureReason = "Signature verification failed";
      await order.save();
      return res.status(400).json({ message: "Payment verification failed" });
    }

    await finalizePaidOrder(order, { razorpayPaymentId, razorpaySignature });

    return res.status(200).json({ message: "Payment successful", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to verify payment" });
  }
};

/**
 * @desc record that the buyer abandoned or failed the Razorpay checkout
 * @route POST /api/payment/failed
 * @access Private
 */
export const markPaymentFailed = async (req, res) => {
  try {
    const userId = req.user._id;
    const { razorpayOrderId, reason } = req.body;

    const order = await Order.findOne({
      "payment.razorpayOrderId": razorpayOrderId,
      user: userId,
    });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // A late webhook may already have confirmed this payment — never downgrade
    // a paid order because the browser reported a failure.
    if (order.payment.status === "created") {
      order.payment.status = "failed";
      order.payment.failureReason = reason || "Payment was not completed";
      order.status = "cancelled";
      await order.save();
    }

    return res.status(200).json({ message: "Payment marked as failed", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @desc list the logged-in user's orders, newest first
 * @route GET /api/payment/orders
 * @access Private
 */
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({ orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @desc fetch a single order belonging to the logged-in user
 * @route GET /api/payment/orders/:orderId
 * @access Private
 */
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      user: req.user._id,
    });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json({ order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Reduces a full order to the slice one seller is entitled to see: their own
 * lines, what those lines are worth, and everything they need to ship the
 * parcel. Other sellers' items — and the payment identifiers — never leave here.
 */
const toSellerView = (order, sellerProductIds) => {
  const items = order.items.filter((item) =>
    sellerProductIds.has(item.product?.toString()),
  );

  const currency = items[0]?.price?.currency || order.total?.currency || "INR";
  const subtotal = items.reduce(
    (sum, item) => sum + (item.price?.amount || 0) * item.quantity,
    0,
  );

  return {
    _id: order._id,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    status: order.status,
    buyer: order.user
      ? {
          fullname: order.user.fullname,
          email: order.user.email,
          contact: order.user.contact,
        }
      : null,
    shippingAddress: order.shippingAddress,
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    // Deliberately not the order total — that would leak what other sellers on
    // the same order were paid.
    sellerSubtotal: { amount: subtotal, currency },
    payment: {
      status: order.payment?.status,
      method: order.payment?.method,
      paidAt: order.payment?.paidAt,
    },
  };
};

/**
 * The ids of every product this seller lists, as a Set for cheap membership
 * tests while filtering order lines.
 */
const sellerProductIdSet = async (sellerId) => {
  const ids = await Product.find({ seller: sellerId }).distinct("_id");
  return { ids, set: new Set(ids.map((id) => id.toString())) };
};

// Orders a seller is expected to act on: the money arrived at some point. An
// order that was never paid for is not a parcel anyone has to pack.
const SELLER_VISIBLE_PAYMENT = { $in: ["paid", "refunded"] };

/**
 * @desc list the orders containing this seller's products, newest first
 * @route GET /api/payment/seller/orders
 * @access Seller
 */
export const getSellerOrders = async (req, res) => {
  try {
    const { ids, set } = await sellerProductIdSet(req.user._id);
    if (!ids.length) {
      return res.status(200).json({ orders: [] });
    }

    const orders = await Order.find({
      "items.product": { $in: ids },
      "payment.status": SELLER_VISIBLE_PAYMENT,
    })
      .sort({ createdAt: -1 })
      .populate("user", "fullname email contact");

    return res
      .status(200)
      .json({ orders: orders.map((order) => toSellerView(order, set)) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @desc fetch one order, reduced to the lines this seller has to ship
 * @route GET /api/payment/seller/orders/:orderId
 * @access Seller
 */
export const getSellerOrderById = async (req, res) => {
  try {
    const { ids, set } = await sellerProductIdSet(req.user._id);

    const order = await Order.findOne({
      _id: req.params.orderId,
      "items.product": { $in: ids },
      "payment.status": SELLER_VISIBLE_PAYMENT,
    }).populate("user", "fullname email contact");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json({ order: toSellerView(order, set) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * The calendar day a timestamp falls on in the store's own timezone, as
 * YYYY-MM-DD. en-CA is the locale that formats dates in exactly that order,
 * which is why it's used here rather than for anything to do with Canada.
 */
const dayKey = (date) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: commerce.TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

/**
 * The store timezone's offset from UTC at a given instant, in milliseconds.
 * Read from Intl rather than hardcoded so changing STORE_TIMEZONE is all it
 * takes to move the store to another country.
 */
const storeOffsetMs = (date) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: commerce.TIMEZONE,
    timeZoneName: "longOffset",
  }).formatToParts(date);

  const offset = /GMT([+-])(\d{2}):(\d{2})/.exec(
    parts.find((part) => part.type === "timeZoneName")?.value || "",
  );
  if (!offset) return 0;

  const sign = offset[1] === "-" ? -1 : 1;
  return sign * (Number(offset[2]) * 60 + Number(offset[3])) * 60 * 1000;
};

/**
 * Midnight of the given instant's day, in the store's timezone. The window has
 * to start where the buckets start, or the oldest day on the chart shows only
 * part of its takings.
 */
const startOfStoreDay = (date) => {
  const offset = storeOffsetMs(date);
  const shifted = new Date(date.getTime() + offset);
  shifted.setUTCHours(0, 0, 0, 0);
  return new Date(shifted.getTime() - offset);
};

const emptyTotals = () => ({
  revenue: 0,
  units: 0,
  orders: 0,
  averageOrderValue: 0,
});

/**
 * Turns one $facet bucket — at most a single row — into the totals shape the
 * dashboard reads, including the average a client should never have to derive.
 */
const readTotals = (rows) => {
  const row = rows?.[0];
  if (!row) return emptyTotals();

  const orders = row.orders?.length || 0;
  return {
    revenue: row.revenue || 0,
    units: row.units || 0,
    orders,
    averageOrderValue: orders ? Math.round(row.revenue / orders) : 0,
  };
};

// Sums the seller's own lines. Reused by every bucket below so lifetime,
// windowed and per-day figures can never be computed three different ways.
const LINE_TOTALS = {
  revenue: { $sum: "$lineTotal" },
  units: { $sum: "$items.quantity" },
  // Orders are counted by identity: one order contributing three lines is
  // still one order.
  orders: { $addToSet: "$_id" },
};

/**
 * @desc sales figures for the signed-in seller — headline totals, a daily
 *       series for the chart, best sellers, and what needs restocking
 * @route GET /api/payment/seller/stats?days=30
 * @access Seller
 */
export const getSellerSalesSummary = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { ids } = await sellerProductIdSet(sellerId);

    // A window longer than a year is a report, not a dashboard.
    const days = Math.min(Math.max(parseInt(req.query.days) || 30, 1), 365);

    const now = new Date();
    const windowStart = startOfStoreDay(
      new Date(now.getTime() - (days - 1) * DAY_MS),
    );
    // The equally long stretch before it, so the window can be read as up or
    // down rather than as a number with no scale.
    const previousStart = new Date(windowStart.getTime() - days * DAY_MS);

    // Every day in range, so a quiet Tuesday plots as a zero instead of
    // vanishing and squashing the chart's time axis.
    const series = Array.from({ length: days }, (_, i) => ({
      date: dayKey(new Date(now.getTime() - (days - 1 - i) * DAY_MS)),
      revenue: 0,
      units: 0,
      orders: 0,
    }));

    const summary = {
      currency: commerce.CURRENCY,
      days,
      lifetime: emptyTotals(),
      window: emptyTotals(),
      previousWindowRevenue: 0,
      series,
      topProducts: [],
      statusBreakdown: {},
      lowStock: [],
      catalogue: { products: 0, variants: 0, outOfStock: 0 },
    };

    if (!ids.length) {
      return res.status(200).json({ summary });
    }

    const [sales] = await Order.aggregate([
      { $match: { "payment.status": "paid", "items.product": { $in: ids } } },
      { $unwind: "$items" },
      // Second pass — $unwind keeps every line of a shared order, including
      // other sellers'.
      { $match: { "items.product": { $in: ids } } },
      {
        $set: {
          lineTotal: { $multiply: ["$items.price.amount", "$items.quantity"] },
        },
      },
      {
        $facet: {
          lifetime: [{ $group: { _id: null, ...LINE_TOTALS } }],
          window: [
            { $match: { createdAt: { $gte: windowStart } } },
            { $group: { _id: null, ...LINE_TOTALS } },
          ],
          previous: [
            {
              $match: { createdAt: { $gte: previousStart, $lt: windowStart } },
            },
            { $group: { _id: null, revenue: { $sum: "$lineTotal" } } },
          ],
          daily: [
            { $match: { createdAt: { $gte: windowStart } } },
            {
              $group: {
                _id: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$createdAt",
                    timezone: commerce.TIMEZONE,
                  },
                },
                ...LINE_TOTALS,
              },
            },
          ],
          topProducts: [
            {
              $group: {
                _id: "$items.product",
                title: { $first: "$items.title" },
                image: { $first: "$items.image" },
                ...LINE_TOTALS,
              },
            },
            { $sort: { revenue: -1 } },
            { $limit: 5 },
          ],
          currency: [{ $limit: 1 }, { $project: { _id: 0, c: "$items.price.currency" } }],
        },
      },
    ]);

    summary.lifetime = readTotals(sales.lifetime);
    summary.window = readTotals(sales.window);
    summary.previousWindowRevenue = sales.previous?.[0]?.revenue || 0;
    summary.currency = sales.currency?.[0]?.c || commerce.CURRENCY;

    const byDay = new Map(sales.daily.map((row) => [row._id, row]));
    summary.series = series.map((day) => {
      const row = byDay.get(day.date);
      return row
        ? {
            date: day.date,
            revenue: row.revenue || 0,
            units: row.units || 0,
            orders: row.orders?.length || 0,
          }
        : day;
    });

    summary.topProducts = sales.topProducts.map((row) => ({
      product: row._id,
      title: row.title,
      image: row.image,
      revenue: row.revenue || 0,
      units: row.units || 0,
      orders: row.orders?.length || 0,
    }));

    // Fulfilment state is a property of the order, not of its lines — counting
    // it in the pipeline above would multiply each order by its line count.
    const statuses = await Order.aggregate([
      { $match: { "payment.status": "paid", "items.product": { $in: ids } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    summary.statusBreakdown = Object.fromEntries(
      statuses.map((row) => [row._id, row.count]),
    );

    const [inventory] = await Product.aggregate([
      { $match: { seller: sellerId } },
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                products: { $sum: 1 },
                variants: { $sum: { $size: "$variant" } },
              },
            },
          ],
          low: [
            { $unwind: "$variant" },
            {
              $match: {
                "variant.stock": { $lte: commerce.LOW_STOCK_THRESHOLD },
              },
            },
            { $sort: { "variant.stock": 1 } },
            { $limit: 8 },
            {
              $project: {
                _id: 0,
                product: "$_id",
                variant: "$variant._id",
                title: 1,
                image: { $first: "$images.url" },
                stock: "$variant.stock",
                attributes: "$variant.attributes",
              },
            },
          ],
          outOfStock: [
            { $unwind: "$variant" },
            { $match: { "variant.stock": { $lte: 0 } } },
            { $count: "count" },
          ],
        },
      },
    ]);

    summary.lowStock = inventory?.low || [];
    summary.catalogue = {
      products: inventory?.totals?.[0]?.products || 0,
      variants: inventory?.totals?.[0]?.variants || 0,
      outOfStock: inventory?.outOfStock?.[0]?.count || 0,
      lowStockThreshold: commerce.LOW_STOCK_THRESHOLD,
    };

    return res.status(200).json({ summary });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @desc server-to-server payment notifications from Razorpay
 * @route POST /api/payment/webhook
 * @access Public (authenticated by HMAC signature, not by cookie)
 *
 * This is the source of truth for payment state. The browser callback is only a
 * fast path — a buyer who closes the tab mid-redirect still gets their order
 * confirmed here.
 */
export const razorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const isValid = verifyWebhookSignature({
      rawBody: req.rawBody,
      signature,
    });

    if (!isValid) {
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    const event = req.body?.event;
    const payment = req.body?.payload?.payment?.entity;

    if (!payment?.order_id) {
      return res.status(200).json({ received: true });
    }

    const order = await Order.findOne({
      "payment.razorpayOrderId": payment.order_id,
    });
    if (!order) {
      // Unknown order — ack anyway so Razorpay stops retrying.
      return res.status(200).json({ received: true });
    }

    if (event === "payment.captured") {
      await finalizePaidOrder(order, {
        razorpayPaymentId: payment.id,
        method: payment.method,
      });
    } else if (event === "payment.failed" && order.payment.status === "created") {
      order.payment.status = "failed";
      order.payment.razorpayPaymentId = payment.id;
      order.payment.failureReason =
        payment.error_description || "Payment failed";
      order.status = "cancelled";
      await order.save();
    } else if (event === "refund.processed") {
      order.payment.status = "refunded";
      order.status = "cancelled";
      await order.save();
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    // Non-2xx makes Razorpay retry, which is what we want on a transient fault.
    res.status(500).json({ message: "Webhook processing failed" });
  }
};
