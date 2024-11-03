import { prisma } from "../../../utils/db"
import { comparePassword, generateToken } from "../../../utils/auth";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: "Username and password are required.",
      });
    }

    try {
      const user = await prisma.user.findUnique({ where: { username } });

      if (!user) {
        return res.status(401).json({ error: "Invalid credentials." });
      }

      const isPasswordValid = await comparePassword(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid credentials." });
      }

      const payload = {
        username: user.username,
        type: user.type,
        id: user.id,
      };

      const accessToken = generateToken(payload);
      const refreshToken = generateToken(payload, "refresh");

      return res.status(200).json({
        accessToken,
        refreshToken,
      });
    } catch (error) {
      return res.status(500).json({
        error: "Login failed",
        details: error.message,
      });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}