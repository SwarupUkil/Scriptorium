import {prisma} from "../../../../utils/db";
import { verifyTokenMiddleware } from "../../../../utils/auth";
import {MAX_TITLE, MAX_EXPLANATION, MAX_TAGS, MAX_CODE, AUTH, PRIVACY} from "../../../../utils/validateConstants";
import validateTags from "../../../../utils/validateTags";
import {parseLanguage} from "../../../../utils/validateLanguage";


// Handler will create a new template for client.
async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).send({message: "Method not allowed"})
    }

    const user = req.user;
    const userId = user.id;
    const { title, explanation, tags, code, language, privacy } = req.body;

    //  Limit user template data:
    //      title: must be given, max 100 chars
    //      explanation: not necessary be given, max 3000 characters
    //      tags: not necessary to have, max 100 chars
    //      code: must be given, max 15000 characters
    //      language: must be given
    //      privacy: defaults to PRIVATE if not given.
    if (!title || !code || !language) {
        return res.status(400).json({message: "Missing title, code, or language"});
    }

    if (title.length > MAX_TITLE) {
        return res.status(400).json({message: "Title is too large"});
    }

    if (explanation.length > MAX_EXPLANATION) {
        return res.status(400).json({message: "Description is too large"});
    }

    if (code.length > MAX_CODE) {
        return res.status(400).json({message: "Code is too large"});
    }

    if (tags && tags.length > MAX_TAGS) {
        return res.status(400).json({message: `Too many tags, shorten to less then ${MAX_TAGS + 1} characters in CSV form`});
    }

    const sanitizedTags = validateTags(tags);
    if (tags && !sanitizedTags.isValid) {
        return res.status(400).json({message: sanitizedTags.message});
    }

    const codeLanguage = parseLanguage(language);
    if (!codeLanguage) {
        return res.status(400).json({message: "Code language is invalid"});
    }

    if (privacy && !Object.values(PRIVACY).includes(privacy)) {
        return res.status(400).json({message: `Privacy is invalid. Must be one of: ${Object.values(PRIVACY).join(", ")}`,});
    }

    try {
        // First, check if the user exists before creating the new post.
        const userExists = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!userExists) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        // Convert sanitized tags to CSV format
        const csvTags = sanitizedTags.validTags.length > 0 ? sanitizedTags.validTags.join(",") : undefined;

        const template = await prisma.template.create({
            data: {
                uid: userId,
                username: user.username,
                code: code,
                language: codeLanguage,
                title: title,
                explanation: explanation,
                tags: csvTags || "",
                forkedFrom: null,
                privacy: privacy ? privacy : PRIVACY.PRIVATE, // default to private
            },
            select: {
                id: true,
            },
        });

        if (!template) {
            return res.status(400).json({message: "Unable to create new template"});
        }

        template.message = "Successfully created new template";
        return res.status(200).json(template);
    } catch (error) {
        return res.status(400).json({ message: "An internal server error occurred while creating the template" });
    }
}

export default verifyTokenMiddleware(handler);