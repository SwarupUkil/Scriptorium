import {prisma} from "../../../utils/db";

// Handler will return a specific template that is authorized (public).
export default async function handler(req, res) {

    if (req.method !== "GET") {
        return res.status(405).json({message: "Method not allowed"});
    }

    const { id } = req.query;
    const templateId = Number(id);

    if (!id) {
        return res.status(404).json({ error: "Invalid ID: missing template ID" });
    }

    if (isNaN(templateId)) {
        return res.status(400).json({ error: "Invalid ID: not a number" });
    }

    try {
        const template = await prisma.template.findUnique({
            where: {
                id: templateId,
                privacy: "PUBLIC",
            }
        });

        if (!template) {
            return res.status(404).json({ error: "Template not found or is private" });
        }

        // Extract sensitive data from template.
        const {uid, deleted, ...response} = template;

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({ message: "An internal server error occurred while retrieving the template data" });
    }
}