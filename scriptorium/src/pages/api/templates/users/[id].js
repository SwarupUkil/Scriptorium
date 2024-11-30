import {prisma} from "../../../../utils/db";
import {verifyTokenMiddleware} from "../../../../utils/auth";

// Handler will return a specific template that is authorized (public).
async function handler(req, res) {

    if (req.method !== "GET") {
        return res.status(405).json({message: "Method not allowed"});
    }

    const { id } = req.query;
    const templateId = Number(id);
    const user = req.user;
    const userId = user.id;

    if (!id) {
        return res.status(404).json({ error: "Invalid ID: missing template ID" });
    }

    if (isNaN(templateId)) {
        return res.status(400).json({ error: "Invalid ID: not a number" });
    }

    try {
        // First, check if the user exists before creating the new post.
        const userExists = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!userExists) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const template = await prisma.template.findUnique({
            where: {
                id: templateId,
                uid: userId,
            }
        });

        if (!template) {
            return res.status(404).json({ error: "Template not found or is not owned" });
        }

        // Extract sensitive data from template.
        const {uid, deleted, ...response} = template;

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({ message: "An internal server error occurred while retrieving the template data" });
    }
}

export default verifyTokenMiddleware(handler);