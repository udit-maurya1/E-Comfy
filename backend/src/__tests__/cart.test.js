import "./setup-env.js";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import app from "../app.js";
import userModel from "../models/user.model.js";
import Product from "../models/product.model.js";
import Cart from "../models/cart.model.js";
import connectDB from "../config/db.js";

describe("Cart API integration tests", () => {
  let buyerCookie;
  let sellerCookie;
  let createdProductId;
  let createdVariantId;
  let cartItemId;

  beforeAll(async () => {
    // Connect to the test database
    await connectDB();
  });

  afterAll(async () => {
    // Cleanup collections after tests
    await userModel.deleteMany({});
    await Product.deleteMany({});
    await Cart.deleteMany({});
    await mongoose.connection.close();
  });

  describe("Preparation: Setup User and Product with Variant", () => {
    it("should register a buyer and a seller", async () => {
      // Register buyer
      const buyerRes = await request(app)
        .post("/api/auth/register")
        .send({
          email: "buyer-cart@example.com",
          password: "password123",
          contact: "9876543221",
          fullname: "Cart Buyer",
          isSeller: false,
        });
      expect(buyerRes.status).toBe(200);
      buyerCookie = buyerRes.headers["set-cookie"];

      // Register seller
      const sellerRes = await request(app)
        .post("/api/auth/register")
        .send({
          email: "seller-cart@example.com",
          password: "password123",
          contact: "9876543222",
          fullname: "Cart Seller",
          isSeller: true,
        });
      expect(sellerRes.status).toBe(200);
      sellerCookie = sellerRes.headers["set-cookie"];
    });

    it("should create a product with a variant and stock", async () => {
      // Create product
      const productRes = await request(app)
        .post("/api/product/create")
        .set("Cookie", sellerCookie)
        .send({
          title: "Cart Test Hoodie",
          description: "A cool streetwear hoodie to test the cart functionality",
          priceAmount: 2500,
          priceCurrency: "INR",
          attributes: { Material: "French Terry Cotton", Fit: "Oversized" },
        });
      expect(productRes.status).toBe(201);
      createdProductId = productRes.body._id;

      // Add a variant with stock = 5
      const variantRes = await request(app)
        .post(`/api/product/${createdProductId}/variant`)
        .set("Cookie", sellerCookie)
        .field("priceAmount", 2500)
        .field("priceCurrency", "INR")
        .field("stock", 5)
        .field("attributes", JSON.stringify({ size: "M", color: "Slate Grey" }));

      expect(variantRes.status).toBe(200);
      
      // Get the variant ID from the updated product
      const updatedProduct = variantRes.body;
      expect(updatedProduct.variant).toBeInstanceOf(Array);
      expect(updatedProduct.variant.length).toBeGreaterThan(0);
      createdVariantId = updatedProduct.variant[0]._id;
    });
  });

  describe("POST /api/cart/add/:productId/:variantId", () => {
    it("should reject adding item to cart if user is not authenticated", async () => {
      const res = await request(app)
        .post(`/api/cart/add/${createdProductId}/${createdVariantId}`)
        .send({ quantity: 1 });
      expect(res.status).toBe(401);
    });

    it("should successfully add a valid variant to cart", async () => {
      const res = await request(app)
        .post(`/api/cart/add/${createdProductId}/${createdVariantId}`)
        .set("Cookie", buyerCookie)
        .send({ quantity: 2 });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message", "Item added to cart");
      expect(res.body.cart).toHaveProperty("items");
      expect(res.body.cart.items.length).toBe(1);
      expect(res.body.cart.items[0].product._id).toBe(createdProductId);
      expect(res.body.cart.items[0].variant).toBe(createdVariantId);
      expect(res.body.cart.items[0].quantity).toBe(2);

      cartItemId = res.body.cart.items[0]._id;
    });

    it("should reject adding more quantity than available stock", async () => {
      // Stock is 5. We already have 2. Adding 4 more makes 6 (which exceeds 5).
      const res = await request(app)
        .post(`/api/cart/add/${createdProductId}/${createdVariantId}`)
        .set("Cookie", buyerCookie)
        .send({ quantity: 4 });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("Cannot add more than 5 items to the cart");
    });
  });

  describe("GET /api/cart/items", () => {
    it("should reject getting cart items if user is not authenticated", async () => {
      const res = await request(app).get("/api/cart/items");
      expect(res.status).toBe(401);
    });

    it("should successfully retrieve cart items populated", async () => {
      const res = await request(app)
        .get("/api/cart/items")
        .set("Cookie", buyerCookie);

      expect(res.status).toBe(200);
      expect(res.body.cart).toHaveProperty("items");
      expect(res.body.cart.items.length).toBe(1);
      expect(res.body.cart.items[0].product._id).toBe(createdProductId);
      expect(res.body.cart.items[0].product.title).toBe("Cart Test Hoodie");
      expect(res.body.cart.items[0].variant).toBe(createdVariantId);
    });
  });

  describe("PUT /api/cart/update/:itemId", () => {
    it("should reject updating quantity if user is not authenticated", async () => {
      const res = await request(app)
        .put(`/api/cart/update/${cartItemId}`)
        .send({ quantity: 3 });
      expect(res.status).toBe(401);
    });

    it("should successfully update item quantity within available stock limit", async () => {
      const res = await request(app)
        .put(`/api/cart/update/${cartItemId}`)
        .set("Cookie", buyerCookie)
        .send({ quantity: 3 });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Cart item quantity updated");
      expect(res.body.cart.items[0].quantity).toBe(3);
    });

    it("should reject updating quantity if it exceeds stock limit", async () => {
      // Stock is 5. We request 6.
      const res = await request(app)
        .put(`/api/cart/update/${cartItemId}`)
        .set("Cookie", buyerCookie)
        .send({ quantity: 6 });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("Cannot update quantity to more than available stock");
    });
  });

  describe("DELETE /api/cart/remove/:itemId", () => {
    it("should reject removing item if user is not authenticated", async () => {
      const res = await request(app)
        .delete(`/api/cart/remove/${cartItemId}`);
      expect(res.status).toBe(401);
    });

    it("should successfully remove item from cart", async () => {
      const res = await request(app)
        .delete(`/api/cart/remove/${cartItemId}`)
        .set("Cookie", buyerCookie);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Item removed from cart");
      expect(res.body.cart.items.length).toBe(0);
    });
  });

  describe("Server-computed amounts", () => {
    // The storefront renders these numbers verbatim instead of reimplementing
    // the pricing rules, so every cart response has to carry them.
    it("should attach a full amount breakdown to an empty cart", async () => {
      const res = await request(app)
        .get("/api/cart/items")
        .set("Cookie", buyerCookie);

      expect(res.status).toBe(200);
      expect(res.body.cart.amounts).toMatchObject({
        subtotal: 0,
        tax: 0,
        total: 0,
      });
      expect(res.body.cart.amounts.freeShippingThreshold).toBeGreaterThan(0);
    });

    it("should waive shipping once the cart clears the threshold", async () => {
      // Two units at 2500 = 5000, comfortably past the 999 default.
      const res = await request(app)
        .post(`/api/cart/add/${createdProductId}/${createdVariantId}`)
        .set("Cookie", buyerCookie)
        .send({ quantity: 2 });

      expect(res.status).toBe(200);
      expect(res.body.cart.amounts.subtotal).toBe(5000);
      expect(res.body.cart.amounts.shipping).toBe(0);
      expect(res.body.cart.amounts.total).toBe(5000);
    });
  });
});
