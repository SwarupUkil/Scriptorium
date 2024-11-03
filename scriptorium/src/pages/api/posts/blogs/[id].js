import prisma from "../../../../utils/database";

// Handler will return a specified blog post to client.
export default async function handler(req, res) {

    const { id } = req.query;
    const blogId = Number(id);

    if (!id) {
        return res.status(404).json({ error: "Invalid ID: missing blog ID" });
    }

    if (isNaN(blogId)) {
        return res.status(400).json({ error: "Invalid ID: not a number" });
    }

    if (req.method !== "GET") {
        res.status(405).json({message: "Method not allowed"});
    } else {

        // Blog data is seperated into two tables: Post (parent table) and Blog.
        try {
            const postValues = await prisma.post.findUnique({
                where: {id: blogId},
                select: {
                    id: true,
                    rating: true,
                    uid: true,
                    replies: true,
                    content: true,
                    flagged: true,
                },
            });

            const blogValues = await prisma.blog.findUnique({
                where: {postId: blogId},
                select: {
                    title: true,
                    tags: true,
                },
            });

            const blog = {
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
            return res.status(400).json({ message: "An error occurred while retrieving the blog data" });
        }
    }
}