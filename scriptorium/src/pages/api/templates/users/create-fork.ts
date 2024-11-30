import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/db";
import { verifyTokenMiddleware } from "@/utils/auth";
import { PRIVACY } from "@/utils/validateConstants";

type RequestWithUser = NextApiRequest & {
    user: { id: number; username: string };
};

// Handler will save a forked template for client.
async function handler(
    req: RequestWithUser,
    res: NextApiResponse<{ id?: number; message: string }>
) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const user = req.user;
    const userId = user.id;
    const templateId = Number(req.query.id);

    if (!req.query.id) {
        return res.status(404).json({ message: "Invalid ID: missing template ID to fork from" });
    }

    if (isNaN(templateId)) {
        return res.status(400).json({ message: "Invalid ID: template ID given is not a number" });
    }

    try {
        // First, check if the user exists before creating the new post.
        const userExists = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!userExists) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const templateForked = await prisma.template.findFirst({
            where: {
                id: templateId,
                deleted: false,
                OR: [
                    { privacy: PRIVACY.PUBLIC }, // Public template
                    { privacy: PRIVACY.PRIVATE, uid: userId }, // Private but owned by user
                ],
            },
        });

        if (!templateForked) {
            return res.status(404).json({ message: "Template not found or is private" });
        }

        const newTemplate = await prisma.template.create({
            data: {
                uid: userId,
                username: user.username,
                code: templateForked.code,
                language: templateForked.language,
                title: templateForked.title,
                explanation: templateForked.explanation,
                tags: templateForked.tags,
                privacy: templateForked.privacy,
                forkedFrom: templateId,
            },
        });

        // Update fork relationship
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

        // Successfully forked template
        return res
            .status(200)
            .json({ id: newTemplate.id, message: "Successfully forked template" });
    } catch (error) {
        console.error("Error forking template:", error);
        return res
            .status(500)
            .json({ message: "An internal server error occurred while forking the template" });
    }
}

export default verifyTokenMiddleware(handler);