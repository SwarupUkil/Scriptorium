import {prisma} from "../../../../utils/db";
import { verifyTokenMiddleware } from "../../../../utils/auth";

async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).send({message: "Method not allowed"})
    }

    const user = req.user;
    const userId = user.id;

    const { id, explanation } = req.body;
    const postId = Number(id);

    if (!id || !explanation) {
        return res.status(400).send({message: "Missing post ID or explanation"});
    }

    if (isNaN(postId)) {
        return res.status(400).send({message: "Post ID must be a integer"});
    }

    try {

        const userExists = await prisma.user.findUnique({
            where: { id: userId },
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

        const newReport = await prisma.report.create({
            data: {
                postId: postId,
                uid: userId,
                explanation: explanation,
            },
        });

        return res.status(200).json({message: "Successfully reported post"});
    } catch (error) {
        return res.status(400).json({ message: "An error occurred while reporting the post" });
    }
}

export default verifyTokenMiddleware(handler, "USER");