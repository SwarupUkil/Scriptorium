import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/db";
import { Template } from "@/types/TemplateType"; // Assuming you have a Template type defined

type TemplateResponse = Omit<Template, "uid" | "deleted">;

// Handler will return a specific template that is authorized (public).
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const { id } = req.query;

    // Validate ID
    if (!id || Array.isArray(id)) {
        return res.status(400).json({ error: "Invalid ID: missing or multiple template IDs provided" });
    }

    const templateId = Number(id);

    if (isNaN(templateId)) {
        return res.status(400).json({ error: "Invalid ID: not a number" });
    }

    try {
        const template = await prisma.template.findUnique({
            where: {
                id: templateId,
                privacy: "PUBLIC",
            },
        });

        if (!template) {
            return res.status(404).json({ error: "Template not found or is private" });
        }

        // Extract sensitive data from template
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { uid, deleted, ...response }: TemplateResponse = template;

        return res.status(200).json(response);
    } catch (error) {
        console.error("Error retrieving template data:", error);
        return res.status(500).json({
            message: "An internal server error occurred while retrieving the template data",
        });
    }
}