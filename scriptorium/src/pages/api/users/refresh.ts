import { refreshAccessToken } from "@/utils/auth";
import { RefreshTokenResponse, RefreshTokenErrorResponse, ErrorResponse } from "@/types/UserTypes";

export default async function handler(req: any, res: any): Promise<void> {
  if (req.method === "POST") {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token is required" } as RefreshTokenErrorResponse);
    }

    try {
      const newAccessToken = refreshAccessToken(refreshToken);

      if (!newAccessToken) {
        return res.status(401).json({ error: "Invalid or expired refresh token" } as RefreshTokenErrorResponse);
      }

      return res.status(200).json({ accessToken: newAccessToken } as RefreshTokenResponse);
    } catch (error: any) {
      return res.status(500).json({
        error: "Failed to refresh token",
        details: error.message,
      } as ErrorResponse);
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}