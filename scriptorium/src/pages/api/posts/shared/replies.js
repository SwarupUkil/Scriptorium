import {prisma} from "../../../../utils/db";
import { verifyTokenMiddleware } from "../../../../utils/auth";
import sanitizePagination from "../../../../utils/paginationHelper";

// Handler will return the replies to a specific post to the client.
async function handler(req, res) {

    const { id, skip, take } = req.body; // Parent post's postId.
    const commentId = Number(id);

    const paginate = sanitizePagination(skip, take);
    const sortingBy = "rating";
    const order = "asc";

    if (!id) {
        return res.status(404).json({ error: "Invalid ID: missing comment ID" });
    }

    if (isNaN(commentId)) {
        return res.status(400).json({ error: "Invalid ID: not a number" });
    }

    if (req.method !== "GET") {
        return res.status(405).json({message: "Method not allowed"});
    }

    try {
        const postReplies = await prisma.comment.findMany({
            where: {
                parentId: id
            },
            select: {
                postId: true,
                parentId: true,
                post: true, // Include the entire Post object
            },
            skip: paginate.skip,
            take: paginate.take,
            orderBy: {[sortingBy] : order},
        });

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