import { prisma } from "@/utils/db";
import { verifyTokenMiddleware, NextApiReq, UserTokenData } from "@/utils/auth";
import validateTags from "@/utils/validateTags";
import { MAX_BLOG_DESCRIPTION, MAX_TAGS, MAX_TITLE, POST, PRIVACY } from "@/utils/validateConstants";
import { NextApiResponse } from "next";

interface CreateBlogBody {
    title: string;
    content: string;
    tags?: string;
    templates?: number[];
}

async function handler(req: NextApiReq, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).send({ message: "Method not allowed" });
    }

    const user: UserTokenData = req.user;
    const userId = user.id;

    const { title, content, tags }: CreateBlogBody = req.body;
    let { templates } = req.body as CreateBlogBody;

    if (!title || !content) {
        return res.status(400).json({ message: "Missing title or content" });
    }

    if (title.length > MAX_TITLE) {
        return res.status(400).json({ message: `Title is too large, shorten to less than ${MAX_TITLE}` });
    }

    if (content.length > MAX_BLOG_DESCRIPTION) {
        return res.status(400).json({ message: `Description is too large, shorten to less than ${MAX_BLOG_DESCRIPTION}` });
    }

    if (tags && tags.length > MAX_TAGS) {
        return res.status(400).json({
            message: `Too many tags, shorten to less than ${MAX_TAGS + 1} characters in CSV form`,
        });
    }

    const sanitizedTags = validateTags(tags);
    if (tags && !sanitizedTags.isValid) {
        return res.status(400).json({ message: sanitizedTags.message });
    }

    if (templates && !Array.isArray(templates)) {
        return res.status(400).json({ message: "Templates must be given as an array" });
    }

    if (templates) {
        templates = templates.map((templateId) => {
            if (isNaN(Number(templateId))) {
                throw new Error("Templates must be given as their ID number");
            }
            return Number(templateId);
        });
    }

    try {
        const userExists = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!userExists) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const existingTemplates = await prisma.template.findMany({
            where: {
                id: { in: templates },
                privacy: PRIVACY.PUBLIC,
            },
            select: { id: true },
        });

        const validTemplateIds = existingTemplates.map((template) => template.id);

        const post = await prisma.post.create({
            data: {
                uid: userId,
                content: content,
                type: POST.BLOG,
            },
            select: { id: true },
        });

        if (!post) {
            return res.status(400).json({ message: "Unable to create new posting" });
        }

        const csvTags = sanitizedTags.validTags.length > 0 ? sanitizedTags.validTags.join(",") : undefined;

        const blog = await prisma.blog.create({
            data: {
                postId: post.id,
                title,
                tags: csvTags,
                templates: {
                    connect: validTemplateIds.map((id) => ({ id })),
                },
            },
            select: { postId: true },
        });

        if (!blog) {
            return res.status(400).json({ message: "Unable to create new blog" });
        }

        return res.status(200).json({
            postId: post.id,
            message: "Successfully created new blog",
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "An internal server error occurred while creating the blog",
            details: error.message,
        });
    }
}

export default verifyTokenMiddleware(handler);