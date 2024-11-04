import {prisma} from "../../../../utils/db";
import { verifyTokenMiddleware } from "../../../../utils/auth";

// Handler will return all the clients templates.
async function handler(req, res) {

    if (req.method !== "GET") {
        res.status(405).json({message: "Method not allowed"});
    }

    const user = req.user;
    const userId = user.id;

    try {
        const templates = await prisma.user.findMany({
            where: {
                id: userId,
            },
            select: {
                id: true,
                title: true,
                tags: true,
            }
        });

        return res.status(200).json(templates);
    } catch (error) {
        return res.status(400).json({ message: "An error occurred while retrieving the user templates" });
    }
}

export default verifyTokenMiddleware(handler, "USERS");