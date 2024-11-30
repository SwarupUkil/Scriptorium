import { prisma } from "@/utils/db";
import { hashPassword } from "@/utils/auth";
import { SignupFormData, SignupSuccessResponse, SignupErrorResponse, ErrorResponse } from "@/types/UserTypes";

const profileImages: string[] = JSON.parse(process.env.PROFILE_IMAGES || "[]");

export default async function handler(req: any, res: any): Promise<void> {
  if (req.method === "POST") {
    const { username, password, type = "USER", firstName, lastName, email, pfpURL, phoneNumber, theme } = req.body as SignupFormData & {type: string};

    if (!username || !password || !email || !firstName || !lastName) {
      return res.status(400).json({
        error: "Need all these fields filled: username, password, firstName, lastName, and/or email",
      } as SignupErrorResponse);
    }

    try {
      const existingUsername = await prisma.user.findUnique({ where: { username } });
      if (existingUsername) {
        return res.status(400).json({ error: "Username already registered." } as SignupErrorResponse);
      }

      const existingEmail = await prisma.user.findUnique({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({ error: "Email already registered." } as SignupErrorResponse);
      }

      if (pfpURL && !profileImages.includes(pfpURL)) {
        return res.status(400).json({ error: "Profile image doesn't exist." } as SignupErrorResponse);
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
          theme,
        },
      });

      return res.status(201).json({ message: "User registered successfully." } as SignupSuccessResponse);
    } catch (error: any) {
      return res.status(500).json({
        error: "Failed to register user",
        details: error.message,
      } as ErrorResponse);
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}