import {prisma} from "../../../../utils/db";
import {verifyTokenMiddleware} from "../../../../utils/auth";

async function handler(req, res) {

    const { id, description } = req.body;
    const postId = Number(id);

    if (!id) {
        return res.status(404).json({ error: "Invalid ID: missing blog ID" });
    }

    if (isNaN(postId)) {
        return res.status(400).json({ error: "Invalid ID: not a number" });
    }

    if (!description) {
        return res.status(404).json({ error: "Invalid description" });
    }

    if (description.length > 1000) {
        return res.status(400).json({ error: "Description is too large (<1001 characters)" });
    }


    const user = req.user;
    const userId = user.id;

    if (req.method !== "POST") {
        return res.status(405).json({message: "Method not allowed"});
    }

    try {
        // First create a new post.
        // Then using that postId make a new comment.
        // Finally update parent replies[] to include this another reply.
        // Similarly with User.
        const newPost = await prisma.post.create({
            data: {
                uid: userId,
                content: description,
                type: "COMMENT",
            },
            select: {id: true}
        });

        const newComment = await prisma.comment.create({
            data: {
                postId: newPost.id, // this post's ID
                parentId: postId,   // the post parent this post is under
            }
        });

        const updateParentPostReplies = await prisma.post.update({
            where: {id: postId},
            data: {
                replies: {
                    connect: {id: newComment.id},
                },
            },
        });

        const updateUserPosts = await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                posts: {
                    connect: newPost.id,
                }
            },
        });

        return res.status(200).json({message: "Successfully created comment"});
    } catch (error) {
        return res.status(400).json({ message: "An error occurred while creating the reply" });
    }
}

export default verifyTokenMiddleware(handler, "USER");