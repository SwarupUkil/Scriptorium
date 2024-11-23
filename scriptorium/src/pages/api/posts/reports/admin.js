import {prisma} from "../../../../utils/db";
import { verifyTokenMiddleware } from "../../../../utils/auth";
import {paginationResponse, sanitizePagination} from "../../../../utils/paginationHelper";
import {AUTH, REPORT} from "../../../../utils/validateConstants";

// Handler will attempt to flag a post appropriately or retrieve a list
// of reports based on recency, being open reports, and most reported posts.
async function handler(req, res) {

    if (req.method === "PUT") {
        const { id, flag } = req.query;
        const postId = Number(id);

        if (!id || !flag) {
            return res.status(400).send({message: "Missing post ID or flag (true is hide post or false is unhide post)"});
        }

        if (isNaN(postId)) {
            return res.status(400).send({message: "Post ID must be a integer"});
        }

        const postFlag = flag.replace(/\s+/g, '');

        if (postFlag !== "false" && postFlag !== "true") {
            return res.status(400).send({message: "Post flag must be `true` or `false` (spelled exactly)"});
        }

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
            return res.status(500).json({ message: "An error occurred flagging post" });
        }
    } else if (req.method === "GET") {

        const { skip, take } = req.query;
        const paginate = sanitizePagination(skip, take);

        try {
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            const totalNumberOfPosts = await prisma.$queryRaw`
                SELECT COUNT(DISTINCT postId)
                FROM Report
                WHERE createdAt >= ${sixMonthsAgo} AND LOWER(status) = LOWER(${REPORT.OPEN})
            `;
            const total = Number(totalNumberOfPosts[0]['COUNT(DISTINCT postId)']); // Convert BigInt to Number

            const getReports = await prisma.$queryRaw`
                SELECT postId, COUNT(*) as reportCount, uid, explanation
                FROM Report
                WHERE createdAt >= ${sixMonthsAgo} AND LOWER(status) = LOWER(${REPORT.OPEN})
                GROUP BY postId
                ORDER BY reportCount DESC
                LIMIT ${paginate.take} OFFSET ${paginate.skip};
            `;

            const reports = convertReportCountToNumber(getReports);
            const response = paginationResponse(reports, total, paginate, "reports")

            return res.status(200).json(response);
        } catch (error) {
            return res.status(500).json({message: "An internal server error occurred fetching reported posts" });
        }
    } else {
        return res.status(405).send({message: "Method not allowed"})
    }
}

function convertReportCountToNumber(dataArray) {
    return dataArray.map(item => ({
        ...item,
        reportCount: Number(item.reportCount),
    }));
}

export default verifyTokenMiddleware(handler, AUTH.ADMIN);