import mongoose from "mongoose";
import priceSchema from "./price.schema.js";

/**
 * A frozen copy of the delivery address as it read the moment the order was
 * placed. Orders must never re-read the Address collection — the buyer editing
 * or deleting a saved address cannot be allowed to rewrite shipping history.
 */
const shippingAddressSchema = new mongoose.Schema(
  {
    address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
    },
    fullname: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: "India" },
  },
  { _id: false },
);

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variant: {
      type: mongoose.Schema.Types.ObjectId,
    },
    // Title and image are snapshotted too, so an order stays readable after a
    // seller renames or deletes the product.
    title: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    attributes: {
      type: Map,
      of: String,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: priceSchema,
      required: true,
    },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },
    subtotal: {
      type: priceSchema,
      required: true,
    },
    shipping: {
      type: priceSchema,
      required: true,
    },
    tax: {
      type: priceSchema,
      required: true,
    },
    total: {
      type: priceSchema,
      required: true,
    },
    // Lifecycle of the goods, independent of the money.
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    payment: {
      provider: {
        type: String,
        default: "razorpay",
      },
      status: {
        type: String,
        enum: ["created", "paid", "failed", "refunded"],
        default: "created",
      },
      // Razorpay's order id (order_xxx) — unique so a webhook and the browser
      // callback can both resolve the same order without racing to create two.
      razorpayOrderId: {
        type: String,
        index: true,
      },
      razorpayPaymentId: {
        type: String,
      },
      razorpaySignature: {
        type: String,
      },
      method: {
        type: String,
      },
      paidAt: {
        type: Date,
      },
      failureReason: {
        type: String,
      },
    },
  },
  {
    timestamps: true,
  },
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
