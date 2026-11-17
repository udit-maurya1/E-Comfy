import jwt from "jsonwebtoken";
import config from "../config/config.js";
import userModel from "../models/user.model.js";
import { isTokenRevoked } from "../services/token.service.js";

/**
 * Resolves the session cookie to a user, or writes the failure response and
 * returns null. Both guards below run exactly the same checks — signature,
 * revocation, then existence — so they live here once.
 */
const resolveSessionUser = async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    res.status(401).json({ message: "Unauthorized: No token provided" });
    return null;
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);

    // A signed-out token stays cryptographically valid until it expires, so the
    // signature check alone is not enough — ask the revoked list too.
    if (await isTokenRevoked(token)) {
      res.status(401).json({ message: "Unauthorized: Session has ended" });
      return null;
    }

    const user = await userModel.findById(decoded.id);
    if (!user) {
      res.status(401).json({ message: "Unauthorized: User not found" });
      return null;
    }

    // Kept on the request so a logout later in the chain can revoke this exact
    // token without parsing the cookie a second time.
    req.token = token;
    req.tokenExp = decoded.exp;
    return user;
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "Unauthorized: Invalid token" });
    return null;
  }
};

export const authenticateSeller = async (req, res, next) => {
  const user = await resolveSessionUser(req, res);
  if (!user) return;

  if (user.role != "seller") {
    return res.status(403).json({ message: "Forbidden: User is not a seller" });
  }

  req.user = user; // Attach user to request object for downstream use
  next();
};

export const authenticateUser = async (req, res, next) => {
  const user = await resolveSessionUser(req, res);
  if (!user) return;

  req.user = user; // Attach user to request object for downstream use
  next();
};
