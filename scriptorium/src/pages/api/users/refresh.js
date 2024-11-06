import { refreshAccessToken } from "../../../utils/auth";

export default async function handler(req, res) {

  if (req.method === "POST") {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token is required" });
    }

    try {
      const newAccessToken = refreshAccessToken(refreshToken);

      if (!newAccessToken) {
        return res.status(401).json({ error: "Invalid or expired refresh token" });
      }

      return res.status(200).json({
        accessToken: newAccessToken,
      });
    } catch (error) {
      return res.status(500).json({
        error: "Failed to refresh token",
        details: error.message,
      });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}