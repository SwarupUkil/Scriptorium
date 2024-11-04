import {prisma} from "../../../utils/db";
import { verifyTokenMiddleware } from "../../../utils/auth";

// Handler will return a specific template is authorized (public).
async function handler(req, res) {

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

        return res.status(200).json(template);
    } catch (error) {
        return res.status(400).json({ message: "An error occurred while retrieving the template data" });
    }
}

export default verifyTokenMiddleware(handler);