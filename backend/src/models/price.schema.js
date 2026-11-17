import mongoose from "mongoose";

const priceSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      enum: ["USD", "EUR", "GBP", "JPY", "INR"], // Add more currencies as needed
      default: "INR",
    },
  },
  {
    _id: false,
    __v: false, // Disable the __v field
  },
);

export default priceSchema;
