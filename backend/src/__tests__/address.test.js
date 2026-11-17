import "./setup-env.js";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import app from "../app.js";
import userModel from "../models/user.model.js";
import Address from "../models/address.model.js";
import connectDB from "../config/db.js";

const sampleAddress = {
  fullname: "Cart Buyer",
  phone: "9876543221",
  line1: "12 Linking Road",
  line2: "Bandra West",
  city: "Mumbai",
  state: "Maharashtra",
  pincode: "400050",
  country: "India",
  label: "home",
};

describe("Address API integration tests", () => {
  let buyerCookie;
  let otherBuyerCookie;
  let firstAddressId;
  let secondAddressId;

  beforeAll(async () => {
    await connectDB();
    await userModel.deleteMany({});
    await Address.deleteMany({});
  });

  afterAll(async () => {
    await userModel.deleteMany({});
    await Address.deleteMany({});
    await mongoose.connection.close();
  });

  describe("Preparation: register two buyers", () => {
    it("should register both buyers", async () => {
      const buyerRes = await request(app).post("/api/auth/register").send({
        email: "buyer-address@example.com",
        password: "password123",
        contact: "9876543231",
        fullname: "Address Buyer",
        isSeller: false,
      });
      expect(buyerRes.status).toBe(200);
      buyerCookie = buyerRes.headers["set-cookie"];

      const otherRes = await request(app).post("/api/auth/register").send({
        email: "other-address@example.com",
        password: "password123",
        contact: "9876543232",
        fullname: "Other Buyer",
        isSeller: false,
      });
      expect(otherRes.status).toBe(200);
      otherBuyerCookie = otherRes.headers["set-cookie"];
    });
  });

  describe("POST /api/address", () => {
    it("should reject an unauthenticated request", async () => {
      const res = await request(app).post("/api/address").send(sampleAddress);
      expect(res.status).toBe(401);
    });

    it("should reject an address with missing and invalid fields", async () => {
      const res = await request(app)
        .post("/api/address")
        .set("Cookie", buyerCookie)
        .send({ ...sampleAddress, fullname: "", phone: "abc" });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeInstanceOf(Array);
    });

    it("should create the first address and mark it default automatically", async () => {
      const res = await request(app)
        .post("/api/address")
        .set("Cookie", buyerCookie)
        .send(sampleAddress);

      expect(res.status).toBe(201);
      expect(res.body.address.city).toBe("Mumbai");
      expect(res.body.address.isDefault).toBe(true);
      firstAddressId = res.body.address._id;
    });

    it("should create a second address without stealing the default flag", async () => {
      const res = await request(app)
        .post("/api/address")
        .set("Cookie", buyerCookie)
        .send({
          ...sampleAddress,
          label: "work",
          line1: "5 MG Road",
          city: "Bengaluru",
          state: "Karnataka",
          pincode: "560001",
        });

      expect(res.status).toBe(201);
      expect(res.body.address.isDefault).toBe(false);
      secondAddressId = res.body.address._id;
    });
  });

  describe("GET /api/address", () => {
    it("should list only the logged-in user's addresses, default first", async () => {
      const res = await request(app)
        .get("/api/address")
        .set("Cookie", buyerCookie);

      expect(res.status).toBe(200);
      expect(res.body.addresses).toHaveLength(2);
      expect(res.body.addresses[0].isDefault).toBe(true);
    });

    it("should not leak addresses across users", async () => {
      const res = await request(app)
        .get("/api/address")
        .set("Cookie", otherBuyerCookie);

      expect(res.status).toBe(200);
      expect(res.body.addresses).toHaveLength(0);
    });
  });

  describe("PATCH /api/address/:addressId/default", () => {
    it("should move the default flag to the chosen address", async () => {
      const res = await request(app)
        .patch(`/api/address/${secondAddressId}/default`)
        .set("Cookie", buyerCookie);

      expect(res.status).toBe(200);
      expect(res.body.address.isDefault).toBe(true);

      const list = await request(app)
        .get("/api/address")
        .set("Cookie", buyerCookie);
      const defaults = list.body.addresses.filter((a) => a.isDefault);
      expect(defaults).toHaveLength(1);
      expect(defaults[0]._id).toBe(secondAddressId);
    });
  });

  describe("PUT /api/address/:addressId", () => {
    it("should update the given fields only", async () => {
      const res = await request(app)
        .put(`/api/address/${firstAddressId}`)
        .set("Cookie", buyerCookie)
        .send({ city: "Pune", pincode: "411001" });

      expect(res.status).toBe(200);
      expect(res.body.address.city).toBe("Pune");
      expect(res.body.address.pincode).toBe("411001");
      // Untouched fields survive a partial update.
      expect(res.body.address.line1).toBe("12 Linking Road");
    });

    it("should not let a user edit someone else's address", async () => {
      const res = await request(app)
        .put(`/api/address/${firstAddressId}`)
        .set("Cookie", otherBuyerCookie)
        .send({ city: "Hacked" });

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /api/address/:addressId", () => {
    it("should not let a user delete someone else's address", async () => {
      const res = await request(app)
        .delete(`/api/address/${firstAddressId}`)
        .set("Cookie", otherBuyerCookie);

      expect(res.status).toBe(404);
    });

    it("should delete the default and promote the remaining address", async () => {
      const res = await request(app)
        .delete(`/api/address/${secondAddressId}`)
        .set("Cookie", buyerCookie);
      expect(res.status).toBe(200);

      const list = await request(app)
        .get("/api/address")
        .set("Cookie", buyerCookie);
      expect(list.body.addresses).toHaveLength(1);
      expect(list.body.addresses[0]._id).toBe(firstAddressId);
      expect(list.body.addresses[0].isDefault).toBe(true);
    });
  });
});
