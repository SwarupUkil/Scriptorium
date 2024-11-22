import {prisma} from "../../../../utils/db";
import { verifyTokenMiddleware } from "../../../../utils/auth";
import {AUTH} from "../../../../utils/validateConstants";
import {sanitizePagination, paginationResponse} from "../../../../utils/paginationHelper";

// Handler will return all the clients templates.
async function handler(req, res) {

    if (req.method !== "GET") {
        res.status(405).json({message: "Method not allowed"});
    }

    const user = req.user;
    const userId = user.id;

    const { skip, take } = req.query;
    const paginate = sanitizePagination(skip, take);

    try {
        const total = await prisma.template.count({
            where: {
                uid: userId,
                deleted: false,
            },
        });

        const templates = await prisma.template.findMany({
            where: {
                uid: userId,
                deleted: false,
            },
            select: {
                id: true,
                title: true,
                tags: true,
            },
            skip: paginate.skip,
            take: paginate.take,
        });

        return res.status(200).json(paginationResponse(templates, total, paginate, "templates"));
    } catch (error) {
        return res.status(500).json({ message: "An internal server error occurred while retrieving the user templates" });
    }
}

export default verifyTokenMiddleware(handler, AUTH.USER);