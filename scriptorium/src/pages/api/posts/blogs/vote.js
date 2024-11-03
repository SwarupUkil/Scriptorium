import prisma from "../../../../utils/database";
import { verifyToken } from "../../../../utils/auth";

// Handler will update the vote (upvote/downvote) from a user on a blog
export default async function handler(req, res){

    const postId = req.body.id;
    const rating = Number(req.body.rating)
    const user = verifyToken(req.headers.authorization);

    if (req.method !== "PUT") {
        return res.status(405).send({message: "Method not allowed"})
    }

    if (!user) {
        return res.status(401).json({message: "Unauthorized"});
    }

    if (!postId || !req.body.rating) {
        return res.status(401).json({message: "Missing ID or user rating"});
    }

    if (rating !== -1 || rating !== 0 || rating !== 1) {
        return res.status(401).json({message: "Rating must be given as either: -1, 0, 1"});
    }

    const { id, type } = user;

    if (type !== "USER") {
        return res.status(401).json({message: "Unauthorized"});
    }

    try {
        // Check and retrieve the current rating the user has given.
        const currentRatingObj = await prisma.rating.findUnique({
            where: {
                uId: id,
                postId: postId,
            },
            select: {
                value: true,
            },
        });

        // Update or create new rating if it doesn't exist.
        const updatedRating = await prisma.rating.upsert({
            where: {
                uId_postId: {
                    uId: id,
                    postId: postId,
                },
            },
            update: {
                value: rating,
            },
            create: {
                uId: id,
                postId: postId,
                value: rating,
            },
        });

        // NewRate OldRate: formula is new - old, which we add to total rating.
        // -1 0 so we add -1
        // -1 1 so we add -2
        // -1 -1 so we add 0
        // 1 -1 so we add 2.
        let currentRating = rating;
        if (!(!currentRatingObj)) {
            currentRating -= currentRatingObj.value;
        }

        // Update the blog post rating total.
        const post = await prisma.post.findUnique({
            where: {
                id: postId,
            },
            data: {
                rating: {increment: currentRating},
            },
        });

        return res.status(200).json({message: "Successfully updated user vote on the vlog"});
    } catch (error) {
        return res.status(400).json({ message: "An error occurred while up/down voting the blog" });
    }
}