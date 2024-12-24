import { prisma } from "@/utils/db";
import { verifyTokenMiddleware } from "@/utils/auth";
import { UserProfile, UpdateProfileResponse, ErrorResponse } from "@/types/UserTypes";
import {THEME} from "@/utils/validateConstants";

const profileImages: string[] = JSON.parse(process.env.PROFILE_IMAGES || "[]");

async function handler(req: any, res: any): Promise<void> {
  if (req.method === "PUT") {
    const { username, firstName, lastName, email, pfpURL, phoneNumber, theme } = req.body as Partial<UserProfile>;

    try {
      if (!username || !email || !firstName || !lastName) {
        return res.status(400).json({
          error: "Need all these fields filled: username, firstName, lastName, and/or email",
        } as ErrorResponse);
      }

      const existingUser = await prisma.user.findUnique({
        where: { username: req.user.username },
      });

      if (!existingUser) {
        return res.status(400).json({ error: "Username not found." } as ErrorResponse);
      }

      if (req.user.username !== username) {
        const existingUsername = await prisma.user.findUnique({
          where: { username },
        });

        if (existingUsername) {
          return res.status(400).json({ error: "Username already registered." } as ErrorResponse);
        }
      }

      if (existingUser.email !== email) {
        const existingEmail = await prisma.user.findUnique({
          where: { email },
        });

        if (existingEmail) {
          return res.status(400).json({ error: "Email already registered." } as ErrorResponse);
        }
      }

      if (pfpURL && !profileImages.includes(pfpURL)) {
        return res.status(400).json({ error: "Profile image doesn't exist." } as ErrorResponse);
      }

      if (theme && !Object.values(THEME).includes(theme)) {
        return res.status(400).json({ error: "Invalid theme value." } as ErrorResponse);
      }

      const updatedProfile = await prisma.user.update({
        where: { username },
        data: {
          firstName,
          lastName,
          email,
          pfpURL: pfpURL || undefined,
          phoneNumber: phoneNumber || undefined,
          theme,
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

      return res.status(200).json(updatedProfile as UpdateProfileResponse);
    } catch (error: any) {
      return res.status(500).json({ error: "Internal server error updating the user profile", details: error.message } as ErrorResponse);
    }
  } else if (req.method === "GET") {
    const { username } = req.user;
    try {
      if (!username) {
        return res.status(400).json({
          error: "Need username",
        } as ErrorResponse);
      }

      const existingUser = await prisma.user.findUnique({
        where: { username },
      });

      if (!existingUser) {
        return res.status(400).json({ error: "Username not found." } as ErrorResponse);
      }

      return res.status(200).json(existingUser as UserProfile);
    } catch (error: any) {
      return res.status(500).json({ error: "Internal server error getting the user profile", details: error.message } as ErrorResponse);
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}

export default verifyTokenMiddleware(handler);