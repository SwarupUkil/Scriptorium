import {prisma} from "../../../../utils/db";

// Handler will return a specified blog post to client.
export default async function handler(req, res) {

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
                templates: {
                    select: {
                        id: true,
                    },
                },
            },
        });

        // Error if either queries return null.
        if (!postValues || !blogValues) {
            return res.status(404).json({ message: "Blog not found" });
        }

        // Parse the templates into an array of integers
        const templateIds = blogValues.templates.map((template) => template.id);
        const blog = {
            username: findUsername.username,
            ...postValues,
            ...blogValues,
            templates: templateIds, // Replace with parsed template IDs
        };

        // Return identified blog data.
        const {deleted, uid, id, ...response} = blog;
        response.postId = id;
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({ message: "An internal server error occurred while retrieving the blog data" });
    }
}