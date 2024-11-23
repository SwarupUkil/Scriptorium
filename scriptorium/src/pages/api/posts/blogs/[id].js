import {prisma} from "../../../../utils/db";
import {verifyTokenMiddleware} from "../../../../utils/auth";

// Handler will return a specified blog post to client.
async function handler(req, res) {

    if (req.method !== "GET") {
        return res.status(405).json({message: "Method not allowed"});
    }

    const { id } = req.query;
    const blogId = Number(id);

    if (!id) {
        return res.status(404).json({ error: "Invalid ID: missing blog ID" });
    }

    if (isNaN(blogId)) {
        return res.status(400).json({ error: "Invalid ID: not a number" });
    }

    // Blog data is seperated into two tables: Post (parent table) and Blog.
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

        const findUsername = await prisma.user.findUnique({
            where: {
                id: postValues.uid,
            },
            select: {
                username: true,
            },
        });

        const blogValues = await prisma.blog.findUnique({
            where: {postId: blogId},
            select: {
                title: true,
                tags: true,
            },
        });

        postValues.uid = null; // Client should not know this detail.

        const blog = {
            username: findUsername.username,
            ...postValues,
            ...blogValues,
        }

        // Error if either queries return null.
        if (!postValues || !blogValues) {
            return res.status(404).json({ message: "Blog not found" });
        }

        // Return identified blog data.
        return res.status(200).json(blog);
    } catch (error) {
        return res.status(500).json({ message: "An internal server error occurred while retrieving the blog data" });
    }
}

export default verifyTokenMiddleware(handler);