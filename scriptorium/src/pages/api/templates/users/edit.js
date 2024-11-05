import {prisma} from "../../../../utils/db";
import { verifyTokenMiddleware } from "../../../../utils/auth";
import {MAX_CODE, MAX_EXPLANATION, MAX_TAGS, MAX_TITLE, PRIVACY} from "../../../../utils/validationConstants";
import validateTags from "../../../../utils/validateTags";
import {parseLanguage} from "../../../../utils/validateLanguage";

// Handler will update the clients templates with specified values.
async function handler(req, res) {

    if (req.method !== "PUT" && req.method !== "DELETE") {
        return res.status(405).json({message: "Method not allowed"});
    }

    const { id } = req.body;
    const templateId = Number(id);

    if (!id) {
        return res.status(404).json({ error: "Invalid ID: missing blog ID" });
    }

    if (isNaN(templateId)) {
        return res.status(400).json({ error: "Invalid ID: not a number" });
    }

    const user = req.user;
    const userId = user.id;

    // Check if the blog exists and if the user ID matches
    try {
        const template = await prisma.template.findUnique({
            where: {
                id: templateId,
                uid: userId,
            },
        });

        if (!template || Number(template.uid) !== userId) {
            return res.status(401).json({ message: "Unauthorized or Template not found." });
        }
    } catch (error) {
        return res.status(400).json({ message: "An error occurred while authorizing the update template query" });
    }

    if (req.method === "PUT") {
        const { title, explanation, tags, code, language, privacy } = req.body;

        if (title && title.length > MAX_TITLE) {
            return res.status(400).json({message: "Title is too large"});
        }

        if (explanation && explanation.length > MAX_EXPLANATION) {
            return res.status(400).json({message: "Description is too large"});
        }

        if (code && code.length > MAX_CODE) {
            return res.status(400).json({message: "Code is too large"});
        }

        if (typeof tags !== "undefined" && typeof tags !== "string") {
            return res.status(400).json({message: "Tags must be given as one long CSV styled string"});
        }

        if (tags && tags.length > MAX_TAGS) {
            return res.status(400).json({message: `Too many tags, shorten to less then ${MAX_TAGS + 1} characters in CSV form`});
        }

        if (tags && !validateTags(tags)) {
            return res.status(400).json({message: "Tags must be given following CSV notation (no spaces)"});
        }

        const codeLanguage = language ? parseLanguage(language) : undefined;
        if (!codeLanguage && codeLanguage !== undefined) {
            return res.status(400).json({message: "Code language is invalid"});
        }

        if (privacy && !PRIVACY.includes(privacy)) {
            return res.status(400).json({message: `Privacy is invalid. Must be from ${PRIVACY}`});
        }

        try {
            await prisma.template.update({
                where: {
                    id: templateId,
                },
                data: {
                    code: code,
                    language: codeLanguage,
                    title: title,
                    explanation: explanation,
                    tags: tags ? tags : undefined,
                    privacy: privacy ? privacy : PRIVACY[1], // default to private
                },
            });

            return res.status(200).json({message: "Successfully updated template"});
        } catch (error) {
            return res.status(400).json({ message: "An error occurred while updating the template" });
        }
    } else {
        try {
            await prisma.template.update({
                where: {
                    id: templateId,
                },
                data: {
                    code: "",
                    language: "",
                    title: "",
                    explanation: "",
                    tags: null,
                    privacy: PRIVACY[1],
                    deleted: true,
                },
            });

            return res.status(200).json({message: "Successfully deleted template"});
        } catch (error) {
            return res.status(400).json({ message: "An error occurred while deleting the template" });
        }
    }
}

export default verifyTokenMiddleware(handler, "USER");