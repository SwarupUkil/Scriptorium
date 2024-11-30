import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/db";
import { verifyTokenMiddleware } from "@/utils/auth";
import { Template } from "@/types/TemplateType";

type RequestWithUser = NextApiRequest & {
    user: { id: number };
};

type TemplateResponse = Omit<Template, "uid" | "deleted">;

// Handler will return a specific template that is authorized (public).
async function handler(req: RequestWithUser, res: NextApiResponse<TemplateResponse | { message: string; error?: string }>) {

    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const { id } = req.query;
    const templateId = Number(id);
    const userId = req.user?.id;

    if (!id || isNaN(templateId)) {
        return res.status(400).json({ message: "Invalid ID: must be a valid template ID" });
    }

    try {
        // Verify the user exists
        const userExists = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!userExists) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        // Fetch the template owned by the user
        const template = await prisma.template.findUnique({
            where: {
                id: templateId,
                uid: userId,
            },
        });

        if (!template) {
            return res.status(404).json({ message: "Template not found or is not owned by the user" });
        }

        // Extract sensitive data
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { uid, deleted, ...response } = template;

        return res.status(200).json(response as TemplateResponse);
    } catch (error) {
        console.error("Error retrieving template data:", error);
        return res.status(500).json({
            message: "An internal server error occurred while retrieving the template data",
        });
    }
}

export default verifyTokenMiddleware(handler);