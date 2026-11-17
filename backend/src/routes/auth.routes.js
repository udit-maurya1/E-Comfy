import { Router } from "express";
import {
  login,
  register,
  googleCallback,
  getMe,
  logout,
} from "../controllers/auth.controller.js";
import {
  registerValidation,
  loginValidation,
} from "../validator/auth.validator.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import config from "../config/config.js";
import passport from "passport";

const router = Router();

router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false, // no session — we use JWTs
  }),
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${config.CLIENT_URL}/login`,
    session: false, // no session — we use JWTs
  }),
  googleCallback,
);
router.get("/me", authenticateUser, getMe);
router.post("/logout", authenticateUser, logout);

export default router;
