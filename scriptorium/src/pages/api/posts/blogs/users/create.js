import {prisma} from "../../../../../utils/db";
import { verifyTokenMiddleware } from "../../../../../utils/auth";
import validateTags from "../../../../../utils/validateTags";
import {AUTH, MAX_BLOG_DESCRIPTION, MAX_TAGS, MAX_TITLE, POST} from "../../../../../utils/validationConstants";

// Handler will attempt to create a new blog posting.
async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).send({message: "Method not allowed"})
    }

    const user = req.user;
    const { id } = user;
    const { title, description, tags, templates } = req.body;

    if (!title || !description) {
        return res.status(400).json({message: "Missing title or description"});
    }

    if (title.length > MAX_TITLE) {
        return res.status(400).json({message: `Title is too large, shorten to less then ${MAX_TITLE}`});
    }

    if (description.length > MAX_BLOG_DESCRIPTION) {
        return res.status(400).json({message: `Description is too large, shorten to less then ${MAX_BLOG_DESCRIPTION}`});
    }

    if (typeof tags !== "undefined" && typeof tags !== "string") {
        return res.status(400).json({message: "Tags must be given as one long CSV styled string"});
    }

    if (tags && tags.length > MAX_TAGS) {
        return res.status(400).json({message: `Too many tags, shorten to less then ${MAX_TAGS + 1} characters in CSV form`});
    }

    if (tags && !validateTags(tags)) {
        return res.status(400).json({message: "Tags must be given following CSV notation (no spaces)"});
    }

    if (templates && !Array.isArray(templates)) {
        return res.status(400).json({message: "Templates must be given as an array"});
    }

    try {

        // First, check if the user exists before creating the new post.
        const userExists = await prisma.user.findUnique({
            where: { id: id },
        });

        if (!userExists) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const post = await prisma.post.create({
            data: {
                uid: id,
                content: description,
                type: POST.BLOG,
            },
            select: {
                id: true,
            },
        });

        if (!post) {
            return res.status(400).json({message: "Unable to create new posting"});
        }

        const blog = await prisma.blog.create({
            data: {
                postId: post.id,
                title: title,
                tags: tags,
            },
            select: {id: true},
        });

        if (!blog) {
            return res.status(400).json({message: "Unable to create new blog"});
        }

        // After creating a blog. Add for each template linked in blog, this blog's ID.
        if (templates) {
            for (let template of templates) {
                template = Number(template);

                if (isNaN(template)) {
                    return res.status(400).json({message: "Templates array must contain only integers"});
                }

                // IMPORTANT: blogs in User table contains blog.id, not blog.postId!
                await prisma.template.update({
                    where: {
                        id: template,
                    },
                    data: {
                        blogs: {
                            connect: { id: blog.id }, // Connect the new Blog by its id
                        },
                    },
                });
            }
        }

        await prisma.user.update({
            where: {
                id: id,
            },
            data: {
                posts: {
                    connect: {id: post.id},
                }
            },
        });

        post.message = "Successfully created new blog";
        return res.status(200).json(post);
    } catch (error) {
        return res.status(500).json({ message: "An internal server error occurred while creating the blog" });
    }
}

export default verifyTokenMiddleware(handler, AUTH.USER);