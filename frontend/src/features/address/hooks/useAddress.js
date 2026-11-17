import { useDispatch } from "react-redux";
import {
  setAddresses,
  addAddress,
  updateAddress,
  removeAddress,
  markDefault,
  selectAddress,
  setLoading,
  setError,
} from "../state/address.slice.js";
import {
  getAddresses as getAddressesApi,
  createAddress as createAddressApi,
  updateAddress as updateAddressApi,
  deleteAddress as deleteAddressApi,
  setDefaultAddress as setDefaultAddressApi,
} from "../services/address.api.js";

const messageFrom = (err, fallback) =>
  err?.response?.data?.errors?.[0]?.msg ||
  err?.response?.data?.message ||
  err?.message ||
  fallback;

export const useAddress = () => {
  const dispatch = useDispatch();

  const fetchAddresses = async () => {
    dispatch(setLoading(true));
    try {
      const res = await getAddressesApi();
      dispatch(setAddresses(res.addresses || []));
      return res.addresses || [];
    } catch (err) {
      dispatch(setError(messageFrom(err, "Failed to load addresses")));
      return [];
    } finally {
      dispatch(setLoading(false));
    }
  };

  const saveAddress = async (address) => {
    dispatch(setLoading(true));
    try {
      const res = await createAddressApi(address);
      dispatch(addAddress(res.address));
      // A new default demotes the others — refetch so the list stays truthful.
      if (res.address?.isDefault) {
        dispatch(markDefault(res.address._id));
      }
      return res.address;
    } catch (err) {
      const msg = messageFrom(err, "Failed to save address");
      dispatch(setError(msg));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const editAddress = async (addressId, address) => {
    dispatch(setLoading(true));
    try {
      const res = await updateAddressApi(addressId, address);
      dispatch(updateAddress(res.address));
      if (res.address?.isDefault) {
        dispatch(markDefault(res.address._id));
      }
      return res.address;
    } catch (err) {
      const msg = messageFrom(err, "Failed to update address");
      dispatch(setError(msg));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const deleteAddress = async (addressId) => {
    dispatch(setLoading(true));
    try {
      await deleteAddressApi(addressId);
      dispatch(removeAddress(addressId));
    } catch (err) {
      const msg = messageFrom(err, "Failed to delete address");
      dispatch(setError(msg));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const makeDefault = async (addressId) => {
    // Flip it locally first — the radio should respond instantly.
    dispatch(markDefault(addressId));
    try {
      await setDefaultAddressApi(addressId);
    } catch (err) {
      dispatch(setError(messageFrom(err, "Failed to set default address")));
      await fetchAddresses();
    }
  };

  const chooseAddress = (addressId) => dispatch(selectAddress(addressId));

  return {
    fetchAddresses,
    saveAddress,
    editAddress,
    deleteAddress,
    makeDefault,
    chooseAddress,
  };
};
