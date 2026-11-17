import { Router } from "express";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../controllers/address.controller.js";
import {
  createAddressValidation,
  updateAddressValidation,
} from "../validator/address.validator.js";

const addressRouter = Router();

addressRouter.get("/", authenticateUser, getAddresses);
addressRouter.post("/", authenticateUser, createAddressValidation, createAddress);
addressRouter.put(
  "/:addressId",
  authenticateUser,
  updateAddressValidation,
  updateAddress,
);
addressRouter.delete("/:addressId", authenticateUser, deleteAddress);
addressRouter.patch("/:addressId/default", authenticateUser, setDefaultAddress);

export default addressRouter;
