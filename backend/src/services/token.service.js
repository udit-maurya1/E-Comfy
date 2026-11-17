import crypto from "crypto";
import redis, { connectRedis } from "../config/redis.js";

const REVOKED_PREFIX = "revoked_token:";

/**
 * Tokens are keyed by hash, never stored raw. A dump of the Redis keyspace is
 * then useless to an attacker — the key proves a token was revoked without
 * being a token anyone can replay.
 */
const keyFor = (token) =>
  REVOKED_PREFIX + crypto.createHash("sha256").update(token).digest("hex");

/**
 * Adds a token to the revoked list until the moment it would have expired
 * anyway. `expiresAt` is the JWT's own `exp` claim, in seconds.
 *
 * Returns false when Redis is unreachable, so the caller can tell the
 * difference between "this token is dead" and "we couldn't record that".
 */
export const revokeToken = async (token, expiresAt) => {
  const ttl = Math.ceil(expiresAt - Date.now() / 1000);

  // Already expired — the token is unusable on its own, nothing to store.
  if (!Number.isFinite(ttl) || ttl <= 0) {
    return true;
  }

  try {
    await connectRedis();
    await redis.set(keyFor(token), "1", { EX: ttl });
    return true;
  } catch (error) {
    console.error("Failed to revoke token in Redis:", error.message);
    return false;
  }
};

/**
 * Whether a token has been signed out.
 *
 * A Redis outage answers "not revoked" rather than locking every user out of
 * the store: revocation is a hardening measure on top of JWT expiry, and losing
 * it degrades to the behaviour we had before it existed. The failure is logged
 * so it can't pass unnoticed.
 */
export const isTokenRevoked = async (token) => {
  try {
    await connectRedis();
    return (await redis.exists(keyFor(token))) === 1;
  } catch (error) {
    console.error("Failed to read the revoked-token list:", error.message);
    return false;
  }
};
