import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/db";
import { sanitizePagination, paginationResponse } from "@/utils/paginationHelper";
import validateTags from "@/utils/validateTags";

type TemplateResponse = {
    id: number;
    title: string;
    explanation: string | null;
    tags: string | null;
};

// Handler will give a list of public template IDs based on client specification.
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const { skip, take, title, tags, content } = req.query;
    const paginate = sanitizePagination(skip as string | undefined, take as string | undefined);

    if (tags && typeof tags !== "string") {
        return res
            .status(400)
            .json({ message: "Tags must be given following CSV notation" });
    }

    const sanitizedTags = validateTags(tags as string);
    if (tags && !sanitizedTags.isValid) {
        return res.status(400).json({ message: sanitizedTags.message });
    }

    try {
        // Build `AND` conditions for tags
        const tagConditions = sanitizedTags.validTags.length > 0
                ? sanitizedTags.validTags.map((tag) => ({
                    tags: { contains: tag }, // Check if the template contains this tag
                }))
                : undefined;

        const total = await prisma.template.count({
            where: {
                title: title ? { contains: title as string } : undefined,
                explanation: content ? { contains: content as string } : undefined,
                AND: tagConditions,
                privacy: "PUBLIC",
                deleted: false,
            },
        });

        const templates: TemplateResponse[] = await prisma.template.findMany({
            where: {
                title: title ? { contains: title as string } : undefined,
                explanation: content ? { contains: content as string } : undefined,
                AND: tagConditions,
                privacy: "PUBLIC",
                deleted: false,
            },
            select: {
                id: true,
                title: true,
                explanation: true,
                tags: true,
            },
            skip: paginate.skip,
            take: paginate.take,
        });

        return res.status(200).json(paginationResponse(templates, total, paginate, "templates"));
    } catch (error) {
        console.error("Error fetching templates:", error);
        return res.status(500).json({
            message: "An internal server error occurred while retrieving the templates",
        });
    }
}