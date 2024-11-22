import {prisma} from "../../../utils/db";
import { verifyTokenMiddleware } from "../../../utils/auth";
import {sanitizePagination, paginationResponse} from "../../../utils/paginationHelper";
import validateTags from "../../../utils/validateTags";

// Handler will give a list of public template IDs based on client specification.
async function handler(req, res) {

    if (req.method !== "GET") {
        res.status(405).json({message: "Method not allowed"});
    }

    const { skip, take, title, tags, content } = req.query;
    const paginate = sanitizePagination(skip, take);

    if (typeof tags !== "undefined" && typeof tags !== "string") {
        return res.status(400).json({message: "Tags must be given following CSV notation"});
    }

    const sanitizedTags = validateTags(tags);
    if (tags && !sanitizedTags.isValid) {
        return res.status(400).json({message: sanitizedTags.message});
    }

    try {
        // Build `AND` conditions for tags
        const tagConditions =
            sanitizedTags.validTags.length > 0
                ? sanitizedTags.validTags.map(tag => ({
                    tags: { contains: tag }, // Simulates checking if the template contains this tag
                }))
                : undefined;

        const total = await prisma.template.count({
            where: {
                title: title ? { contains: title } : undefined,
                explanation: content ? { contains: content } : undefined,
                AND: tagConditions,
                privacy: "PUBLIC",
                deleted: false,
            },
        });

        const templates = await prisma.template.findMany({
            where: {
                // Filter by templates by title, code contents, and tags.
                title: title ? {contains: title} : undefined,
                explanation: content ? {contains: content} : undefined,
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
        return res.status(500).json({ message: "An internal server error occurred while retrieving the templates" });
    }
}

export default verifyTokenMiddleware(handler);