import { prisma } from "@/utils/db";
import { sanitizePagination, paginationResponse } from "@/utils/paginationHelper";
import type { NextApiRequest, NextApiResponse } from "next";
import type { Post } from "@/types/PostType";

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const { id, skip, take } = req.query;

    const postId = Number(id);
    if (!id || isNaN(postId)) {
        return res.status(400).json({ error: "Invalid ID: missing or not a number" });
    }

    const paginate = sanitizePagination(skip as string | undefined, take as string | undefined);

    try {
        const total = await prisma.post.count({
            where: {
                deleted: false,
                comment: {
                    parentId: postId,
                },
            },
        });

        const postReplies = await prisma.post.findMany({
            where: {
                deleted: false,
                comment: {
                    parentId: postId,
                },
            },
            orderBy: {
                rating: "desc", // Maintain the original logic
            },
            skip: paginate.skip,
            take: paginate.take,
            select: {
                id: true,
                rating: true,
            },
        });

        // Mapping replies to format with `postId` instead of `id`
        const formattedReplies = postReplies.map(({ id, ...rest }) => ({
            ...rest,
            postId: id,
        })) as Post[];

        return res.status(200).json(paginationResponse(formattedReplies, total, paginate, "replies"));
    } catch (error: any) {
        return res.status(500).json({
            message: "An internal server error occurred while retrieving the list of comments data",
            details: error.message,
        });
    }
}