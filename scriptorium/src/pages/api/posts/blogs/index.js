import {prisma} from "../../../../utils/db";
import {paginationResponse, sanitizePagination} from "../../../../utils/paginationHelper";
import validateTags from "../../../../utils/validateTags";
import {verifyTokenMiddleware} from "../../../../utils/auth";
import {ORDER} from "../../../../utils/validateConstants";

// Handler will give a generic list of IDs and titles of blogs.
async function handler(req, res) {

    if (req.method !== "GET") {
        res.status(405).json({message: "Method not allowed"});
    }

    // tags are given as a string following CSV formatting (i.e. spaced by commas).
    const { skip, take, title, description, tags, templates, orderBy } = req.query;

    let order = ORDER.DESC;
    if (orderBy === ORDER.ASC) {
        order = ORDER.ASC;
    }

    const paginate = sanitizePagination(skip, take);

    const sanitizedTags = validateTags(tags);
    if (tags && !sanitizedTags.isValid) {
        return res.status(400).json({message: sanitizedTags.message});
    }

    try {

        const total = await prisma.blog.count({
            where: {
                title: title ? { contains: title } : undefined,
                post: {
                    content: description ? { contains: description } : undefined,
                    flagged: false,
                    deleted: false,
                },
                tags: sanitizedBlogTags ? { contains: sanitizedBlogTags } : undefined,
                ...(templates ? {
                    templates: {
                        some: { title: { contains: templates } },
                    },
                } : {}),
            },
        });

        // CHATGPT 4.0 AIDED IN DEVELOPING THIS QUERY.
        const blogs = await prisma.blog.findMany({
            where: {
                title: title ? {contains: title} : undefined,

                // Filter by posts that are not flagged or deleted
                post: {
                    content: description ? { contains: description } : undefined,
                    flagged: false,
                    deleted: false,
                },

                tags: sanitizedBlogTags ? { contains: sanitizedBlogTags } : undefined,

                // Filter by Template title within related templates
                ...(templates ? {
                    templates: {
                        some: { title: { contains: templates } }
                    }
                } : {}),
            },
            select: {
                postId: true,
                title: true,
                // Join between post and blog tables.
                post: {
                    select: {
                        id: true,
                        rating: true,
                        content: true,
                        flagged: true,
                        deleted: true,
                    },
                },

                // Include templates in the join.
                templates: {
                    select: {
                        id: true,
                        title: true,
                        privacy: true,
                    },
                },
            },
            skip: paginate.skip,
            take: paginate.take,
            orderBy: orderBy === ORDER.CONTROVERSIAL
                        ? { post: { totalRatings: order } } // Sort by totalRatings for controversial
                        : { post: { rating: order } },      // Default to rating sorting
        });

        // Return identified blog data.
        return res.status(200).json(paginationResponse(blogs, total, paginate, "blogs"));
    } catch (error) {
        return res.status(500).json({ message: "An internal server error occurred while retrieving the blogs" });
    }
}

export default verifyTokenMiddleware(handler);