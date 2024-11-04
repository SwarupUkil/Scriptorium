import {prisma} from "../../../../../utils/db";
import { verifyTokenMiddleware } from "../../../../../utils/auth";
import validateTags from "../../../../../utils/validateTags";

// Handler will attempt to create a new blog posting.
async function handler(req, res) {

    const user = req.user;

    if (req.method !== "POST") {
        return res.status(405).send({message: "Method not allowed"})
    }

    const { id } = user;
    const { title, description, tags, templates } = req.body;

    //  Limit user blog data:
    //      title: must be given, max 100 chars
    //      description: must be given,
    //      tags: not necessary to have, max 100 chars
    //      templates: not necessary to have, must be an array
    if (!title || !description) {
        return res.status(400).json({message: "Missing title or description"});
    }

    if (title.length > 100) {
        return res.status(400).json({message: "Title is too large"});
    }

    if (description.length > 5000) {
        return res.status(400).json({message: "Description is too large"});
    }

    if (typeof tags !== "undefined" && typeof tags !== "string") {
        return res.status(400).json({message: "Tags must be given as one long CSV styled string"});
    }

    if (tags && tags.length > 100) {
        return res.status(400).json({message: "Too many tags, shorten to less then 100 characters in CSV form"});
    }

    if (tags && !validateTags(tags)) {
        return res.status(400).json({message: "Tags must be given following CSV notation (no spaces)"});
    }

    if (templates && !Array.isArray(templates)) {
        return res.status(400).json({message: "Templates must be given as an array"});
    }

    try {
        const post = await prisma.post.create({
            data: {
                uid: id,
                content: description,
                type: "BLOG",
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
        if (!(!templates)) {
            for (let template of templates) {
                template = Number(template);

                if (isNaN(template)) {
                    return res.status(400).json({message: "Templates array must contain only integers"});
                }

                // IMPORTANT: blogs in User table contains blog.id, not blog.postId!
                const updatedTemplate = await prisma.template.update({
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

        const updateUserPosts = await prisma.user.update({
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
        console.log("Error creating post:", error);
        return res.status(400).json({ message: "An error occurred while creating the blog" });
    }
}

export default verifyTokenMiddleware(handler, "USER");