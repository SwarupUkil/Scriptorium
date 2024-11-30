import { prisma } from "@/utils/db";
import { comparePassword, generateToken } from "@/utils/auth";
import { LoginFormData, LoginSuccessResponse, LoginErrorResponse } from "@/types/UserTypes";

export default async function handler(req: any, res: any): Promise<void> {
  if (req.method === "POST") {
    const { username, password } = req.body as LoginFormData;

    if (!username || !password) {
      return res.status(400).json({
        error: "Username and password are required.",
      } as LoginErrorResponse);
    }

    try {
      const user = await prisma.user.findUnique({ where: { username } });

      if (!user) {
        return res.status(401).json({ error: "Invalid credentials." } as LoginErrorResponse);
      }

      const isPasswordValid = await comparePassword(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid credentials." } as LoginErrorResponse);
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
      } as LoginSuccessResponse);
    } catch (error: any) {
      return res.status(500).json({
        error: "Login failed",
        details: error.message,
      } as LoginErrorResponse);
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}