import { prisma } from "../../../utils/db";
import { verifyTokenMiddleware } from "../../../utils/auth";

const profileImages = JSON.parse(process.env.PROFILE_IMAGES);

async function handler(req, res) {

  if (req.method === "PUT") {
    const { username, firstName, lastName, email, pfpURL, phoneNumber, theme } = req.body;

    try {
      if (!username || !email || !firstName || !lastName ) {
        return res.status(400).json({
          error: "Need all these fields filled: username, password, firstName, lastName, and/or email",
        });
      }

      const existingUser = await prisma.user.findUnique({
        where: { username: req.user.username },
      });

      if (!existingUser) {
        return res.status(400).json({ error: "Username not found." });
      }

      if (req.user.username !== username) {
        const existingUsername = await prisma.user.findUnique({
          where: { username },
        });

        if (existingUsername) {
          return res.status(400).json({ error: "Username already registered." });
        }
      }

      if (existingUser.email !== email) {
        const existingEmail = await prisma.user.findUnique({
          where: { email },
        });

        if (existingEmail) {
          return res.status(400).json({ error: "Email already registered." });
        }
      }

      if (pfpURL) {
        if (!profileImages.includes(pfpURL)) {
          return res.status(400).json({ error: "Profile image doesn't exist." });
        }
      }

      const updatedProfile = await prisma.user.update({
        where: { username},
        data: {
          firstName,
          lastName,
          email,
          pfpURL: pfpURL || undefined,
          phoneNumber: phoneNumber || undefined,
          theme: theme
        },
        select: {
          username: true,
          firstName: true,
          lastName: true,
          email: true,
          pfpURL: true,
          phoneNumber: true,
          theme: true,
        },
      });

      return res.status(200).json(updatedProfile);
    } catch (error) {
      return res.status(500).json({ error: "Internal server error updating the user profile", details: error.message });
    }
  } 
  else if (req.method === "GET") {
    const { username } = req.user;
    try {
      if (!username) {
        return res.status(400).json({
          error: "Need username",
        });
      }

      const existingUser = await prisma.user.findUnique({
        where: { username },
      });

      if (!existingUser) {
        return res.status(400).json({ error: "Username not found." });
      }

      return res.status(200).json(existingUser);
    } catch (error) {
      return res.status(500).json({ error: "Internal server error getting the user profile", details: error.message });
    }
  }
  else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}

export default verifyTokenMiddleware(handler);
