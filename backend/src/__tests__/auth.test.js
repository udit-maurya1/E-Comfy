import "./setup-env.js";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import app from "../app.js";
import userModel from "../models/user.model.js";
import connectDB from "../config/db.js";
import redis, { connectRedis, disconnectRedis } from "../config/redis.js";

describe("Auth logout and token revocation", () => {
  let cookie;

  beforeAll(async () => {
    await connectDB();
    await userModel.deleteMany({});
    await connectRedis();
    await redis.flushDb();

    const registered = await request(app).post("/api/auth/register").send({
      email: "logout@example.com",
      password: "password123",
      contact: "9876543261",
      fullname: "Logout Tester",
      isSeller: false,
    });
    cookie = registered.headers["set-cookie"];
  });

  afterAll(async () => {
    await userModel.deleteMany({});
    await redis.flushDb();
    await disconnectRedis();
    await mongoose.connection.close();
  });

  it("should reject a logout with no session", async () => {
    const res = await request(app).post("/api/auth/logout");

    expect(res.status).toBe(401);
  });

  it("should accept the session before logging out", async () => {
    const res = await request(app).get("/api/auth/me").set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("logout@example.com");
  });

  it("should log out, clear the cookie and revoke the token", async () => {
    const res = await request(app)
      .post("/api/auth/logout")
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body).toHaveProperty("revoked", true);

    // The browser is told to drop the cookie…
    const cleared = res.headers["set-cookie"].join(";");
    expect(cleared).toContain("token=;");

    // …and the token itself is now on the revoked list, with an expiry so the
    // entry cleans itself up rather than living in Redis forever.
    const keys = await redis.keys("revoked_token:*");
    expect(keys.length).toBe(1);
    expect(await redis.ttl(keys[0])).toBeGreaterThan(0);
  });

  it("should refuse a request replaying the signed-out token", async () => {
    // The cookie is still perfectly valid JWT — this is exactly the case a
    // cookie-clearing-only logout would let through.
    const res = await request(app).get("/api/auth/me").set("Cookie", cookie);

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message", "Unauthorized: Session has ended");
  });

  it("should refuse the revoked token on seller and buyer routes alike", async () => {
    const cart = await request(app)
      .get("/api/cart/items")
      .set("Cookie", cookie);
    expect(cart.status).toBe(401);

    const seller = await request(app)
      .get("/api/product/get-products-seller")
      .set("Cookie", cookie);
    expect(seller.status).toBe(401);
  });

  // Guards the jti in the payload: without it a login in the same second as the
  // revoked token would re-mint that exact string and be refused on sight.
  it("should issue a working session again on the next login", async () => {
    const login = await request(app).post("/api/auth/login").send({
      email: "logout@example.com",
      password: "password123",
    });

    expect(login.status).toBe(200);

    const res = await request(app)
      .get("/api/auth/me")
      .set("Cookie", login.headers["set-cookie"]);

    expect(res.status).toBe(200);
  });
});
