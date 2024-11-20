import {prisma} from "../../../../utils/db";
import { verifyTokenMiddleware } from "../../../../utils/auth";
import {AUTH} from "../../../../utils/validationConstants";

// Handler will return all the clients templates.
async function handler(req, res) {

    if (req.method !== "GET") {
        res.status(405).json({message: "Method not allowed"});
    }

    const user = req.user;
    const userId = user.id;

    try {
        const templates = await prisma.template.findMany({
            where: {
                uid: userId,
            },
            select: {
                id: true,
                title: true,
                tags: true,
            }
        });

        return res.status(200).json(templates);
    } catch (error) {
        return res.status(500).json({ message: "An internal server error occurred while retrieving the user templates" });
    }
}

export default verifyTokenMiddleware(handler, AUTH.USER);