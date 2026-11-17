import app from "./src/app.js";
import config from "./src/config/config.js";
import connectDB from "./src/config/db.js";
import { connectRedis } from "./src/config/redis.js";

// Connect to MongoDB
connectDB();

// Connect to Redis — holds the revoked-token list behind logout. A failure here
// is logged, not fatal: the store keeps serving with plain JWT expiry.
connectRedis();

const PORT = config.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
