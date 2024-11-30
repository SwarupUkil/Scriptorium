import { prisma } from "@/utils/db";
import {NextApiReq, verifyTokenMiddleware} from "@/utils/auth";
import {NextApiResponse} from "next";


async function handler(req: NextApiReq, res: NextApiResponse): Promise<void> {
    if (req.method !== "POST") {
        return res.status(405).send({ message: "Method not allowed" });
    }

    const userId = req.user.id;

    const { id, explanation } = req.body;
    const postId = Number(id);

    if (!id || !explanation) {
        return res.status(400).send({ message: "Missing post ID or explanation" });
    }

    if (isNaN(postId)) {
        return res.status(400).send({ message: "Post ID must be an integer" });
    }

    try {
        const userExists = await prisma.user.findUnique({
            where: { id: userId },
            select: { username: true },
        });

        if (!userExists) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const postExists = await prisma.post.findUnique({
            where: { id: postId },
        });

        if (!postExists) {
            return res.status(400).json({ message: "Invalid post ID" });
        }

        await prisma.report.create({
            data: {
                postId: postId,
                uid: userId,
                username: userExists.username,
                explanation: explanation,
            },
        });

        return res.status(200).json({ message: "Successfully reported post" });
    } catch (error: any) {
        return res.status(500).json({
            message: "An internal server error occurred while reporting the post",
            details: error.message,
        });
    }
}

export default verifyTokenMiddleware(handler);