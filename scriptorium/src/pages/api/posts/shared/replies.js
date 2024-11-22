import {prisma} from "../../../../utils/db";
import { verifyTokenMiddleware } from "../../../../utils/auth";
import {sanitizePagination, paginationResponse} from "../../../../utils/paginationHelper";

// Handler will return the replies to a specific post to the client.
async function handler(req, res) {

    if (req.method !== "GET") {
        return res.status(405).json({message: "Method not allowed"});
    }

    const { id, skip, take } = req.body; // Parent post's postId.
    const postId = Number(id);

    const paginate = sanitizePagination(skip, take);
    const order = "desc";

    if (!id) {
        return res.status(404).json({ error: "Invalid ID: missing comment ID" });
    }

    if (isNaN(postId)) {
        return res.status(400).json({ error: "Invalid ID: not a number" });
    }

    try {
        const total = await prisma.post.count({
            where: {
                deleted: false,
                flagged: false,
                comment: {
                    parentId: postId,
                },
            },
        });

        const postReplies = await prisma.post.findMany({
            where: {
                deleted: false,
                flagged: false,
                comment: {
                    parentId: postId,
                },
            },
            orderBy: {
                rating: order,
            },
            skip: paginate.skip,
            take: paginate.take,
            select: {
                id: true,
                rating: true,
                content: true,
            },
        });

        return res.status(200).json(paginationResponse(postReplies, total, paginate, "replies"));
    } catch (error) {
        return res.status(500).json({ message: "An internal server error occurred while retrieving the list of comments data" });
    }
}

export default verifyTokenMiddleware(handler);