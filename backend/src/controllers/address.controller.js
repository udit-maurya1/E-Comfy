import Address from "../models/address.model.js";
import commerce from "../config/commerce.js";

const EDITABLE_FIELDS = [
  "fullname",
  "phone",
  "line1",
  "line2",
  "city",
  "state",
  "pincode",
  "country",
  "label",
];

/**
 * Clears the default flag on every other address of this user, so exactly one
 * address is ever marked default.
 */
const clearOtherDefaults = async (userId, keepId) => {
  await Address.updateMany(
    { user: userId, _id: { $ne: keepId }, isDefault: true },
    { $set: { isDefault: false } },
  );
};

/**
 * @desc list all saved addresses of the logged-in user
 * @route GET /api/address
 * @access Private
 */
export const getAddresses = async (req, res) => {
  try {
    const userId = req.user._id;
    const addresses = await Address.find({ user: userId }).sort({
      isDefault: -1,
      updatedAt: -1,
    });

    return res.status(200).json({ addresses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @desc add a new address to the user's address book
 * @route POST /api/address
 * @access Private
 */
export const createAddress = async (req, res) => {
  try {
    const userId = req.user._id;

    const count = await Address.countDocuments({ user: userId });
    if (count >= commerce.MAX_ADDRESSES_PER_USER) {
      return res.status(400).json({
        message: `You can save at most ${commerce.MAX_ADDRESSES_PER_USER} addresses`,
      });
    }

    const address = new Address({
      user: userId,
      fullname: req.body.fullname,
      phone: req.body.phone,
      line1: req.body.line1,
      line2: req.body.line2,
      city: req.body.city,
      state: req.body.state,
      pincode: req.body.pincode,
      country: req.body.country || "India",
      label: req.body.label || "home",
      // The very first address a user saves becomes their default.
      isDefault: count === 0 ? true : Boolean(req.body.isDefault),
    });

    await address.save();

    if (address.isDefault) {
      await clearOtherDefaults(userId, address._id);
    }

    return res.status(201).json({ message: "Address added", address });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @desc update one of the user's saved addresses
 * @route PUT /api/address/:addressId
 * @access Private
 */
export const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const userId = req.user._id;

    const address = await Address.findOne({ _id: addressId, user: userId });
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    for (const field of EDITABLE_FIELDS) {
      if (req.body[field] !== undefined) {
        address[field] = req.body[field];
      }
    }

    // A user may promote an address to default, but may not un-default the only
    // default they have — something always has to be pre-selected at checkout.
    if (req.body.isDefault === true) {
      address.isDefault = true;
    }

    await address.save();

    if (address.isDefault) {
      await clearOtherDefaults(userId, address._id);
    }

    return res.status(200).json({ message: "Address updated", address });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @desc delete a saved address
 * @route DELETE /api/address/:addressId
 * @access Private
 */
export const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const userId = req.user._id;

    const address = await Address.findOneAndDelete({
      _id: addressId,
      user: userId,
    });
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    // Deleting the default promotes the next most recent address, so the user
    // never ends up with a book full of addresses and nothing pre-selected.
    if (address.isDefault) {
      const next = await Address.findOne({ user: userId }).sort({
        updatedAt: -1,
      });
      if (next) {
        next.isDefault = true;
        await next.save();
      }
    }

    return res.status(200).json({ message: "Address deleted", addressId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @desc mark an address as the default one
 * @route PATCH /api/address/:addressId/default
 * @access Private
 */
export const setDefaultAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const userId = req.user._id;

    const address = await Address.findOne({ _id: addressId, user: userId });
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    address.isDefault = true;
    await address.save();
    await clearOtherDefaults(userId, address._id);

    return res.status(200).json({ message: "Default address updated", address });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
