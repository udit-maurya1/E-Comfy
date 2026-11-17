const workerId = process.env.VITEST_WORKER_ID || "1";
process.env.MONGO_URI = `mongodb://localhost:27017/ecomfy_test_${workerId}`;
// A numbered Redis database per worker, never 0 — the suite flushes what it
// uses, and db 0 is where a developer's own server keeps its sessions.
process.env.REDIS_URL = `redis://localhost:6379/${(Number(workerId) % 15) + 1}`;
process.env.PORT = "8081";
process.env.JWT_SECRET = "test_jwt_secret_key";
process.env.GOOGLE_CLIENT_ID = "test_google_client_id";
process.env.GOOGLE_CLIENT_SECRET = "test_google_client_secret";
process.env.RAZOR_PAY_KEY = "rzp_test_key";
process.env.RAZOR_PAY_SECRET = "test_razorpay_secret";
process.env.RAZOR_PAY_WEBHOOK_SECRET = "test_razorpay_webhook_secret";
