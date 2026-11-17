import { useDispatch } from "react-redux";
import {
  setSellerOrders,
  setCurrentSellerOrder,
  setSellerOrdersLoading,
  setSellerOrdersError,
  setSellerStats,
  setSellerStatsLoading,
} from "../state/sellerOrder.slice.js";
import {
  getSellerOrders,
  getSellerOrderById,
  getSellerStats,
} from "../services/sellerOrder.api.js";

const messageFrom = (err, fallback) =>
  err?.response?.data?.message || err?.message || fallback;

export const useSellerOrders = () => {
  const dispatch = useDispatch();

  const fetchSellerOrders = async () => {
    dispatch(setSellerOrdersLoading(true));
    dispatch(setSellerOrdersError(null));
    try {
      const res = await getSellerOrders();
      dispatch(setSellerOrders(res.orders || []));
      return res.orders || [];
    } catch (err) {
      dispatch(setSellerOrdersError(messageFrom(err, "Failed to load orders")));
      return [];
    } finally {
      dispatch(setSellerOrdersLoading(false));
    }
  };

  const fetchSellerOrder = async (orderId) => {
    dispatch(setSellerOrdersLoading(true));
    dispatch(setSellerOrdersError(null));
    // Clear the previous order so a slow fetch can't show the last one's
    // shipping address under the new order's heading.
    dispatch(setCurrentSellerOrder(null));
    try {
      const res = await getSellerOrderById(orderId);
      dispatch(setCurrentSellerOrder(res.order));
      return res.order;
    } catch (err) {
      dispatch(
        setSellerOrdersError(messageFrom(err, "Failed to load this order")),
      );
      return null;
    } finally {
      dispatch(setSellerOrdersLoading(false));
    }
  };

  /**
   * The previous figures stay on screen while a new range loads — a dashboard
   * that empties itself every time you change the date range is unreadable.
   */
  const fetchSellerStats = async (days) => {
    dispatch(setSellerStatsLoading(true));
    dispatch(setSellerOrdersError(null));
    try {
      const res = await getSellerStats(days);
      dispatch(setSellerStats(res.summary));
      return res.summary;
    } catch (err) {
      dispatch(
        setSellerOrdersError(messageFrom(err, "Failed to load your sales")),
      );
      return null;
    } finally {
      dispatch(setSellerStatsLoading(false));
    }
  };

  return { fetchSellerOrders, fetchSellerOrder, fetchSellerStats };
};
