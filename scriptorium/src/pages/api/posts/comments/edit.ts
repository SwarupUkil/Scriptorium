import { prisma } from "@/utils/db";
import { verifyTokenMiddleware } from "@/utils/auth";
import { AUTH, MAX_COMMENT_DESCRIPTION, POST } from "@/utils/validateConstants";
import { NextApiRequest, NextApiResponse } from "next";

interface UpdateCommentRequest extends NextApiRequest {
    body: {
        id: number; // Comment (Post) ID
        description?: string; // Updated comment content (optional)
    };
    user: {
        id: number; // User ID
    };
}

async function handler(req: NextApiRequest, res: NextApiResponse) {

    if (req.method !== "PUT" && req.method !== "DELETE") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const { id, description } = req.body as { id: number; description?: string };
    const commentId = Number(id);

    if (!id) {
        return res.status(404).json({ error: "Invalid ID: missing comment ID" });
    }

    if (isNaN(commentId)) {
        return res.status(400).json({ error: "Invalid ID: not a number" });
    }

    const user = (req as UpdateCommentRequest).user;
    const userId = user.id;

    // Check if the comment exists and belongs to the user
    try {
        const comment = await prisma.post.findUnique({
            where: { id: commentId },
            select: { uid: true, type: true },
        });

        if (!comment || comment.uid !== userId || comment.type !== POST.COMMENT) {
            return res.status(401).json({ message: "Unauthorized or Comment not found." });
        }
    } catch (error) {
        return res.status(500).json({ message: "An internal server error occurred while checking the comment." });
    }

    if (req.method === "PUT") {

        if (!description) {
            return res.status(404).json({ error: "Invalid description" });
        }

        if (description.length > MAX_COMMENT_DESCRIPTION) {
            return res.status(400).json({ error: `Description is too large (<${MAX_COMMENT_DESCRIPTION} characters)` });
        }

        try {
            // Update the comment (Post content)
            await prisma.post.update({
                where: { id: commentId },
                data: {
                    content: description,
                    updatedAt: new Date(),
                },
            });

            return res.status(200).json({ message: "Successfully updated comment" });
        } catch (error) {
            return res.status(500).json({ message: "An internal server error occurred while updating the comment." });
        }
    } else if (req.method === "DELETE") {

        try {
            // Functionally delete the comment
            await prisma.post.update({
                where: { id: commentId, },
                data: { deleted: true, },
            });

            return res.status(200).json({ message: "Successfully deleted comment" });
        } catch (error) {
            return res.status(500).json({ message: "An internal server error occurred while deleting the comment." });
        }
    }
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export default verifyTokenMiddleware(handler, AUTH.USER);