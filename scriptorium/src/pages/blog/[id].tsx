import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getBlog } from "@/services/PostService";
import { Blog } from "@/types/PostType";
import { parseCSVToTags } from "@/utils/frontend-helper/apiHelper";

// GPT pilled.
export default function BlogPost() {
    const router = useRouter();
    const { id } = router.query; // Extract the dynamic [id] from the route
    const [blog, setBlog] = useState<Blog | null>(null);
    const [loading, setLoading] = useState(true);
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
                }
            } catch (err) {
                setError("Failed to fetch blog data");
            } finally {
                setLoading(false);
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
                <div className="prose dark:prose-invert max-w-full">
                    {blog.content}
                </div>
            </div>
        </div>
    );
}