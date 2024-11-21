import {prisma} from "../../../../utils/db";
import { verifyTokenMiddleware } from "../../../../utils/auth";
import {AUTH, PRIVACY} from "../../../../utils/validateConstants";

// Handler will save a forked template for client.
async function handler(req, res) {

    if (req.method !== "POST") {
        res.status(405).json({message: "Method not allowed"});
    }

    const user = req.user;
    const userId = user.id;
    const templateId = Number(req.body.id);

    if (!req.body.id) {
        return res.status(404).json({ error: "Invalid ID: missing template ID to fork from" });
    }

    if (isNaN(templateId)) {
        return res.status(400).json({ error: "Invalid ID: template ID given is not a number" });
    }

    try {
        const templateForked = await prisma.template.findFirst({
            where: {
                id: templateId,
                privacy: PRIVACY.PUBLIC,
                deleted: false,
            },
        });

        if (!templateForked) {
            return res.status(404).json({ error: "Template not found or is private" });
        }

        const newTemplate = await prisma.template.create({
            data: {
                uid: userId,
                code: templateForked.code,
                language: templateForked.language,
                title: templateForked.title,
                explanation: templateForked.explanation,
                tags: templateForked.tags,
                privacy: PRIVACY.PUBLIC,
                forkedFrom: templateId,
            },
        });

        await prisma.template.update({
            where: {
                id: templateId,
            },
            data: {
                forks: {
                    connect: { id: newTemplate.id },
                },
            },
        });

        return res.status(200).json({id: newTemplate.id, message: "Successfully forked template"});
    } catch (error) {
        return res.status(500).json({ message: "An internal server error occurred while retrieving the templates" });
    }
}

export default verifyTokenMiddleware(handler, AUTH.USER);