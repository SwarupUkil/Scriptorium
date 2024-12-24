import { prisma } from "@/utils/db";
import { verifyTokenMiddleware } from "@/utils/auth";
import { UserProfile, ErrorResponse } from "@/types/UserTypes";

async function handler(req: any, res: any): Promise<void> {
  if (req.method === "PUT") {
    const { theme } = req.body as Partial<UserProfile>;

    try {

      const existingUser = await prisma.user.findUnique({
        where: { username: req.user.username },
      });

      if (!existingUser) {
        return res.status(400).json({ error: "Username not found." } as ErrorResponse);
      }

      const updatedProfile = await prisma.user.update({
        where: { username: req.user.username },
        data: {
          theme,
        },
        select: {
          theme: true,
        },
      });

      return res.status(200).json({ message: "success"});
    } catch (error: any) {
      return res.status(500).json({ error: "Internal server error updating the user theme", details: error.message } as ErrorResponse);
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}

export default verifyTokenMiddleware(handler);