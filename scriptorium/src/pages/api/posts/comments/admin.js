import {prisma} from "../../../../utils/db";
import { verifyTokenMiddleware } from "../../../../utils/auth";

async function handler(req, res) {

    if (req.method === "PUT") {
        const { id, flag } = req.body;
        const postId = Number(id);
        const postFlag = Boolean(flag);

        if (!id || !flag) {
            return res.status(400).send({message: "Missing post ID or flag (true is hide post or false is unhide post)"});
        }

        if (isNaN(postId)) {
            return res.status(400).send({message: "Post ID must be a integer"});
        }

        if (flag !== "false" || flag !== "true") {
            return res.status(400).send({message: "Post flag must be `true` or `false` (spelled exactly)"});
        }

        try {
            const postExists = await prisma.post.findUnique({
                where: { id: postId },
            });

            if (!postExists) {
                return res.status(400).json({ message: "Invalid post ID" });
            }

            const flaggedPost = await prisma.post.update({
                where: {
                    id: postId,
                },
                data: {
                    flagged: postFlag,
                },
            });

            return res.status(200).json({message: `Successfully ${postFlag ? "hide" : "unhide"} post`});
        } catch (error) {
            return res.status(400).json({ message: "An error occurred flagging post" });
        }
    } else if (req.method === "GET") {

    } else {
        return res.status(405).send({message: "Method not allowed"})
    }
}

export default verifyTokenMiddleware(handler, "USER");