import {prisma} from "../../../../../utils/db";
import { verifyTokenMiddleware } from "../../../../../utils/auth";
import validateTags from "../../../../../utils/validateTags";
import {AUTH, MAX_BLOG_DESCRIPTION, MAX_TAGS, MAX_TITLE, PRIVACY} from "../../../../../utils/validateConstants";

// Handler will attempt to update/delete a specified blog post for the client.
async function handler(req, res) {

    if (req.method !== "PUT" && req.method !== "DELETE") {
        return res.status(405).json({message: "Method not allowed"});
    }

    const { id } = req.body;
    const blogId = Number(id);

    if (!id) {
        return res.status(404).json({ error: "Invalid ID: missing blog ID" });
    }

    if (isNaN(blogId)) {
        return res.status(400).json({ error: "Invalid ID: not a number" });
    }


    const user = req.user;
    const userId = user.id;

    const { title, description, tags, templates } = req.body;

    if (title && title.length > MAX_TITLE) {
        return res.status(400).json({message: `Title is too large, shorten to less then ${MAX_TITLE}`});
    }

    if (description && description.length > MAX_BLOG_DESCRIPTION) {
        return res.status(400).json({message: `Description is too large, shorten to less then ${MAX_BLOG_DESCRIPTION}`});
    }

    // Tags validation
    if (tags && tags.length > MAX_TAGS) {
        return res.status(400).json({message: `Too many tags, shorten to less then ${MAX_TAGS} characters in CSV form`});
    }

    const sanitizedTags = validateTags(tags);
    if (tags && !sanitizedTags.isValid) {
        return res.status(400).json({message: sanitizedTags.message});
    }

    // Template validation
    if (templates && !Array.isArray(templates)) {
        return res.status(400).json({message: "Templates must be given as an array"});
    }

    if (templates) {
        let index = 0;
        for (const templateId of templates) {
            if (isNaN(Number(templateId))) {
                return res.status(400).json({message: "Templates must be given as their ID number"});
            } else {
                templates[index] = Number(templateId);
            }
            index++;
        }
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

        if (!blog || Number(blog.post.uid) !== userId) {
            return res.status(401).json({ message: "Unauthorized or Blog not found." });
        }
    } catch (error) {
        return res.status(500).json({ message: "An internal server error occurred while authorizing the update blog query" });
    }

    // CHATGPT aided in a few queries here.
    if (req.method === "PUT") {
        try {
            // Check if all provided template IDs exist
            const existingTemplates = await prisma.template.findMany({
                where: {
                    id: {in: templates }, // Check for templates with these IDs
                    privacy: PRIVACY.PUBLIC,
                },
                select: { id: true },
            });

            // Extract the valid template IDs that exist in the database
            const validTemplateIds = existingTemplates.map((template) => template.id);

            await prisma.post.update({
                where: {
                    id: blogId,
                },
                data: {
                    content: description ? description : undefined,
                    updatedAt: new Date(),
                },
            });

            // Convert sanitized tags to CSV format
            const csvTags = sanitizedTags.validTags.length > 0 ? sanitizedTags.validTags.join(",") : undefined;
            await prisma.blog.update({
                where: {
                    postId: blogId,
                },
                data: {
                    title: title || undefined,
                    tags: csvTags,
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
            return res.status(500).json({ message: "An internal server error occurred while updating the blog" });
        }

    } else if (req.method === "DELETE") {
        try {
            // Keep data in database, but functionally have it deleted.
            await prisma.post.update({
                where: { id: blogId, },
                data: { deleted: true, },
            });

            return res.status(200).json({message: "Successfully deleted blog"});
        } catch (error) {
            return res.status(500).json({ message: "An internal server error occurred while deleting the blog" });
        }
    }
}

export default verifyTokenMiddleware(handler, AUTH.USER);