import { createClient } from "redis";
import config from "./config.js";

/**
 * Redis holds the revoked-token list that gives logout real teeth: a JWT is
 * valid until it expires, so signing out has to be recorded somewhere the next
 * request will look. Redis is the right home for it — the entries expire by
 * themselves exactly when the tokens do, so the list can never grow unbounded.
 */
const client = createClient({
  url: config.REDIS_URL,
  socket: {
    // Back off, but never give up — a restarted Redis should be picked up again
    // without restarting the API.
    reconnectStrategy: (retries) => Math.min(retries * 200, 5000),
  },
});

// The client re-emits on every reconnect attempt; logging each one would bury
// the server output, so only the transition into a broken state is reported.
let errorLogged = false;

client.on("error", (error) => {
  if (!errorLogged) {
    console.error("Redis connection error:", error.message);
    errorLogged = true;
  }
});

client.on("ready", () => {
  errorLogged = false;
  console.log("Redis connected successfully");
});

// One in-flight connect shared by every caller — token.service.js awaits this
// before each command, so the client opens on first use whether or not the
// process went through server.js (the test suite imports app.js directly).
let connecting = null;

/**
 * Unlike Mongo, a missing Redis does not stop the server booting. The store
 * still works; it just falls back to plain JWT expiry, which is logged loudly
 * by the caller of every helper in token.service.js.
 */
export const connectRedis = async () => {
  if (client.isOpen) return;

  if (!connecting) {
    connecting = client.connect().catch((error) => {
      console.error("Redis connection failed:", error.message);
      // Clear the memo so a later request can try again — Redis may just have
      // been slower to start than the API.
      connecting = null;
    });
  }

  await connecting;
};

export const disconnectRedis = async () => {
  connecting = null;
  if (client.isOpen) {
    await client.close();
  }
};

export default client;
