import "./setup-env.js";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import app from "../app.js";
import userModel from "../models/user.model.js";
import Product from "../models/product.model.js";
import Wishlist from "../models/wishlist.model.js";
import connectDB from "../config/db.js";

describe("Wishlist API integration tests", () => {
  let buyerCookie;
  let otherCookie;
  let sellerCookie;
  let productId;
  let variantId;
  let secondProductId;

  beforeAll(async () => {
    await connectDB();
    await Promise.all([
      userModel.deleteMany({}),
      Product.deleteMany({}),
      Wishlist.deleteMany({}),
    ]);

    const buyer = await request(app).post("/api/auth/register").send({
      email: "buyer-wish@example.com",
      password: "password123",
      contact: "9876543251",
      fullname: "Wish Buyer",
      isSeller: false,
    });
    buyerCookie = buyer.headers["set-cookie"];

    const other = await request(app).post("/api/auth/register").send({
      email: "other-wish@example.com",
      password: "password123",
      contact: "9876543252",
      fullname: "Other Buyer",
      isSeller: false,
    });
    otherCookie = other.headers["set-cookie"];

    const seller = await request(app).post("/api/auth/register").send({
      email: "seller-wish@example.com",
      password: "password123",
      contact: "9876543253",
      fullname: "Wish Seller",
      isSeller: true,
    });
    sellerCookie = seller.headers["set-cookie"];

    const product = await request(app)
      .post("/api/product/create")
      .set("Cookie", sellerCookie)
      .send({
        title: "Wishlist Test Tee",
        description: "A tee used to exercise the wishlist end to end",
        priceAmount: 1200,
        priceCurrency: "INR",
      });
    productId = product.body._id;

    const variant = await request(app)
      .post(`/api/product/${productId}/variant`)
      .set("Cookie", sellerCookie)
      .field("priceAmount", 1200)
      .field("priceCurrency", "INR")
      .field("stock", 4)
      .field("attributes", JSON.stringify({ size: "M" }));
    variantId = variant.body.variant[0]._id;

    const second = await request(app)
      .post("/api/product/create")
      .set("Cookie", sellerCookie)
      .send({
        title: "Wishlist Test Cap",
        description: "A second product for testing the guest merge path",
        priceAmount: 700,
        priceCurrency: "INR",
      });
    secondProductId = second.body._id;
  });

  afterAll(async () => {
    await Promise.all([
      userModel.deleteMany({}),
      Product.deleteMany({}),
      Wishlist.deleteMany({}),
    ]);
    await mongoose.connection.close();
  });

  describe("GET /api/wishlist", () => {
    it("should reject an unauthenticated request", async () => {
      const res = await request(app).get("/api/wishlist");
      expect(res.status).toBe(401);
    });

    it("should return an empty wishlist on first access", async () => {
      const res = await request(app)
        .get("/api/wishlist")
        .set("Cookie", buyerCookie);

      expect(res.status).toBe(200);
      expect(res.body.wishlist.items).toEqual([]);
    });
  });

  describe("POST /api/wishlist/:productId", () => {
    it("should reject an unknown product", async () => {
      const res = await request(app)
        .post(`/api/wishlist/${new mongoose.Types.ObjectId()}`)
        .set("Cookie", buyerCookie);

      expect(res.status).toBe(404);
    });

    it("should save a product and populate it on the way back", async () => {
      const res = await request(app)
        .post(`/api/wishlist/${productId}`)
        .set("Cookie", buyerCookie)
        .send({ variantId });

      expect(res.status).toBe(200);
      expect(res.body.wishlist.items).toHaveLength(1);
      expect(res.body.wishlist.items[0].product.title).toBe("Wishlist Test Tee");
      expect(res.body.wishlist.items[0].variant).toBe(variantId);
    });

    it("should not create a duplicate row when the same product is saved twice", async () => {
      const res = await request(app)
        .post(`/api/wishlist/${productId}`)
        .set("Cookie", buyerCookie);

      expect(res.status).toBe(200);
      expect(res.body.wishlist.items).toHaveLength(1);
    });

    it("should keep one user's wishlist out of another's", async () => {
      const res = await request(app)
        .get("/api/wishlist")
        .set("Cookie", otherCookie);

      expect(res.status).toBe(200);
      expect(res.body.wishlist.items).toEqual([]);
    });
  });

  describe("POST /api/wishlist/merge", () => {
    it("should fold a guest's saved items in without dropping existing ones", async () => {
      const res = await request(app)
        .post("/api/wishlist/merge")
        .set("Cookie", buyerCookie)
        .send({
          items: [
            { productId: secondProductId },
            // Already on the account — must not duplicate.
            { productId, variantId },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.wishlist.items).toHaveLength(2);

      const ids = res.body.wishlist.items.map((i) => i.product._id);
      expect(ids).toContain(productId);
      expect(ids).toContain(secondProductId);
    });

    it("should be idempotent — merging the same payload twice changes nothing", async () => {
      const res = await request(app)
        .post("/api/wishlist/merge")
        .set("Cookie", buyerCookie)
        .send({ items: [{ productId: secondProductId }, { productId }] });

      expect(res.status).toBe(200);
      expect(res.body.wishlist.items).toHaveLength(2);
    });

    it("should silently skip ids that are malformed or point at nothing", async () => {
      const res = await request(app)
        .post("/api/wishlist/merge")
        .set("Cookie", buyerCookie)
        .send({
          items: [
            { productId: "not-an-object-id" },
            { productId: new mongoose.Types.ObjectId().toString() },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.wishlist.items).toHaveLength(2);
    });

    it("should tolerate an empty or missing payload", async () => {
      const res = await request(app)
        .post("/api/wishlist/merge")
        .set("Cookie", buyerCookie)
        .send({});

      expect(res.status).toBe(200);
      expect(res.body.wishlist.items).toHaveLength(2);
    });
  });

  describe("DELETE /api/wishlist/:productId", () => {
    it("should not let a user delete from someone else's wishlist", async () => {
      const res = await request(app)
        .delete(`/api/wishlist/${productId}`)
        .set("Cookie", otherCookie);

      expect(res.status).toBe(404);
    });

    it("should remove a saved product", async () => {
      const res = await request(app)
        .delete(`/api/wishlist/${productId}`)
        .set("Cookie", buyerCookie);

      expect(res.status).toBe(200);
      expect(res.body.wishlist.items).toHaveLength(1);
      expect(res.body.wishlist.items[0].product._id).toBe(secondProductId);
    });
  });

  describe("Dangling references", () => {
    it("should drop items whose product no longer exists", async () => {
      await Product.findByIdAndDelete(secondProductId);

      const res = await request(app)
        .get("/api/wishlist")
        .set("Cookie", buyerCookie);

      expect(res.status).toBe(200);
      expect(res.body.wishlist.items).toEqual([]);
    });
  });
});
