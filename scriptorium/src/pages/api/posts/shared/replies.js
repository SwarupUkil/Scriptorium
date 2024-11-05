import {prisma} from "../../../../utils/db";
import { verifyTokenMiddleware } from "../../../../utils/auth";
import sanitizePagination from "../../../../utils/paginationHelper";

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
        const postReplies = await prisma.post.findMany({
            where: {
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

        console.log(postReplies);
        if (Array.isArray(postReplies) && postReplies.length === 0) {
            return res.status(400).json({ error: "No replies found." });
        }

        const response = {
            data: postReplies, // Array of objects (e.g., comments or posts)
            message: paginate.message || null, // Message only included if there's a warning or note
        };

        return res.status(200).json(response);
    } catch (error) {
        return res.status(400).json({ message: "An error occurred while retrieving the list of comments data" });
    }
}

export default verifyTokenMiddleware(handler);