import {prisma} from "../../../../utils/db";
import sanitizePagination from "../../../../utils/paginationHelper";
import validateTags from "../../../../utils/validateTags";
import {verifyTokenMiddleware} from "../../../../utils/auth";

// Handler will give a generic list of IDs and titles of blogs.
async function handler(req, res) {

    if (req.method !== "GET") {
        res.status(405).json({message: "Method not allowed"});
    }

    const order = "desc";

    // blogTags are given as a string following CSV formatting (i.e. spaced by commas).
    const { skip, take, blogTitle, desiredContent, blogTags, templateTitle } = req.query;

    const paginate = sanitizePagination(skip, take);

    if (typeof blogTags !== "undefined" && typeof blogTags !== "string") {
        return res.status(400).json({message: "Tags must be given following CSV notation"});
    }

    const sanitizedBlogTags = blogTags ? blogTags.replace(/\s+/g, '') : undefined;

    if (sanitizedBlogTags && !validateTags(sanitizedBlogTags)) {
        return res.status(400).json({message: "Tags must be given following CSV notation (no spaces)"});
    }

    try {
        // CHATGPT 4.0 AIDED IN DEVELOPING THIS QUERY.
        const blogs = await prisma.blog.findMany({
            where: {
                title: blogTitle ? {contains: blogTitle} : undefined,

                // Filter by posts content and verify its not flagged posts.
                ...(desiredContent ? {
                    post: {
                        content: desiredContent ? { contains: desiredContent } : undefined,
                        flagged: false,
                        deleted: false,
                    }
                } : {}),
                tags: sanitizedBlogTags ? { contains: sanitizedBlogTags } : undefined,

                // Filter by Template title within related templates
                ...(templateTitle ? {
                    templates: {
                        some: { title: { contains: templateTitle } }
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
            orderBy: {
                post: {
                    rating: order,
                },
            },
        });

        // Error if either we found zero blogs.
        if (Array.isArray(blogs) && blogs.length === 0) {
            return res.status(400).json({data: blogs, message: "No blog was found. Try loosening your search and check spelling.", isEmpty: true });
        }

        const response = {
            data: blogs, // Array of objects (e.g., comments or posts)
            message: paginate.message || null, // Message only included if there's a warning or note
            isEmpty: false,
        };

        // Return identified blog data.
        return res.status(200).json(response);
    } catch (error) {
        // console.error("Error retrieving blogs:", error);
        return res.status(400).json({ message: "An error occurred while retrieving the blogs" });
    }
}

export default verifyTokenMiddleware(handler);