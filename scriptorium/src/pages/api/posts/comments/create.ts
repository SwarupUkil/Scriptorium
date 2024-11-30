import { prisma } from "@/utils/db";
import { verifyTokenMiddleware, NextApiReq } from "@/utils/auth";
import { MAX_COMMENT_DESCRIPTION, POST } from "@/utils/validateConstants";
import { NextApiResponse } from "next";

type CreateCommentRequestBody = {
    id: number; // Parent post ID
    description: string; // Comment description
};

type CreateCommentResponse = {
    postId: number;
    message: string;
};

// Handler will attempt to create a new comment posting.
async function handler(req: NextApiReq, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const { id, description } = req.body as CreateCommentRequestBody;
    const postId = Number(id);

    if (!id) {
        return res.status(404).json({ error: "Invalid ID: missing post ID" });
    }

    if (isNaN(postId)) {
        return res.status(400).json({ error: "Invalid ID: not a number" });
    }

    if (!description) {
        return res.status(404).json({ error: "Invalid description" });
    }

    if (description.length > MAX_COMMENT_DESCRIPTION) {
        return res.status(400).json({
            error: `Description is too large (<${MAX_COMMENT_DESCRIPTION} characters)`,
        });
    }

    const user = req.user; // Typed using `NextApiReq`
    const userId = user.id;

    try {
        // First, check if the user exists before creating the new post.
        const userExists = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!userExists) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        // Now create a new post.
        const newPost = await prisma.post.create({
            data: {
                uid: userId,
                content: description,
                type: POST.COMMENT,
            },
            select: { id: true },
        });

        // Then using that postId make a new comment.
        const newComment = await prisma.comment.create({
            data: {
                postId: newPost.id, // this post's ID
                parentId: postId, // the post parent this post is under
            },
            select: {
                postId: true,
            },
        });

        // Finally update parent replies[] to include this another reply.
        await prisma.post.update({
            where: { id: postId },
            data: {
                replies: {
                    connect: { postId: newComment.postId },
                },
            },
        });

        return res.status(200).json({
            postId: newComment.postId,
            message: "Successfully created comment",
        } as CreateCommentResponse);
    } catch (error: any) {
        return res.status(500).json({
            message: "An internal server error occurred while creating the reply",
            details: error.message,
        });
    }
}

export default verifyTokenMiddleware(handler);