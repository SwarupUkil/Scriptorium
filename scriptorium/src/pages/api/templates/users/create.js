import {prisma} from "../../../../utils/db";
import { verifyTokenMiddleware } from "../../../../utils/auth";

const MAX_TITLE = 100;
const MAX_CODE = 15000;

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

    if (title.length > 100) {
        return res.status(400).json({message: "Title is too large"});
    }

    if (explanation.length > 3000) {
        return res.status(400).json({message: "Description is too large"});
    }

}

export default verifyTokenMiddleware(handler, "USERS");