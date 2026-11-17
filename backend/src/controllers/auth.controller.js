import crypto from "crypto";
import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import { revokeToken } from "../services/token.service.js";

const TOKEN_TTL_DAYS = 7;

/**
 * Cookie policy for the session JWT.
 *
 * httpOnly keeps the token out of reach of any script on the page, so an XSS
 * bug can't walk off with a login. sameSite=lax lets the Google OAuth redirect
 * carry it back; a cross-site frontend needs "none", which browsers only honour
 * alongside secure.
 */
const cookieOptions = () => ({
  httpOnly: true,
  secure: config.IS_PRODUCTION,
  sameSite: config.IS_PRODUCTION ? "none" : "lax",
  maxAge: TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
  path: "/",
});

/**
 * `jti` is what makes every token unique. Without it the payload is just the
 * user id plus second-resolution timestamps, so signing in twice within the
 * same second produces the identical token string — and a token revoked at
 * logout would take the freshly issued one down with it.
 */
const signToken = (user) =>
  jwt.sign({ id: user._id, jti: crypto.randomUUID() }, config.JWT_SECRET, {
    expiresIn: `${TOKEN_TTL_DAYS}d`,
  });

const generateToken = (res, user, message) => {
  const token = signToken(user);
  res.cookie("token", token, cookieOptions());
  res.status(200).json({
    message,
    success: true,
    user: {
      id: user._id,
      email: user.email,
      contact: user.contact,
      fullname: user.fullname,
      role: user.role,
    },
  });
};

export const googleCallback = async (req, res) => {
  try {
    const profile = req.user;
    let user = await userModel.findOne({ email: profile.emails[0].value });

    if (!user) {
      user = new userModel({
        email: profile.emails[0].value,
        fullname: profile.displayName,
        role: "buyer",
        googleId: profile.id,
      });
      await user.save();
    }

    // Same session cookie as the email/password flow.
    res.cookie("token", signToken(user), cookieOptions());

    // The token rides in the httpOnly cookie, never the URL — a JWT in a query
    // string leaks through browser history, referrers and server logs.
    res.redirect(`${config.CLIENT_URL}/auth/callback`);
  } catch (error) {
    console.error("Google authentication error:", error);
    res.redirect(`${config.CLIENT_URL}/login?error=google_auth_failed`);
  }
};

export const register = async (req, res) => {
  const { email, password, contact, fullname, isSeller } = req.body;
  try {
    const existingUser = await userModel.findOne({
      $or: [{ email }, { contact }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new userModel({
      email,
      password,
      contact,
      fullname,
      role: isSeller ? "seller" : "buyer",
    });

    await user.save();
    await generateToken(res, user, "User registered successfully");
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }
    await generateToken(res, user, "Login successful");
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

/**
 * @desc end the session — clear the cookie and revoke the token itself
 * @route POST /api/auth/logout
 * @access Private
 *
 * Clearing the cookie only disarms this browser. The token is added to the
 * Redis revoked list as well, so a copy taken from a shared machine or a proxy
 * log is dead the moment the user signs out rather than days later when it
 * finally expires.
 */
export const logout = async (req, res) => {
  try {
    const revoked = await revokeToken(req.token, req.tokenExp);

    // The cookie goes regardless of what Redis had to say — the person in front
    // of the browser asked to be signed out, and that must always happen.
    res.clearCookie("token", { ...cookieOptions(), maxAge: undefined });

    res.status(200).json({
      message: "Logged out successfully",
      success: true,
      // False means Redis was unreachable: this browser is signed out, but the
      // token would still be accepted elsewhere until it expires.
      revoked,
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error during logout" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User found", user });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ message: "Server error during get current user" });
  }
};
