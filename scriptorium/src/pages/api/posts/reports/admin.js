import {prisma} from "../../../../utils/db";
import { verifyTokenMiddleware } from "../../../../utils/auth";
import sanitizePagination from "../../../../utils/paginationHelper";

// Handler will attempt to flag a post appropriately or retrieve a list
// of reports based on recency, being open reports, and most reported posts.
async function handler(req, res) {

    if (req.method === "PUT") {
        const { id, flag } = req.body;
        const postId = Number(id);
        const postFlag = flag.replace(/\s+/g, '');

        if (!id || !flag) {
            return res.status(400).send({message: "Missing post ID or flag (true is hide post or false is unhide post)"});
        }

        if (isNaN(postId)) {
            return res.status(400).send({message: "Post ID must be a integer"});
        }

        if (postFlag !== "false" && postFlag !== "true") {
            return res.status(400).send({message: "Post flag must be `true` or `false` (spelled exactly)"});
        }

        // const resolve = isResolved ? (isResolved.replace(/\s+/g, '') === "true") : false;

        try {
            const postExists = await prisma.post.findUnique({
                where: { id: postId },
            });

            if (!postExists) {
                return res.status(400).json({ message: "Invalid post ID" });
            }

            await prisma.post.update({
                where: {
                    id: postId,
                },
                data: {
                    flagged: postFlag === "true",
                },
            });

            return res.status(200).json({message: `Successfully ${postFlag === "true" ? "hide" : "unhide"} post`});
        } catch (error) {
            return res.status(400).json({ message: "An error occurred flagging post" });
        }
    } else if (req.method === "GET") {

        const { skip, take } = req.query;
        const paginate = sanitizePagination(skip, take);

        try {
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            const getReports = await prisma.$queryRaw`
                SELECT postId, COUNT(*) as reportCount
                FROM Report
                WHERE createdAt >= ${sixMonthsAgo.toISOString()} AND status = 'OPEN'
                GROUP BY postId
                ORDER BY reportCount DESC
                LIMIT ${paginate.take} OFFSET ${paginate.take};
            `;

            return res.status(200).json(getReports);
        } catch (error) {
            return res.status(400).json({message: "An error occurred fetching reported posts" });
        }
    } else {
        return res.status(405).send({message: "Method not allowed"})
    }
}

export default verifyTokenMiddleware(handler, "ADMIN");