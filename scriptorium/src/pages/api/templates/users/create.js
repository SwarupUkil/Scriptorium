import {prisma} from "../../../../utils/db";
import { verifyTokenMiddleware } from "../../../../utils/auth";
import {MAX_TITLE, MAX_EXPLANATION, MAX_TAGS, MAX_CODE} from "../../../../utils/validationConstants";
import validateTags from "../../../../utils/validateTags";
import {parseLanguage} from "../../../../utils/validateLanguage";


// Handler will create a new template for client.
async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).send({message: "Method not allowed"})
    }

    const user = req.user;
    const userId = user.id;
    const { title, explanation, tags, code, language } = req.body;

    //  Limit user template data:
    //      title: must be given, max 100 chars
    //      explanation: must be given, max 3000 characters
    //      tags: not necessary to have, max 100 chars
    //      code: must be given, max 15000 characters
    //      language: must be given
    if (!title || !explanation || !code || !language) {
        return res.status(400).json({message: "Missing title, explanation, code, or language"});
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

    if (typeof tags !== "undefined" && typeof tags !== "string") {
        return res.status(400).json({message: "Tags must be given as one long CSV styled string"});
    }

    if (tags && tags.length > MAX_TAGS) {
        return res.status(400).json({message: `Too many tags, shorten to less then ${MAX_TAGS + 1} characters in CSV form`});
    }

    if (tags && !validateTags(tags)) {
        return res.status(400).json({message: "Tags must be given following CSV notation (no spaces)"});
    }

    const codeLanguage = parseLanguage(language);
    if (!codeLanguage) {
        return res.status(400).json({message: "Code language is invalid"});
    }

    try {
        // First, check if the user exists before creating the new post.
        const userExists = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!userExists) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const template = await prisma.template.create({
            data: {
                uid: userId,
                code: code,
                language: codeLanguage,
                title: title,
                explanation: explanation,
                tags: tags ? tags : null,
                forkedFrom: null,
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
        return res.status(400).json({ message: "An error occurred while creating the template" });
    }
}

export default verifyTokenMiddleware(handler, AUTH.USER);