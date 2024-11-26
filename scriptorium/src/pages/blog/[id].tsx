import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getBlog, getComment, getReplies } from "@/services/PostService";
import { Blog, Comment } from "@/types/PostType";
import { parseCSVToTags } from "@/utils/frontend-helper/apiHelper";
import BlogContent from "@/components/PostComponents/BlogContent";
import CommentList from "@/components/PostComponents/CommentList";
import CommentForm from "@/components/PostComponents/CommentForm";

// GPT pilled.
export default function BlogPost() {
    const router = useRouter();
    const { id } = router.query; // Extract the dynamic [id] from the route
    const [blog, setBlog] = useState<Blog | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingComments, setLoadingComments] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return; // Wait until id is available

        const fetchBlog = async () => {
            try {
                setLoading(true);
                const fetchedBlog = await getBlog(Number(id));
                if (!fetchedBlog) {
                    setError("Blog not found");
                } else {
                    setBlog(fetchedBlog);

                    // Fetch comments after blog is fetched
                    const response = await getReplies({id: Number(id)});
                    const [fetchedComments, pagination] = response ? response : [null, {}];

                    setComments(fetchedComments || []);
                }
            } catch (err) {
                setError("Failed to fetch blog data");
            } finally {
                setLoading(false);
                setLoadingComments(false);
            }
        };

        fetchBlog();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-gray-500">No blog data found.</p>
            </div>
        );
    }

    const formattedDate = blog.createdAt
        ? new Date(blog.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
        : "N/A";


    return (
        <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen flex flex-col">
            <div className="container mx-auto px-4 py-8">
                {/* Blog Metadata */}
                <div className="text-gray-500 dark:text-gray-400 text-sm flex flex-wrap gap-2">
                    <span>Author: {blog.username || "Unknown"}</span>
                    <span>•</span>
                    <span>Posted on: {formattedDate}</span>
                </div>

                {/* Blog Title */}
                <h1 className="text-4xl font-bold mb-4">{blog.title}</h1>

                {/* Blog Tags */}
                {blog.tags && blog.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {parseCSVToTags(blog.tags).map((tag, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 text-sm rounded-full bg-indigo-500 text-white"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Blog Content */}
                <BlogContent blog={blog} onLike={() => {
                    console.log("wow")
                }} onDislike={() => {
                    console.log("xox")
                }} onReply={() => {
                    console.log("zamn")
                }}/>

                {/* Comments Section */}
                <div className="mt-8">
                    <h2 className="text-2xl font-semibold mb-4">Comments</h2>
                    <CommentForm parentId={blog.postId} onCommentSubmit={() => {}}/>
                    <div className={"h-1 py-2"}></div>

                    {loadingComments ? (
                        <p className="text-gray-500">Loading comments...</p>
                    ) : (
                        <CommentList
                            comments={comments}
                            onLike={(commentId) => console.log(`Liked comment ${commentId}`)}
                            onDislike={(commentId) => console.log(`Disliked comment ${commentId}`)}
                            onReply={(commentId) => console.log(`Replying to comment ${commentId}`)}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}