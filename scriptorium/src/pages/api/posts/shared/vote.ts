import { prisma } from "@/utils/db";
import {NextApiReq, verifyTokenMiddleware} from "@/utils/auth";
import type { NextApiResponse } from "next";

async function handler(req: NextApiReq, res: NextApiResponse): Promise<void> {
    if (req.method !== "PUT" && req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const postId = Number(req.query.id);
    if (isNaN(postId)) {
        return res.status(400).json({ message: "Missing or invalid post ID" });
    }

    const user = req.user; // Provided by `verifyTokenMiddleware`
    const { id: userId } = user;

    try {
        const postExists = await prisma.post.findUnique({
            where: { id: postId },
        });

        if (!postExists) {
            return res.status(404).json({ message: "Post not found" });
        }
    } catch {
        return res.status(400).json({ message: "Invalid post ID given" });
    }

    if (req.method === "PUT") {
        const rating = Number(req.query.rating);
        if (![1, 0, -1].includes(rating)) {
            return res.status(400).json({ message: "Rating must be -1, 0, or 1" });
        }

        try {
            // Check current user rating
            const currentRatingObj = await prisma.rating.findUnique({
                where: {
                    uid_postId: {
                        uid: userId,
                        postId: postId,
                    },
                },
                select: {
                    value: true,
                },
            });

            const currentRating = rating - (currentRatingObj?.value || 0);
            const updateTotalRatingsBy = currentRatingObj ? 0 : 1;

            await prisma.rating.upsert({
                where: {
                    uid_postId: {
                        uid: userId,
                        postId: postId,
                    },
                },
                update: { value: rating },
                create: { uid: userId, postId: postId, value: rating },
            });

            await prisma.post.update({
                where: {
                    id: postId,
                },
                data: {
                    rating: { increment: currentRating },
                    totalRatings: { increment: updateTotalRatingsBy },
                },
            });

            return res.status(200).json({ message: "Vote updated successfully" });
        } catch (error: any) {
            return res.status(500).json({
                message: "An error occurred while processing the vote",
                details: error.message,
            });
        }
    } else if (req.method === "GET") {
        try {
            const userRating = await prisma.rating.findUnique({
                where: {
                    uid_postId: {
                        uid: userId,
                        postId: postId,
                    },
                },
            });

            return res.status(200).json({ vote: userRating?.value || 0 });
        } catch (error: any) {
            return res.status(500).json({
                message: "An error occurred while fetching the user vote",
                details: error.message,
            });
        }
    }
}

export default verifyTokenMiddleware(handler);