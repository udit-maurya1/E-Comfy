import "./setup-env.js";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import app from "../app.js";
import userModel from "../models/user.model.js";
import Product from "../models/product.model.js";
import connectDB from "../config/db.js";

describe("Product API and Authentication integration tests", () => {
  let sellerCookie;
  let buyerCookie;
  let createdProductId;

  beforeAll(async () => {
    // Connect to the test database Ecomfy_test
    await connectDB();
    // Drop database to ensure old indexes are deleted and recreated with sparse: true
    try {
      await mongoose.connection.db.dropDatabase();
    } catch (err) {
      console.log("Database drop error, ignoring:", err);
    }
  });

  afterAll(async () => {
    // Cleanup collections after all tests have run
    await userModel.deleteMany({});
    await Product.deleteMany({});
    // Close mongoose connection
    await mongoose.connection.close();
  });

  describe("GET /api/product/all", () => {
    it("should return an empty product list with pagination metadata when no products exist", async () => {
      const res = await request(app)
        .get("/api/product/all")
        .query({ page: 1, limit: 10 });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("products");
      expect(res.body.products).toBeInstanceOf(Array);
      expect(res.body.products.length).toBe(0);
      expect(res.body).toHaveProperty("total", 0);
      expect(res.body).toHaveProperty("page", 1);
      expect(res.body).toHaveProperty("totalPages", 0);
    });
  });

  describe("Authentication Flow", () => {
    it("should register a seller user successfully", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          email: "test-seller@example.com",
          password: "password123",
          contact: "9876543211",
          fullname: "Test Seller",
          isSeller: true,
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("user");
      expect(res.body.user.role).toBe("seller");
      expect(res.headers["set-cookie"]).toBeDefined();
      
      // Save the authentication cookie for subsequent authenticated requests
      sellerCookie = res.headers["set-cookie"];
    });

    it("should register a buyer user successfully", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          email: "test-buyer@example.com",
          password: "password123",
          contact: "9876543212",
          fullname: "Test Buyer",
          isSeller: false,
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.user.role).toBe("buyer");
      expect(res.headers["set-cookie"]).toBeDefined();

      buyerCookie = res.headers["set-cookie"];
    });
  });

  describe("POST /api/product/create", () => {
    it("should fail to create a product if no token is provided", async () => {
      const res = await request(app)
        .post("/api/product/create")
        .send({
          title: "Unauthorized Jacket",
          description: "No token given",
          priceAmount: 2500,
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("message", "Unauthorized: No token provided");
    });

    it("should fail to create a product if user is not a seller (is a buyer)", async () => {
      const res = await request(app)
        .post("/api/product/create")
        .set("Cookie", buyerCookie)
        .send({
          title: "Buyer Jacket",
          description: "Buyer attempting to sell",
          priceAmount: 2500,
        });

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("message", "Forbidden: User is not a seller");
    });

    it("should create a product successfully when logged in as a seller", async () => {
      const res = await request(app)
        .post("/api/product/create")
        .set("Cookie", sellerCookie)
        .send({
          title: "Ecomfy Denim Jacket",
          description: "Premium denim jacket for casual wear",
          priceAmount: 2999,
          priceCurrency: "INR",
          attributes: { Material: "100% Cotton", Fit: "Relaxed" },
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("_id");
      expect(res.body.title).toBe("Ecomfy Denim Jacket");
      expect(res.body.price.amount).toBe(2999);
      expect(res.body.price.currency).toBe("INR");
      expect(res.body.attributes.Material).toBe("100% Cotton");
      expect(res.body.attributes.Fit).toBe("Relaxed");
      expect(res.body.seller).toBeDefined();

      createdProductId = res.body._id;
    });
  });

  describe("GET /api/product/get-products-seller", () => {
    it("should retrieve products belonging to the logged in seller", async () => {
      const res = await request(app)
        .get("/api/product/get-products-seller")
        .set("Cookie", sellerCookie);

      expect(res.status).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBe(1);
      expect(res.body[0]._id).toBe(createdProductId);
      expect(res.body[0].title).toBe("Ecomfy Denim Jacket");
    });

    it("should reject product retrieval for seller routes if the user is a buyer", async () => {
      const res = await request(app)
        .get("/api/product/get-products-seller")
        .set("Cookie", buyerCookie);

      expect(res.status).toBe(403);
    });
  });

  describe("GET /api/product/all (with seeded data)", () => {
    it("should show the newly created product in the public listing", async () => {
      const res = await request(app)
        .get("/api/product/all");

      expect(res.status).toBe(200);
      expect(res.body.products.length).toBe(1);
      expect(res.body.products[0]._id).toBe(createdProductId);
      expect(res.body.total).toBe(1);
    });
  });

  describe("PUT /api/product/update/:id", () => {
    it("should successfully update product details when logged in as the owner", async () => {
      const res = await request(app)
        .put(`/api/product/update/${createdProductId}`)
        .set("Cookie", sellerCookie)
        .send({
          title: "Updated Denim Jacket",
          description: "An updated description for tests",
          priceAmount: 3499,
          priceCurrency: "INR",
          attributes: { Material: "98% Cotton 2% Elastane", Fit: "Slim" },
        });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe("Updated Denim Jacket");
      expect(res.body.description).toBe("An updated description for tests");
      expect(res.body.price.amount).toBe(3499);
      expect(res.body.attributes.Material).toBe("98% Cotton 2% Elastane");
      expect(res.body.attributes.Fit).toBe("Slim");
    });

    it("should fail to update product if logged in as a non-owner (buyer)", async () => {
      const res = await request(app)
        .put(`/api/product/update/${createdProductId}`)
        .set("Cookie", buyerCookie)
        .send({
          title: "Intruder Update",
        });

      expect(res.status).toBe(403);
    });
  });

  describe("POST /api/product/:id/variant", () => {
    it("should successfully add a variant to the product", async () => {
      const res = await request(app)
        .post(`/api/product/${createdProductId}/variant`)
        .set("Cookie", sellerCookie)
        .field("priceAmount", 3999)
        .field("priceCurrency", "INR")
        .field("stock", 20)
        .field("attributes", JSON.stringify({ size: "L", color: "Obsidian" }));

      expect(res.status).toBe(200);
      expect(res.body.variant).toBeDefined();
      expect(res.body.variant.length).toBe(1);
      expect(res.body.variant[0].price.amount).toBe(3999);
      expect(res.body.variant[0].stock).toBe(20);
      expect(res.body.variant[0].attributes.size).toBe("L");
      expect(res.body.variant[0].attributes.color).toBe("Obsidian");
    });

    it("should fail to add a variant if logged in as a non-owner (buyer)", async () => {
      const res = await request(app)
        .post(`/api/product/${createdProductId}/variant`)
        .set("Cookie", buyerCookie)
        .field("priceAmount", 3999)
        .field("priceCurrency", "INR")
        .field("stock", 20);

      expect(res.status).toBe(403);
    });
  });

  describe("PATCH /api/product/:id/variant/:variantId/stock", () => {
    let variantId;

    beforeAll(async () => {
      const product = await Product.findById(createdProductId);
      variantId = product.variant[0]._id.toString();
    });

    it("should update only the stock, leaving price and attributes untouched", async () => {
      const res = await request(app)
        .patch(`/api/product/${createdProductId}/variant/${variantId}/stock`)
        .set("Cookie", sellerCookie)
        .send({ stock: 7 });

      expect(res.status).toBe(200);
      expect(res.body.variant[0].stock).toBe(7);
      expect(res.body.variant[0].price.amount).toBe(3999);
      expect(res.body.variant[0].attributes.size).toBe("L");
    });

    it("should accept a stock of zero", async () => {
      const res = await request(app)
        .patch(`/api/product/${createdProductId}/variant/${variantId}/stock`)
        .set("Cookie", sellerCookie)
        .send({ stock: 0 });

      expect(res.status).toBe(200);
      expect(res.body.variant[0].stock).toBe(0);
    });

    it("should reject a negative or non-integer stock", async () => {
      for (const stock of [-1, 2.5, "many", null]) {
        const res = await request(app)
          .patch(`/api/product/${createdProductId}/variant/${variantId}/stock`)
          .set("Cookie", sellerCookie)
          .send({ stock });

        expect(res.status).toBe(400);
      }
    });

    it("should 404 an unknown variant", async () => {
      const res = await request(app)
        .patch(
          `/api/product/${createdProductId}/variant/${new mongoose.Types.ObjectId()}/stock`,
        )
        .set("Cookie", sellerCookie)
        .send({ stock: 3 });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("message", "Variant not found");
    });

    it("should refuse a stock edit from a non-owner", async () => {
      const res = await request(app)
        .patch(`/api/product/${createdProductId}/variant/${variantId}/stock`)
        .set("Cookie", buyerCookie)
        .send({ stock: 99 });

      expect(res.status).toBe(403);
    });
  });

  describe("DELETE /api/product/:id/variant/:variantId", () => {
    let variantId;

    beforeAll(async () => {
      const product = await Product.findById(createdProductId);
      variantId = product.variant[0]._id.toString();
    });

    it("should refuse a delete from a non-owner", async () => {
      const res = await request(app)
        .delete(`/api/product/${createdProductId}/variant/${variantId}`)
        .set("Cookie", buyerCookie);

      expect(res.status).toBe(403);

      const product = await Product.findById(createdProductId);
      expect(product.variant.length).toBe(1);
    });

    it("should remove the variant for the owning seller", async () => {
      const res = await request(app)
        .delete(`/api/product/${createdProductId}/variant/${variantId}`)
        .set("Cookie", sellerCookie);

      expect(res.status).toBe(200);
      expect(res.body.variant.length).toBe(0);

      const product = await Product.findById(createdProductId);
      expect(product.variant.length).toBe(0);
    });

    it("should 404 a variant that is already gone", async () => {
      const res = await request(app)
        .delete(`/api/product/${createdProductId}/variant/${variantId}`)
        .set("Cookie", sellerCookie);

      expect(res.status).toBe(404);
    });
  });
});

