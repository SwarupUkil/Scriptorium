import { prisma } from "@/utils/db";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const { id } = req.query;
    const blogId = Number(id);

    if (!id) {
        return res.status(404).json({ error: "Invalid ID: missing blog ID" });
    }

    if (isNaN(blogId)) {
        return res.status(400).json({ error: "Invalid ID: not a number" });
    }

    try {
        const postValues = await prisma.post.findUnique({
            where: {
                id: blogId,
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
            return res.status(404).json({ message: "Blog not found" });
        }

        if (!postValues.uid) {
            return res.status(404).json({ message: "Post has no creator?" });
        }

        const findUsername = await prisma.user.findUnique({
            where: {
                id: postValues.uid,
            },
            select: {
                username: true,
            },
        });

        const blogValues = await prisma.blog.findUnique({
            where: { postId: blogId },
            select: {
                title: true,
                tags: true,
                templates: {
                    select: {
                        id: true,
                    },
                },
            },
        });

        if (!blogValues) {
            return res.status(404).json({ message: "Blog not found" });
        }

        const templateIds = blogValues.templates.map((template) => template.id);
        const blog = {
            username: findUsername?.username || "Unknown",
            ...postValues,
            ...blogValues,
            templates: templateIds,
        };

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { deleted, uid, id: postId, ...response } = blog;
        return res.status(200).json({ postId, ...response });
    } catch {
        return res.status(500).json({ message: "An internal server error occurred while retrieving the blog data" });
    }
}