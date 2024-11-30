import { prisma } from "@/utils/db";
import { verifyTokenMiddleware, NextApiReq, UserTokenData } from "@/utils/auth";
import validateTags from "@/utils/validateTags";
import { MAX_BLOG_DESCRIPTION, MAX_TAGS, MAX_TITLE, PRIVACY } from "@/utils/validateConstants";
import { NextApiResponse } from "next";

interface UpdateBlogBody {
    id: number;
    title?: string;
    content?: string;
    tags?: string;
    templates?: number[];
}

async function handler(req: NextApiReq, res: NextApiResponse) {
    if (req.method !== "PUT" && req.method !== "DELETE") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const { id, title, content, tags }: UpdateBlogBody = req.body;
    let { templates } = req.body as UpdateBlogBody;
    const blogId = Number(id);

    if (!id) {
        return res.status(404).json({ error: "Invalid ID: missing blog ID" });
    }

    if (isNaN(blogId)) {
        return res.status(400).json({ error: "Invalid ID: not a number" });
    }

    const user: UserTokenData = req.user;
    const userId = user.id;

    if (title && title.length > MAX_TITLE) {
        return res.status(400).json({ message: `Title is too large, shorten to less than ${MAX_TITLE}` });
    }

    if (content && content.length > MAX_BLOG_DESCRIPTION) {
        return res.status(400).json({ message: `Content is too large, shorten to less than ${MAX_BLOG_DESCRIPTION}` });
    }

    if (tags && tags.length > MAX_TAGS) {
        return res.status(400).json({
            message: `Too many tags, shorten to less than ${MAX_TAGS} characters in CSV form`,
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

        if (req.method === "PUT") {
            const existingTemplates = await prisma.template.findMany({
                where: {
                    id: { in: templates },
                    privacy: PRIVACY.PUBLIC,
                },
                select: { id: true },
            });

            const validTemplateIds = existingTemplates.map((template) => template.id);

            await prisma.post.update({
                where: { id: blogId },
                data: {
                    content: content || undefined,
                    updatedAt: new Date(),
                },
            });

            const csvTags = sanitizedTags.validTags.length > 0 ? sanitizedTags.validTags.join(",") : undefined;

            await prisma.blog.update({
                where: { postId: blogId },
                data: {
                    title: title || undefined,
                    tags: csvTags,
                    templates: {
                        set: [],
                        connect: validTemplateIds.map((id) => ({ id })),
                    },
                },
            });

            return res.status(200).json({ message: "Successfully updated blog" });
        } else if (req.method === "DELETE") {
            await prisma.post.update({
                where: { id: blogId },
                data: { deleted: true },
            });

            return res.status(200).json({ message: "Successfully deleted blog" });
        }
    } catch (error: any) {
        return res.status(500).json({
            message: "An internal server error occurred while updating/deleting the blog",
            details: error.message,
        });
    }
}

export default verifyTokenMiddleware(handler);