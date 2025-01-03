import { prisma } from "@/utils/db";
import {NextApiReq, UserTokenData, verifyTokenMiddleware} from "@/utils/auth";
import { sanitizePagination, paginationResponse } from "@/utils/paginationHelper";
import type { NextApiResponse } from "next";

// Handler to return all the user's blogs
async function handler(req: NextApiReq & {user: object}, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const user: UserTokenData = req.user;
    const userId = user?.id;

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const { skip, take } = req.query;
    const paginate = sanitizePagination(skip as string | undefined, take as string | undefined);

    try {
        const total = await prisma.blog.count({
            where: {
                post: {
                    uid: userId,
                    deleted: false,
                },
            },
        });

        const blogs = await prisma.blog.findMany({
            where: {
                post: {
                    uid: userId,
                    deleted: false,
                },
            },
            select: {
                postId: true,
                title: true,
                tags: true,
                post: {
                    select: {
                        rating: true,
                    },
                },
            },
            skip: paginate.skip,
            take: paginate.take,
        });

        const formattedBlogs = blogs.map((blog) => ({
            postId: blog.postId,
            title: blog.title,
            tags: blog.tags,
            rating: blog.post.rating,
        }));

        return res.status(200).json(paginationResponse(formattedBlogs, total, paginate, "blogs"));
    } catch (error) {
        console.error("Error fetching blogs:", error);
        return res.status(500).json({
            message: "An internal server error occurred while retrieving the user's blogs.",
        });
    }
}

export default verifyTokenMiddleware(handler);