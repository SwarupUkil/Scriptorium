import React, { useState } from "react";
import { useRouter } from "next/router";
import Pagination from "@/components/Pagination";
import Card from "@/components/Card/Card";
import SearchBar from "@/components/SearchBar";
import TagDisplay from "@/components/TagDisplay";
import { searchBlogs } from "@/services/PostService";
import { handlePageChange } from "@/utils/frontend-helper/paginationHelper";
import { PaginationState } from "@/types/PaginationType";
import { BlogPost } from "@/types/PostType";

export default function Blog() {
    const router = useRouter();
    const [data, setData] = useState<BlogPost[]>([]);

    // State for pagination
    const [pagination, setPagination] = useState<PaginationState>({
        skip: 0,
        take: 9, // Adjusted to display a grid with cards
        currentPage: 1,
        totalPages: 1,
    });

    const handleCardClick = async (postId?: number) => {
        try {
            if (postId) {
                await router.push(`/blog/${postId}`);
            }
        } catch (error) {
            console.error("Routing failed:", error);

            // Redirect to a default route on failure
            await router.push("/blog");
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 w-full h-full flex-grow flex flex-col justify-around p-6">
            {/* Search Bar */}
            <div className="flex flex-col">
                <SearchBar
                    onApiCall={searchBlogs}
                    setData={setData}
                    pagination={pagination}
                    setPagination={setPagination}
                    isBlog={true}
                />
            </div>

            {/* Blog List as Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {data.map((blog) => (
                    <Card
                        key={blog.postId}
                        title={blog.title || ""}
                        content={
                            <div>
                                {/*<p className="text-sm text-gray-700 dark:text-gray-300 mb-2">*/}
                                {/*    {blog.content?.slice(0, 100) || "No content available."}*/}
                                {/*</p>*/}
                                <TagDisplay value={blog.tags || ""} />
                            </div>
                        }
                        actions={
                            <button
                                onClick={() => handleCardClick(blog.postId)}
                                className="w-full px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
                            >
                                View Blog
                            </button>
                        }
                    />
                ))}
            </div>

            {/* Pagination */}
            <Pagination
                pagination={pagination}
                onPageChange={handlePageChange(setPagination)}
            />
        </div>
    );
}