import {prisma} from "@/utils/db";
import { NextApiRequest, NextApiResponse } from "next";

// Define the shape of the Post and Comment objects returned from the database
interface PostValues {
    postId?: number;
    id: number;
    uid: number | null;
    rating: number;
    content: string;
    flagged: boolean;
    deleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

interface PostResponse {
    postId?: number;
    rating: number;
    content: string;
    flagged: boolean;
    createdAt: Date;
    updatedAt: Date;
}

interface CommentValues {
    postId: number;
}

type Username = {
    username: string | null;
};

// Combined type for the API response
type CommentResponse = PostResponse & {
    username: string;
};

// Handler will return a specified blog post to client.
export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void>  {

    if (req.method !== "GET") {
        return res.status(405).json({message: "Method not allowed"});
    }

    const { id } = req.query;
    const commentId = Number(id);

    if (!id) {
        return res.status(404).json({ error: "Invalid ID: missing blog ID" });
    }

    if (isNaN(commentId)) {
        return res.status(400).json({ error: "Invalid ID: not a number" });
    }

    // Comment data is seperated into post tables: Post (parent table) and Comment.
    try {

        const commentExist: CommentValues | null = await prisma.comment.findUnique({
            where: {postId: commentId},
            select: {postId: true},
        });

        // Error if either queries return null.
        if (!commentExist) {
            return res.status(404).json({ message: "Comment not found" });
        }

        const postValues: PostValues | null = await prisma.post.findUnique({
            where: {
                id: commentId,
                flagged: false,
                deleted: false,
            },
            select: {
                id: true,
                rating: true,
                uid: true,
                content: true,
                flagged: true,
                deleted: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!postValues) {
            return res.status(404).json({ message: "Post not found" });
        }

        const findUsername : Username | null = await prisma.user.findUnique({
            where: {
                id: Number(postValues.uid),
            },
            select: {
                username: true,
            },
        });

        if (!findUsername) {
            return res.status(404).json({ message: "User not found" });
        }

        // Client should not know uid detail.
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const {uid, deleted, id, ...post} = postValues;
        post.postId = id;
        const response: CommentResponse = {
            ...post,
            username: String(findUsername.username),
        }

        // Return identified blog data.
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({ message: "An internal server error occurred while retrieving the blog data" });
    }
}