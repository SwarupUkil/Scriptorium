import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/db";
import { verifyTokenMiddleware } from "@/utils/auth";
import {
    MAX_TITLE,
    MAX_EXPLANATION,
    MAX_TAGS,
    MAX_CODE,
    PRIVACY,
} from "@/utils/validateConstants";
import validateTags from "@/utils/validateTags";
import { parseLanguage } from "@/utils/validateLanguage";

type RequestWithUser = NextApiRequest & {
    user: { id: number };
};

// Handler will update the client's templates with specified values.
async function handler(
    req: RequestWithUser,
    res: NextApiResponse<{ message: string }>
) {
    if (req.method !== "PUT" && req.method !== "DELETE") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const { id } = req.body;
    const templateId = Number(id);

    if (!id) {
        return res.status(404).json({ message: "Invalid ID: missing template ID" });
    }

    if (isNaN(templateId)) {
        return res.status(400).json({ message: "Invalid ID: not a number" });
    }

    const user = req.user;
    const userId = user.id;

    try {
        // Check if the template exists and if the user ID matches
        const template = await prisma.template.findUnique({
            where: { id: templateId, uid: userId },
        });

        if (!template) {
            return res.status(401).json({ message: "Unauthorized or Template not found." });
        }

        if (req.method === "PUT") {
            const { title, explanation, tags, code, language, privacy } = req.body;

            // Validate inputs
            if (!title || !language) {
                return res.status(400).json({ message: "Missing title or language" });
            }

            if (title && title.length > MAX_TITLE) {
                return res.status(400).json({ message: "Title is too large" });
            }

            if (explanation && explanation.length > MAX_EXPLANATION) {
                return res.status(400).json({ message: "Description is too large" });
            }

            if (code && code.length > MAX_CODE) {
                return res.status(400).json({ message: "Code is too large" });
            }

            if (tags && tags.length > MAX_TAGS) {
                return res.status(400).json({
                    message: `Too many tags, shorten to less than ${MAX_TAGS + 1} characters in CSV form`,
                });
            }

            const sanitizedTags = validateTags(tags);
            if (tags && !sanitizedTags.isValid) {
                return res.status(400).json({ message: sanitizedTags.message });
            }

            const codeLanguage = language ? parseLanguage(language) : undefined;
            if (!codeLanguage && codeLanguage !== undefined) {
                return res.status(400).json({ message: "Code language is invalid" });
            }

            if (privacy && !Object.values(PRIVACY).includes(privacy)) {
                return res.status(400).json({
                    message: `Privacy is invalid. Must be one of: ${Object.values(PRIVACY).join(", ")}`,
                });
            }

            // Update template
            await prisma.template.update({
                where: { id: templateId },
                data: {
                    code,
                    language: codeLanguage,
                    title,
                    explanation,
                    tags: sanitizedTags.validTags.join(","),
                    privacy: privacy || PRIVACY.PRIVATE, // Default to private
                },
            });

            return res.status(200).json({ message: "Successfully updated template" });
        } else {
            // DELETE request: Soft-delete template
            await prisma.template.update({
                where: { id: templateId },
                data: { deleted: true },
            });

            return res.status(200).json({ message: "Successfully deleted template" });
        }
    } catch (error) {
        console.error("Error updating/deleting template:", error);
        return res.status(500).json({
            message: "An internal server error occurred while processing the template",
        });
    }
}

export default verifyTokenMiddleware(handler);