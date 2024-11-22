import { prisma } from "../../../utils/db";
import { hashPassword } from "../../../utils/auth";

const profileImages = JSON.parse(process.env.PROFILE_IMAGES);

export default async function handler(req, res) {

  if (req.method === "POST") {
    const { username, password, type = "USER", firstName, lastName, email, pfpURL, phoneNumber, theme } = req.body;

    if (!username || !password || !email || !firstName || !lastName ) {
      return res.status(400).json({
        error: "Need all these fields filled: username, password, firstName, lastName, and/or email",
      });
    }

    try {
      let existingUser = await prisma.user.findUnique({
        where: { username },
      });

      if (existingUser) {
        return res.status(400).json({ error: "Username already registered." });
      }

      existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({ error: "Email already registered." });
      }

      if (pfpURL) {
        if (!profileImages.includes(pfpURL)) {
          return res.status(400).json({ error: "Profile image doesn't exist." });
        }
      }

      const hashedPassword = await hashPassword(password);

      await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          type,
          firstName,
          lastName,
          email,
          pfpURL: pfpURL || null,
          phoneNumber: phoneNumber || null,
          theme: theme
        },
      });

      return res.status(201).json({
        message: "User registered successfully.",
      });
    } catch (error) {
      return res.status(500).json({
        error: "Failed to register user",
        details: error.message,
      });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}