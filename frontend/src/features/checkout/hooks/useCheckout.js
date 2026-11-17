import { useDispatch } from "react-redux";
import {
  setOrders,
  setCurrentOrder,
  setStatus,
  setLoading,
  setError,
} from "../state/order.slice.js";
import {
  createPaymentOrder,
  verifyPayment,
  markPaymentFailed,
  getOrders as getOrdersApi,
  getOrderById as getOrderByIdApi,
} from "../services/payment.api.js";

const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

const messageFrom = (err, fallback) =>
  err?.response?.data?.message || err?.message || fallback;

/**
 * Injects Razorpay's checkout script on first use and resolves once it's ready.
 * Loading it lazily keeps it off the critical path for buyers who never reach
 * checkout, and re-uses the same tag on repeat attempts.
 */
const loadRazorpayScript = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(window.Razorpay);
      return;
    }

    const existing = document.querySelector(`script[src="${RAZORPAY_SCRIPT}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(window.Razorpay));
      existing.addEventListener("error", () =>
        reject(new Error("Could not load the payment gateway")),
      );
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT;
    script.async = true;
    script.onload = () => resolve(window.Razorpay);
    script.onerror = () =>
      reject(new Error("Could not load the payment gateway"));
    document.body.appendChild(script);
  });

export const useCheckout = () => {
  const dispatch = useDispatch();

  /**
   * Runs the whole payment: ask the server for an order, open the Razorpay
   * modal, then hand the signed result back for verification.
   *
   * The amount is never passed in from here — the server derives it from the
   * cart, so a tampered client can't discount its own order.
   */
  const startPayment = async ({ addressId, user, onSuccess }) => {
    dispatch(setError(null));
    dispatch(setStatus("creating"));
    dispatch(setLoading(true));

    let checkout;
    try {
      const Razorpay = await loadRazorpayScript();
      const res = await createPaymentOrder(addressId);
      checkout = res.checkout;
      dispatch(setCurrentOrder(res.order));

      const rzp = new Razorpay({
        key: checkout.key,
        amount: checkout.amount,
        currency: checkout.currency,
        order_id: checkout.razorpayOrderId,
        name: "ECOMFY",
        description: "Order payment",
        prefill: {
          name: user?.fullname || "",
          email: user?.email || "",
          contact: user?.contact || "",
        },
        notes: { orderId: checkout.orderId },
        theme: { color: "#F5C518" },

        handler: async (response) => {
          dispatch(setStatus("processing"));
          try {
            const verified = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            dispatch(setCurrentOrder(verified.order));
            dispatch(setStatus("success"));
            if (onSuccess) onSuccess(verified.order);
          } catch (err) {
            dispatch(setStatus("failed"));
            dispatch(
              setError(
                messageFrom(
                  err,
                  "We couldn't confirm your payment. If money was debited it will be reconciled shortly.",
                ),
              ),
            );
          } finally {
            dispatch(setLoading(false));
          }
        },

        modal: {
          // Buyer closed the modal without paying — release the pending order so
          // it doesn't sit around looking like an unpaid obligation.
          ondismiss: async () => {
            dispatch(setStatus("idle"));
            dispatch(setLoading(false));
            try {
              await markPaymentFailed(
                checkout.razorpayOrderId,
                "Checkout closed by user",
              );
            } catch {
              // Non-critical: the webhook will settle the order's fate anyway.
            }
          },
        },
      });

      rzp.on("payment.failed", async (response) => {
        dispatch(setStatus("failed"));
        dispatch(setLoading(false));
        dispatch(
          setError(response?.error?.description || "Your payment failed"),
        );
        try {
          await markPaymentFailed(
            checkout.razorpayOrderId,
            response?.error?.description,
          );
        } catch {
          // Non-critical — see above.
        }
      });

      rzp.open();
    } catch (err) {
      dispatch(setStatus("failed"));
      dispatch(setLoading(false));
      dispatch(setError(messageFrom(err, "Could not start the payment")));
      throw err;
    }
  };

  const fetchOrders = async () => {
    dispatch(setLoading(true));
    try {
      const res = await getOrdersApi();
      dispatch(setOrders(res.orders || []));
      return res.orders || [];
    } catch (err) {
      dispatch(setError(messageFrom(err, "Failed to load your orders")));
      return [];
    } finally {
      dispatch(setLoading(false));
    }
  };

  const fetchOrder = async (orderId) => {
    dispatch(setLoading(true));
    try {
      const res = await getOrderByIdApi(orderId);
      dispatch(setCurrentOrder(res.order));
      return res.order;
    } catch (err) {
      dispatch(setError(messageFrom(err, "Failed to load this order")));
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  };

  return { startPayment, fetchOrders, fetchOrder };
};
