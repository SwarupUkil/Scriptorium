import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getBlog, getComment, getReplies } from "@/services/PostService";
import { Blog, Comment } from "@/types/PostType";
import { parseCSVToTags } from "@/utils/frontend-helper/apiHelper";
import BlogContent from "@/components/PostComponents/BlogContent";
import CommentList from "@/components/PostComponents/CommentList";
import CommentForm from "@/components/PostComponents/CommentForm";
import Link from "next/link";

// GPT pilled.
export default function BlogPost() {
    const router = useRouter();
    const { id } = router.query; // Extract the dynamic [id] from the route
    const [blog, setBlog] = useState<Blog | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingComments, setLoadingComments] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const addComment = (newComment: Comment) => {
        setComments((prevComments) => [...prevComments, newComment]); // Append new comment
    };

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

                {/*/!* Blog Tags *!/*/}
                {/*{blog.tags && blog.tags.length > 0 && (*/}
                {/*    <div className="flex flex-wrap gap-2 mb-6">*/}
                {/*        {parseCSVToTags(blog.tags).map((tag, index) => (*/}
                {/*            <span*/}
                {/*                key={index}*/}
                {/*                className="px-3 py-1 text-sm rounded-full bg-indigo-500 text-white"*/}
                {/*            >*/}
                {/*                {tag}*/}
                {/*            </span>*/}
                {/*        ))}*/}
                {/*    </div>*/}
                {/*)}*/}

                {/*{blog.templates && blog.templates.length > 0 && (*/}
                {/*    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">*/}
                {/*        <span className="font-medium">Templates:</span>{" "}*/}
                {/*        <div className="flex flex-wrap gap-2 mt-1">*/}
                {/*            {blog.templates.map((templateId) => (*/}
                {/*                <a*/}
                {/*                    key={templateId}*/}
                {/*                    href={`/templates/${templateId}`}*/}
                {/*                    className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-gray-800 dark:text-gray-300 text-xs hover:bg-indigo-500 hover:text-white transition"*/}
                {/*                >*/}
                {/*                    {templateId}*/}
                {/*                </a>*/}
                {/*            ))}*/}
                {/*        </div>*/}
                {/*    </div>*/}
                {/*)}*/}
                {/* Blog Tags and Templates */}
                {(blog.tags || blog.templates?.length > 0) && (
                    <div className="flex justify-between items-center mb-6">
                        {/* Tags */}
                        {blog.tags && blog.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
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

                        {/* Templates */}
                        {blog.templates && blog.templates.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {blog.templates.map((templateId) => (
                                    <Link
                                        key={templateId}
                                        href={`/coding/${templateId}`}
                                        className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-gray-800 dark:text-gray-300 text-xs hover:bg-indigo-500 hover:text-white transition"
                                    >
                                        {templateId}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Blog Content */}
                <BlogContent blog={blog} />

                {/* Comments Section */}
                <div className="mt-8">
                    <h2 className="text-2xl font-semibold mb-4">Comments</h2>
                    <CommentForm parentId={blog.postId} addComment={addComment}/>
                    <div className={"h-1 py-2"}></div>

                    {loadingComments ? (
                        <p className="text-gray-500">Loading comments...</p>
                    ) : (
                        <CommentList
                            comments={comments}
                            onReply={(commentId) => console.log(`Replying to comment ${commentId}`)}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}