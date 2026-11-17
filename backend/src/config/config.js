import dotenv from "dotenv";
dotenv.config();

if (!process.env.MONGO_URI) {
  throw new Error(
    "Missing required environment variables. Please check your MongoDB URI",
  );
}

if (!process.env.JWT_SECRET) {
  throw new Error(
    "Missing required environment variables. Please check your JWT secret",
  );
}
if (!process.env.PORT) {
  throw new Error(
    "Missing required environment variables. Please check your PORT",
  );
}

if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error(
    "Missing required environment variables. Please check your Google Client ID",
  );
}

if (!process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error(
    "Missing required environment variables. Please check your Google Client Secret",
  );
}

if (!process.env.RAZOR_PAY_KEY) {
  throw new Error(
    "Missing required environment variables. Please check your Razorpay key",
  );
}

if (!process.env.RAZOR_PAY_SECRET) {
  throw new Error(
    "Missing required environment variables. Please check your Razorpay secret",
  );
}

const isProduction = process.env.NODE_ENV === "production";

// The browser origin this API serves — drives CORS, OAuth redirects and cookie
// policy. Deployments must set it; local development falls back to Vite's port.
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

if (isProduction && !process.env.CLIENT_URL) {
  throw new Error(
    "Missing required environment variables. Please set CLIENT_URL to your deployed frontend origin",
  );
}

const config = {
  NODE_ENV: process.env.NODE_ENV || "development",
  IS_PRODUCTION: isProduction,
  CLIENT_URL,
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  // Where the revoked-token list lives. Optional: without it the API falls back
  // to a local Redis, and without any Redis at all logout still clears the
  // cookie — it just can't kill a token that was already copied elsewhere.
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
  JWT_SECRET: process.env.JWT_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URI: process.env.GOOGLE_CALLBACK_URI,
  IMAGEKIT_PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY,
  IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
  IMAGEKIT_URL_ENDPOINT: process.env.IMAGEKIT_URL_ENDPOINT,
  RAZOR_PAY_KEY: process.env.RAZOR_PAY_KEY,
  RAZOR_PAY_SECRET: process.env.RAZOR_PAY_SECRET,
  RAZOR_PAY_WEBHOOK_SECRET: process.env.RAZOR_PAY_WEBHOOK_SECRET,
};

export default config;
