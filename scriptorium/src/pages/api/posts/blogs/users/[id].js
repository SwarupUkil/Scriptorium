import prisma from "../../../../../utils/database";
import { verifyToken } from "../../../../../utils/auth";
import validateTags from "../../../../../utils/validateTags";

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

    // Authorization validation
    const user = verifyToken(req.headers.authorization);

    if (!user) {
        return res.status(401).json({message: "Unauthorized"});
    }

    const userId = user.id;
    const userType = user.type;

    if (userType !== "USER") {
        return res.status(401).json({message: "Unauthorized"});
    }

    const { title, description, tags, templates } = req.body;

    if (!title && title.length > 100) {
        return res.status(400).json({message: "Title is too large"});
    }

    if (!description && description.length > 3000) {
        return res.status(400).json({message: "Description is too large"});
    }

    // Tags validation
    if (typeof tags !== "undefined" && typeof tags !== "string") {
        return res.status(400).json({message: "Tags must be given as one long CSV styled string"});
    }

    if (!tags && tags.length > 100) {
        return res.status(400).json({message: "Too many tags, shorten to less then 100 characters in CSV form"});
    }

    if (!tags && !validateTags(tags)) {
        return res.status(400).json({message: "Tags must be given following CSV notation (no spaces)"});
    }

    // Template validation
    if (!templates && !Array.isArray(templates)) {
        return res.status(400).json({message: "Templates must be given as an array"});
    }

    for (const templateId of templates) {
        if (isNaN(Number(templateId))) {
            return res.status(400).json({message: "Templates must be given as their ID number"});
        }
    }

    ///// REQUEST HANDLING /////
    if (req.method !== "PUT" || req.method !== "DELETE") {
        return res.status(405).json({message: "Method not allowed"});
    }

    // Check if the blog exists and if the user ID matches
    try {
        const blog = await prisma.blog.findUnique({
            where: { postId: blogId },
            include: {
                post: {
                    select: { uid: true },
                },
            },
        });

        if (!blog || blog.post.uid !== userId) {
            return res.status(401).json({ message: "Unauthorized or Blog not found." });
        }
    } catch (error) {
        return res.status(400).json({ message: "An error occurred while authorizing the update blog query" });
    }

    // CHATGPT aided in a few queries here.
    if (req.method === "PUT") {
        try {
            // Check if all provided template IDs exist
            const existingTemplates = await prisma.template.findMany({
                where: {
                    id: {in: templates }, // Check for templates with these IDs
                    privacy: "PUBLIC",
                },
                select: { id: true },
            });

            // Extract the valid template IDs that exist in the database
            const validTemplateIds = existingTemplates.map((template) => template.id);

            const updatedPost = await prisma.post.update({
                where: {
                    id: blogId,
                },
                data: {
                    content: description ? description : undefined,
                },
            });

            const updatedBlog = await prisma.blog.update({
                where: {
                    postId: blogId,
                },
                data: {
                    title: title || undefined,
                    tags: tags || undefined,
                    templates: {
                        // Disconnect all templates currently linked to this blog
                        set: [],

                        // Connect the new templates specified by the client
                        connect: validTemplateIds.map((id) => ({ id: id })),
                    },
                },
                include: {
                    post: {
                        select: {
                            id: true,
                        },
                    },
                    templates: {
                        select: {
                            id: true,
                        },
                    },
                },
            });

            return res.status(200).json({message: "Successfully updated blog"});
        } catch (error) {
            return res.status(400).json({ message: "An error occurred while updating the blog" });
        }

    } else if (req.method === "DELETE") {
        try {
            const deletedPost = await prisma.post.update({
                where: {
                    id: blogId,
                },
                data: {
                    content: "",
                    deleted: true,
                },
            });
            const deletedBlog = await prisma.blog.update({
                where: {
                    postId: blogId,
                },
                data: {
                    title: "",
                    tags: "",
                    templates: {
                        // This clears all existing connections in the templates relation (regarding postId)
                        set: [],
                    },
                },
            });

            return res.status(200).json({message: "Successfully deleted blog"});
        } catch (error) {
            return res.status(400).json({ message: "An error occurred while deleting the blog" });
        }
    }
}