import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS);
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const REFRESH_EXPIRES_IN = process.env.REFRESH_EXPIRES_IN;

export async function hashPassword(password) {
  return await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

export async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

export function generateToken(obj, type = "access") {
  const secret = type === "refresh" ? REFRESH_TOKEN_SECRET : JWT_SECRET;

  const expiresIn = type === "refresh" ? REFRESH_EXPIRES_IN : JWT_EXPIRES_IN;

  return jwt.sign(obj, secret, {
    expiresIn: expiresIn,
  });
}

export function verifyToken(token) {
  if (!token?.startsWith("Bearer ")) {
    return null;
  }

  token = token.split(" ")[1];

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

export function verifyTokenMiddleware(handler, requiredType = null) {
  return async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET);

      if (requiredType && decoded.type !== requiredType) {
        return res.status(403).json({ error: "Forbidden: Access denied" });
      }

      req.user = decoded;
      return handler(req, res);
    } catch (error) {
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
  };
}

export function refreshAccessToken(refreshToken) {
  try {
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

    const { username, type } = decoded;
    const newAccessToken = jwt.sign(
      { username, type },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return newAccessToken;
  } catch (error) {
    return null;
  }
}
