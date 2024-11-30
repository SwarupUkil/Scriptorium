import {prisma} from "@/utils/db";
import { verifyTokenMiddleware } from "@/utils/auth";
import {AUTH, REPORT} from "@/utils/validateConstants";
import {NextApiRequest, NextApiResponse} from "next";


// Handler will attempt to flag a post appropriately or retrieve a list
// of reports based on recency, being open reports, and most reported posts.
async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {

    if (req.method !== "PUT") {
        return res.status(405).send({message: "Method not allowed"});
    }

    const { id, pid } = req.query;
    const reportId: number = Number(id);
    const postId: number = Number(pid);

    if (!id && !pid) {
        return res.status(400).send({message: "Missing report or post ID"});
    }

    if (id && isNaN(reportId)) {
        return res.status(400).send({message: "Report ID must be a integer"});
    }

    if (pid && isNaN(postId)) {
        return res.status(400).send({message: "Post ID must be a integer"});
    }

    if (id) {
        try {
            // Verify the report exists.
            const report: {id: number;} | null = await prisma.report.findUnique({
                where: {id: reportId},
                select: {id: true},
            })

            if (!report) {
                return res.status(404).send({message: "Report not found"});
            }

            await prisma.report.update({
                where: { id: reportId, },
                data: { status: REPORT.RESOLVED },
                select: { id: true },
            });

            return res.status(200).json({ message: "Singular report successfully resolved" });
        } catch {
            return res.status(400).send({message: "An internal server error occurred closing reports"});
        }
    } else {
        try {
            const post: {id: number} | null = await prisma.post.findUnique({
                where: {id: postId},
                select: {id: true},
            })

            if (!post) {
                return res.status(400).send({message: "Post does not exist"});
            }

            const updateCount: {count: number} = await prisma.report.updateMany({
                where: {
                    postId: postId,
                },
                data: { status: REPORT.RESOLVED },
            });

            if (updateCount.count === 0) {
                return res.status(200).json({ message: "No reports found for the specified criteria" });
            }

            return res.status(200).json({ message: "All associated reports successfully resolved" });
        } catch {
            return res.status(500).json({ message: "An internal server error occurred closing reports" });
        }
    }
}

export default verifyTokenMiddleware(handler, AUTH.ADMIN);