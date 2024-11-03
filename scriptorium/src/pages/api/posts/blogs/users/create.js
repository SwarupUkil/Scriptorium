import prisma from "../../../../../utils/database";
import { verifyToken } from "../../../../../utils/auth";

export default async function handler(req, res) {

    const user = verifyToken(req.headers.authorization);

    if (req.method !== "POST") {
        return res.status(405).send({message: "Method not allowed"})
    }

    if (!user) {
        return res.status(401).json({message: "Unauthorized"});
    }

    const { id, type } = user;

    if (type !== "USER" && type === "ADMIN") {
        return res.status(401).json({message: "Unauthorized"});
    }

    const { title, description, tags, templates } = user;

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

    if (typeof tags !== "undefined" && typeof tags !== "string") {
        return res.status(400).json({message: "Tags must be given following CSV notation"});
    }

    if (!tags && tags.length > 100) {
        return res.status(400).json({message: "Too many tags, shorten to less then 100 characters in CSV form"});
    }

    if (!templates && !Array.isArray(templates)) {
        return res.status(400).json({message: "Templates must be given as an array"});
    }

    try {
        const post = await prisma.post.create({
            data: {
                uid: id,
                content: description,
            },
            select: {
                id: true,
            },
        });

        const blog = await prisma.blog.create({
            data: {
                postId: post.id,
                title: title,
                tags: tags,
            },
            select: {id: true},
        });

        // After creating a blog. Add for each template linked in blog, this blog's ID.
        for (let template of templates) {
            template = Number(template);

            if (isNaN(template)) {
                return res.status(400).json({message: "Templates array must contain only integers"});
            }

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

        post.message = "Successfully created new blog";
        return res.status(200).json(post);
    } catch (error) {
        return res.status(400).json({ message: "An error occurred while creating the blog" });
    }
}