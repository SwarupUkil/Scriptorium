import {prisma} from "../../../../utils/db";
import sanitizePagination from "../../../../utils/paginationHelper";

// Handler will give a generic list of IDs and titles of blogs.
export default async function handler(req, res) {

    if (req.method !== "GET") {
        res.status(405).json({message: "Method not allowed"});
    }

    const sortingBy = "rating";
    const order = "asc";

    // blogTags are given as a string following CSV formatting (i.e. spaced by commas).
    const { skip, take, blogTitle, desiredContent, blogTags, templateTitle } = req.body;

    const paginate = sanitizePagination(skip, take);

    if (typeof blogTags !== "undefined" && typeof blogTags !== "string") {
        return res.status(400).json({message: "Tags must be given following CSV notation"});
    }

    try {
        // CHATGPT 4.0 AIDED IN DEVELOPING THIS QUERY.
        const blogs = await prisma.blog.findMany({
            where: {
                title: blogTitle ? {contains: blogTitle, mode: "insensitive"} : undefined,

                // Filter by posts content and verify its not flagged posts.
                post: {
                    content: desiredContent ? {contains: desiredContent, mode: "insensitive"} : undefined,
                    flagged: false,
                    deleted: false,
                },
                tags: blogTags ? {contains: blogTags, mode: "insensitive"} : undefined,

                // Filter by Template title within related templates
                templates: {
                    some: templateTitle ? { title: { contains: templateTitle, mode: "insensitive" } } : undefined,
                },
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
            orderBy: {[sortingBy] : order},
        });

        // Error if either we found zero blogs.
        if (!blogs) {
            return res.status(400).json({ message: "No blog was found. Try loosening your search and check spelling.", isEmpty: true });
        }

        const response = {
            data: blogs, // Array of objects (e.g., comments or posts)
            message: paginate.message || null, // Message only included if there's a warning or note
        };

        // Return identified blog data.
        return res.status(200).json(response);
    } catch (error) {
        return res.status(400).json({ message: "An error occurred while retrieving the blogs" });
    }
}