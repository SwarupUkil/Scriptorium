import {prisma} from "../../../../../utils/db";
import { verifyTokenMiddleware } from "../../../../../utils/auth";
import validateTags from "../../../../../utils/validateTags";
import {AUTH, MAX_BLOG_DESCRIPTION, MAX_TAGS, MAX_TITLE, POST, PRIVACY} from "../../../../../utils/validateConstants";

// Handler will attempt to create a new blog posting.
async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).send({message: "Method not allowed"})
    }

    const user = req.user;
    const { id } = user;
    const userId = Number(id);
    const { title, description, tags, templates } = req.body;

    if (!id) {
        return res.status(404).json({ error: "Invalid ID: missing template ID" });
    }

    if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid ID: not a number" });
    }

    if (!title || !description) {
        return res.status(400).json({message: "Missing title or description"});
    }

    if (title.length > MAX_TITLE) {
        return res.status(400).json({message: `Title is too large, shorten to less then ${MAX_TITLE}`});
    }

    if (description.length > MAX_BLOG_DESCRIPTION) {
        return res.status(400).json({message: `Description is too large, shorten to less then ${MAX_BLOG_DESCRIPTION}`});
    }

    if (tags && tags.length > MAX_TAGS) {
        return res.status(400).json({message: `Too many tags, shorten to less then ${MAX_TAGS + 1} characters in CSV form`});
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

    try {

        // First, check if the user exists before creating the new post.
        const userExists = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!userExists) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

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

        const post = await prisma.post.create({
            data: {
                uid: userId,
                content: description,
                type: "blog",
            },
            select: {
                id: true,
            },
        });

        if (!post) {
            return res.status(400).json({message: "Unable to create new posting"});
        }

        // Convert sanitized tags to CSV format
        const csvTags = sanitizedTags.validTags.length > 0 ? sanitizedTags.validTags.join(",") : undefined;
        const blog = await prisma.blog.create({
            data: {
                postId: post.id,
                title: title,
                tags: csvTags,
                templates: {
                    // Connect the new templates specified by the client
                    connect: validTemplateIds.map((id) => ({ id: id })),
                },
            },
            select: {postId: true},
        });

        if (!blog) {
            return res.status(400).json({message: "Unable to create new blog"});
        }

        post.message = "Successfully created new blog";
        return res.status(200).json(post);
    } catch (error) {
        return res.status(500).json({ message: "An internal server error occurred while creating the blog" });
    }
}

export default verifyTokenMiddleware(handler, AUTH.USER);