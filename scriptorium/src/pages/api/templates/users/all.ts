import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/db";
import { verifyTokenMiddleware } from "@/utils/auth";
import { sanitizePagination, paginationResponse } from "@/utils/paginationHelper";
import { Template } from "@/types/TemplateType";
import { PaginationAPIResponse } from "@/types/PaginationType";

type RequestWithUser = NextApiRequest & {
    user: { id: number };
};

type TemplatePreview = Pick<Template, "id" | "title" | "tags">;

type TemplatesResponse = PaginationAPIResponse & {
    templates: TemplatePreview[];
};

// Handler will return all the clients templates.
async function handler(req: RequestWithUser, res: NextApiResponse<TemplatesResponse | { message: string }>) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const userId = req.user?.id;

    const { skip, take } = req.query;
    const paginate = sanitizePagination(skip as string, take as string);

    try {
        // Count total templates for the user
        const total = await prisma.template.count({
            where: {
                uid: userId,
                deleted: false,
            },
        });

        // Fetch templates
        const templates = await prisma.template.findMany({
            where: {
                uid: userId,
                deleted: false,
            },
            select: {
                id: true,
                title: true,
                tags: true,
            },
            skip: paginate.skip,
            take: paginate.take,
        });

        return res.status(200).json({
            ...paginationResponse(templates, total, paginate, "templates"),
            templates,
        });
    } catch (error) {
        console.error("Error retrieving user templates:", error);
        return res.status(500).json({
            message: "An internal server error occurred while retrieving the user templates",
        });
    }
}

export default verifyTokenMiddleware(handler);