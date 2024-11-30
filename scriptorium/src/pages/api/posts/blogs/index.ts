import { prisma } from "@/utils/db";
import { paginationResponse, sanitizePagination } from "@/utils/paginationHelper";
import validateTags from "@/utils/validateTags";
import { ORDER } from "@/utils/validateConstants";
import { NextApiRequest, NextApiResponse } from "next";
type SortOrder = "asc" | "desc";

type QueryParams = {
    skip?: string;
    take?: string;
    title?: string;
    content?: string;
    tags?: string;
    templates?: string;
    orderBy?: string;
};

type BlogResponse = {
    postId: number;
    title: string;
    tags: string;
    rating?: number;
    flagged?: boolean;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const { skip, take, title, content, tags, templates, orderBy } = req.query as QueryParams;

    let order = ORDER.DESC;
    if (orderBy === ORDER.ASC) {
        order = ORDER.ASC;
    }

    const paginate = sanitizePagination(skip, take);

    const sanitizedTags = validateTags(tags);
    if (tags && !sanitizedTags.isValid) {
        return res.status(400).json({ message: sanitizedTags.message });
    }

    try {
        const tagConditions =
            sanitizedTags.validTags.length > 0
                ? sanitizedTags.validTags.map((tag) => ({
                    tags: { contains: tag },
                }))
                : undefined;

        const total = await prisma.blog.count({
            where: {
                title: title ? { contains: title } : undefined,
                post: {
                    content: content ? { contains: content } : undefined,
                    flagged: false,
                    deleted: false,
                },
                AND: tagConditions,
                ...(templates
                    ? {
                        templates: {
                            some: { title: { contains: templates } },
                        },
                    }
                    : {}),
            },
        });

        const blogs = await prisma.blog.findMany({
            where: {
                title: title ? { contains: title } : undefined,
                post: {
                    content: content ? { contains: content } : undefined,
                    flagged: false,
                    deleted: false,
                },
                AND: tagConditions,
                ...(templates
                    ? {
                        templates: {
                            some: { title: { contains: templates } },
                        },
                    }
                    : {}),
            },
            select: {
                postId: true,
                title: true,
                tags: true,
                post: {
                    select: {
                        id: true,
                        rating: true,
                        flagged: true,
                    },
                },
            },
            skip: paginate.skip,
            take: paginate.take,
            orderBy: orderBy === ORDER.CONTROVERSIAL
                ? { post: { totalRatings: order.toLowerCase() as SortOrder} }
                : { post: { rating: order.toLowerCase() as SortOrder} },
        });

        const sanitizedBlogs: BlogResponse[] = blogs.map((blog) => {
            const { post, tags, ...rest } = blog;

            return {
                ...rest,
                tags: tags || "", // Ensure `tags` is always a string
                ...(post ? { rating: post.rating, flagged: post.flagged } : {}),
            };
        });

        return res.status(200).json(paginationResponse(sanitizedBlogs, total, paginate, "blogs"));
    } catch {
        return res.status(500).json({ message: "An internal server error occurred while retrieving the blogs" });
    }
}