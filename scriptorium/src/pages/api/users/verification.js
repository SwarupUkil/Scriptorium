import { accountVerification } from "../../../utils/auth";

export default async function handler(req, res) {

  if (req.method === "POST") {
    const { accessToken: accessToken, refreshToken: refreshToken } = req.body;
    
    if (!accessToken || !refreshToken) {
      return res.status(400).json({ error: "Access and refresh token is required" });
    }

    try {
      const accountInfo = accountVerification(accessToken, refreshToken);

      if (!accountInfo) {
        return res.status(401).json({ error: "Invalid or expired tokens or error while verifiying" });
      }

      return res.status(200).json(accountInfo);
    } catch (error) {
      return res.status(500).json({
        error: "Failed to verify account",
        details: error.message,
      });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}