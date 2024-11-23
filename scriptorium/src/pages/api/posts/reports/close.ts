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

    const { id } = req.query;
    const { uid } = req.body;
    const postId: number = Number(id);
    const userId: number | undefined = Number(uid);

    if (!id) {
        return res.status(400).send({message: "Missing post ID"});
    }

    if (isNaN(postId)) {
        return res.status(400).send({message: "Post ID must be a integer"});
    }

    if (uid && isNaN(userId)) {
        return res.status(400).send({message: "User ID must be a integer"});
    }

    // Verify the user exists.
    if (uid) {
        try {
            const user = await prisma.user.findUnique({
                where: {id: userId},
            })

            if (!user) {
                return res.status(400).send({message: "User does not exist"});
            }
        } catch (error) {
            return res.status(500).json({ message: "Error validating user existence" });
        }
    }

    // Close report.
    try {
        const post = await prisma.post.findUnique({
            where: {id: postId},
        })

        if (!post) {
            return res.status(400).send({message: "Post does not exist"});
        }

        const updateCount = await prisma.report.updateMany({
            where: {
                postId: postId,
                ...(uid !== undefined ? { uid } : {}), // Add uid to the filter only if provided
            },
            data: { status: REPORT.RESOLVED },
        });

        if (updateCount.count === 0) {
            return res.status(200).json({ message: "No reports found for the specified criteria" });
        }

        return res.status(200).json({ message: "Reports successfully resolved" });
    } catch (error) {
        return res.status(500).json({ message: "An internal server error occurred closing reports" });
    }
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export default verifyTokenMiddleware(handler, AUTH.ADMIN);