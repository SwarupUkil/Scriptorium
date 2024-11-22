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

        // Build `AND` conditions for tags
        const tagConditions =
            sanitizedTags.validTags.length > 0
                ? sanitizedTags.validTags.map(tag => ({
                    tags: { contains: tag }, // Simulates checking if the template contains this tag
                }))
                : undefined;

        const total = await prisma.blog.count({
            where: {
                title: title ? { contains: title } : undefined,
                post: {
                    content: description ? { contains: description } : undefined,
                    flagged: false,
                    deleted: false,
                },
                AND: tagConditions,
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

                AND: tagConditions,

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
            orderBy: orderBy === ORDER.CONTROVERSIAL ?
                { post: { totalRatings: order.toLowerCase() } } :  // Sort by controversy
                { post: { rating: order.toLowerCase() } },      // Default to rating sorting
        });

        // Remove `templates` from each blog object
        const sanitizedBlogs = blogs.map(blog => {
            const { templates, ...rest } = blog;
            return rest;
        });

        // Return identified blog data.
        return res.status(200).json(paginationResponse(sanitizedBlogs, total, paginate, "blogs"));
    } catch (error) {
        return res.status(500).json({ message: "An internal server error occurred while retrieving the blogs" });
    }
}

export default verifyTokenMiddleware(handler);