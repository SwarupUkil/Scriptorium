import bcrypt from "bcrypt";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";

const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10");
const JWT_SECRET = process.env.JWT_SECRET as Secret;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as Secret;
const REFRESH_EXPIRES_IN = process.env.REFRESH_EXPIRES_IN;

interface JwtTokenPayload extends JwtPayload {
  username: string;
  type: string;
  id: number;
}

interface VerifiedTokenResponse {
  accessToken: string;
  refreshToken: string;
  accountType: string;
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export function generateToken(obj: Record<string, any>, type: "access" | "refresh" = "access"): string {
  const secret = type === "refresh" ? REFRESH_TOKEN_SECRET : JWT_SECRET;
  const expiresIn = type === "refresh" ? REFRESH_EXPIRES_IN : JWT_EXPIRES_IN;

  return jwt.sign(obj, secret, { expiresIn });
}

export function verifyToken(token: string): JwtTokenPayload | null {
  if (token?.startsWith("Bearer ")) {
    token = token.split(" ")[1];
  }

  try {
    return jwt.verify(token, JWT_SECRET) as JwtTokenPayload;
  } catch {
    return null;
  }
}

export function verifyTokenMiddleware(
    handler: (req: any, res: any) => Promise<any>,
    requiredType: string | null = null
): (req: any, res: any) => Promise<any> {
  return async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtTokenPayload;

      if (requiredType && decoded.type !== requiredType) {
        return res.status(403).json({ error: "Forbidden: Access denied" });
      }

      req.user = decoded;
      return handler(req, res);
    } catch {
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
  };
}

export function refreshAccessToken(refreshToken: string): string | null {
  try {
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as JwtTokenPayload;

    const { username, type, id } = decoded;
    return jwt.sign({ username, type, id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  } catch {
    return null;
  }
}

export function accountVerification(accessToken: string, refreshToken: string): VerifiedTokenResponse | null {
  const accessPayload = verifyToken(accessToken);

  if (accessPayload) {
    return {
      accessToken,
      refreshToken,
      accountType: accessPayload.type,
    };
  }

  const newAccessToken = refreshAccessToken(refreshToken);

  if (newAccessToken) {
    const newAccessPayload = verifyToken(newAccessToken);
    if (newAccessPayload) {
      return {
        accessToken: newAccessToken,
        refreshToken,
        accountType: newAccessPayload.type,
      };
    }
  }

  return null;
}