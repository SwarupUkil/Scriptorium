import { prisma } from "../../../utils/db";
import { verifyTokenMiddleware } from "../../../utils/auth";
import {AUTH} from "../../../utils/validationConstants";

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
        where: { username },
      });

      if (!existingUser) {
        return res.status(400).json({ error: "Username not found." });
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
      });

      return res.status(200).json(updatedProfile);
    } catch (error) {
      return res.status(500).json({ error: "Error updating the user profile", details: error.message });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}

export default verifyTokenMiddleware(handler, AUTH.USER);
