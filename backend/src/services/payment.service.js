import crypto from "crypto";
import Razorpay from "razorpay";
import config from "../config/config.js";

/**
 * Every call into Razorpay goes through this module. Controllers never import
 * the SDK directly, so swapping in a different gateway (Stripe, Cashfree, PayU)
 * means reimplementing these four functions and nothing else.
 */

let client;

/**
 * Created lazily so importing this module in a test run doesn't require live
 * keys until a payment is actually attempted.
 */
const getClient = () => {
  if (!client) {
    client = new Razorpay({
      key_id: config.RAZOR_PAY_KEY,
      key_secret: config.RAZOR_PAY_SECRET,
    });
  }
  return client;
};

// Razorpay charges in the smallest currency unit — paise for INR, cents for USD.
const SUBUNIT_MULTIPLIER = 100;

export const toSubunits = (amount) => Math.round(amount * SUBUNIT_MULTIPLIER);
export const fromSubunits = (amount) => amount / SUBUNIT_MULTIPLIER;

/**
 * Opens a payment attempt with the gateway.
 * @param {number} amount  major units (rupees), converted here
 * @param {string} currency  ISO code
 * @param {string} receipt  our own order id, echoed back on webhooks
 * @param {object} notes  free-form metadata stored on the gateway's record
 */
export const createPaymentOrder = async ({
  amount,
  currency,
  receipt,
  notes = {},
}) => {
  const order = await getClient().orders.create({
    amount: toSubunits(amount),
    currency,
    receipt,
    notes,
  });

  return order;
};

/**
 * Confirms that a checkout callback really came from Razorpay and was not
 * forged by the browser. The signature is an HMAC of "<order_id>|<payment_id>"
 * keyed with our API secret — which only Razorpay and this server know.
 */
export const verifyPaymentSignature = ({
  razorpayOrderId,
  razorpayPaymentId,
  signature,
}) => {
  if (!razorpayOrderId || !razorpayPaymentId || !signature) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", config.RAZOR_PAY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  return safeCompare(expected, signature);
};

/**
 * Same idea for server-to-server webhooks, except the payload is the entire raw
 * request body and the key is the webhook secret set in the Razorpay dashboard.
 */
export const verifyWebhookSignature = ({ rawBody, signature }) => {
  if (!config.RAZOR_PAY_WEBHOOK_SECRET || !rawBody || !signature) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", config.RAZOR_PAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  return safeCompare(expected, signature);
};

export const fetchPayment = async (paymentId) => {
  return getClient().payments.fetch(paymentId);
};

/**
 * Length-checked constant-time compare — a plain `===` on a signature leaks
 * how many leading bytes matched via timing.
 */
function safeCompare(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}
