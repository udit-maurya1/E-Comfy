import { Router } from "express";
import {
  authenticateSeller,
  authenticateUser,
} from "../middlewares/auth.middleware.js";
import {
  createOrder,
  verifyPayment,
  markPaymentFailed,
  getOrders,
  getOrderById,
  getSellerOrders,
  getSellerOrderById,
  getSellerSalesSummary,
  razorpayWebhook,
} from "../controllers/payment.controller.js";

const paymentRouter = Router();

// Razorpay authenticates itself with an HMAC header, not our session cookie,
// so this route deliberately sits outside authenticateUser.
paymentRouter.post("/webhook", razorpayWebhook);

paymentRouter.post("/order", authenticateUser, createOrder);
paymentRouter.post("/verify", authenticateUser, verifyPayment);
paymentRouter.post("/failed", authenticateUser, markPaymentFailed);
paymentRouter.get("/orders", authenticateUser, getOrders);

// Registered before /orders/:orderId so "seller" is never read as an order id.
paymentRouter.get("/seller/stats", authenticateSeller, getSellerSalesSummary);
paymentRouter.get("/seller/orders", authenticateSeller, getSellerOrders);
paymentRouter.get(
  "/seller/orders/:orderId",
  authenticateSeller,
  getSellerOrderById,
);

paymentRouter.get("/orders/:orderId", authenticateUser, getOrderById);

export default paymentRouter;
