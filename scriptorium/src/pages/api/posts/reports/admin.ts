import { prisma } from "@/utils/db";
import { verifyTokenMiddleware, NextApiReq } from "@/utils/auth";
import { sanitizePagination, paginationResponse } from "@/utils/paginationHelper";
import { AUTH, REPORT } from "@/utils/validateConstants";
import type { NextApiResponse } from "next";

async function handler(req: NextApiReq, res: NextApiResponse): Promise<void> {
    if (req.method === "PUT") {
        const { id, flag } = req.query;
        const postId = Number(id);

        if (!id || !flag) {
            return res
                .status(400)
                .send({ message: "Missing post ID or flag (true is hide post or false is unhide post)" });
        }

        if (isNaN(postId)) {
            return res.status(400).send({ message: "Post ID must be an integer" });
        }

        const postFlag = (flag as string).replace(/\s+/g, "");

        if (postFlag !== "false" && postFlag !== "true") {
            return res
                .status(400)
                .send({ message: "Post flag must be `true` or `false` (spelled exactly)" });
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

            return res
                .status(200)
                .json({ message: `Successfully ${postFlag === "true" ? "hide" : "unhide"} post` });
        } catch (error: any) {
            return res
                .status(500)
                .json({ message: "An error occurred flagging post", details: error.message });
        }
    } else if (req.method === "GET") {
        const { skip, take, id } = req.query;
        const paginate = sanitizePagination(skip as string, take as string);
        const postId = Number(id);

        try {
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            const totalNumberOfPosts: unknown = postId && !isNaN(postId)
                ? await prisma.report.count({
                    where: {
                        postId: postId,
                        status: REPORT.OPEN,
                        createdAt: {
                            gte: sixMonthsAgo,
                        },
                    },
                })
                : await prisma.$queryRaw`
                        SELECT COUNT(DISTINCT postId)
                        FROM Report
                        WHERE createdAt >= ${sixMonthsAgo} AND LOWER(status) = LOWER(${REPORT.OPEN})
                `;

            const total = postId && !isNaN(postId)
                ? totalNumberOfPosts
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                :  Number(totalNumberOfPosts[0]["COUNT(DISTINCT postId)"]);

            const getReports: any[] = postId && !isNaN(postId)
                ? await prisma.report.findMany({
                    where: {
                        postId: postId,
                        status: REPORT.OPEN,
                        createdAt: {
                            gte: sixMonthsAgo,
                        },
                    },
                    select: {
                        id: true,
                        postId: true,
                        username: true,
                        explanation: true,
                        createdAt: true,
                    },
                    skip: paginate.skip,
                    take: paginate.take,
                })
                : await prisma.$queryRaw`
                        SELECT postId, COUNT(*) as reportCount
                        FROM Report
                        WHERE createdAt >= ${sixMonthsAgo} AND LOWER(status) = LOWER(${REPORT.OPEN})
                        GROUP BY postId
                        ORDER BY reportCount DESC
                            LIMIT ${paginate.take} OFFSET ${paginate.skip}
                `;

            const reports = postId && !isNaN(postId)
                ? getReports
                : convertReportCountToNumber(getReports);

            return res
                .status(200)
                .json(paginationResponse(reports, total as number, paginate, "reports"));
        } catch (error: any) {
            return res.status(500).json({
                message: "An internal server error occurred fetching reported posts",
                details: error.message,
            });
        }
    } else {
        return res.status(405).send({ message: "Method not allowed" });
    }
}

function convertReportCountToNumber(dataArray: any[]): any[] {
    return dataArray.map((item) => ({
        ...item,
        reportCount: Number(item.reportCount),
    }));
}

export default verifyTokenMiddleware(handler, AUTH.ADMIN);