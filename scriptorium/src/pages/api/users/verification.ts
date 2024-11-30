import { accountVerification } from "@/utils/auth";
import { AccountVerificationResponse, ErrorResponse } from "@/types/UserTypes";

export default async function handler(req: any, res: any): Promise<void> {
  if (req.method === "POST") {
    const { accessToken, refreshToken } = req.body;

    if (!accessToken || !refreshToken) {
      return res.status(400).json({
        error: "Access and refresh token is required",
      } as ErrorResponse);
    }

    try {
      const accountInfo = accountVerification(accessToken, refreshToken);

      if (!accountInfo) {
        return res.status(401).json({
          error: "Invalid or expired tokens or error while verifying",
        } as ErrorResponse);
      }

      return res.status(200).json(accountInfo as AccountVerificationResponse);
    } catch (error: any) {
      return res.status(500).json({
        error: "Failed to verify account",
        details: error.message,
      } as ErrorResponse);
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}