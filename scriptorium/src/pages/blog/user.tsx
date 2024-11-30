import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Pagination from "@/components/Pagination";
import Card from "@/components/Card/Card";
import TagDisplay from "@/components/TagDisplay";
import { calcTotalPages, handlePageChange } from "@/utils/frontend-helper/paginationHelper";
import { PaginationState } from "@/types/PaginationType";
import { BlogPost } from "@/types/PostType";
import { getAllBlogsByUser, deleteBlog } from "@/services/PostService";
import DeleteBlogModal from "@/components/PostComponents/DeleteBlogModal";
import { tokenMiddleware } from "@/services/TokenMiddleware";
import toast from "react-hot-toast";

export default function BlogManagement() {
    const router = useRouter();
    const [data, setData] = useState<BlogPost[]>([]);
    const [pagination, setPagination] = useState<PaginationState>({
        skip: 0,
        take: 9, // Adjusted for grid layout
        currentPage: 1,
        totalPages: 1,
    });

    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; blogId: number | null }>({
        isOpen: false,
        blogId: null,
    });

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await tokenMiddleware(getAllBlogsByUser, [
                    { skip: pagination.skip, take: pagination.take },
                ]);

                if (response) {
                    const [blogs, paginate] = response;
                    setData(blogs);
                    setPagination((prev) => ({
                        ...prev,
                        totalPages: Math.max(calcTotalPages(paginate.take, paginate.total), 1),
                    }));
                }
            } catch (error) {
                console.error("Failed to fetch blogs:", error);
            }
        };

        fetchBlogs();
    }, [pagination.currentPage]);

    const handleCreateNew = () => {
        router.push(`/blog/create`);
    };

    const handleCardClick = (blogId: number) => {
        router.push(`/blog/edit/${blogId}`);
    };

    const handleDelete = async () => {
        if (deleteModal.blogId) {
            const success = await tokenMiddleware(deleteBlog, [{ id: deleteModal.blogId }]);
            if (success) {
                toast.success("Deleted!");
                setData((prev) => prev.filter((blog) => blog.postId !== deleteModal.blogId));
                setDeleteModal({ isOpen: false, blogId: null });
            } else {
                toast.error("Failed to delete blog.!");
                console.error("Failed to delete blog.");
            }
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 w-full h-full flex-grow flex flex-col justify-between p-6">
            {/* Create Blog Button */}
            <div className="mb-4 flex justify-center">
                <button
                    onClick={handleCreateNew}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:ring focus:ring-blue-300"
                >
                    Create New Blog
                </button>
            </div>

            {/* Blogs List as Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.map((blog) => (
                    <Card
                        key={blog.postId}
                        title={blog.title || "Untitled Blog"}
                        content={
                            <div>
                                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                                    {blog.content?.slice(0, 100) || "No content available."}
                                </p>
                                <TagDisplay value={blog.tags || ""} />
                            </div>
                        }
                        actions={
                            <div className="flex items-center w-full">
                                <button
                                    onClick={() => handleCardClick(blog.postId)}
                                    className="w-3/4 px-4 py-2 bg-indigo-500 text-white rounded-l-md hover:bg-indigo-600 mr-1"
                                >
                                    Edit Blog
                                </button>
                                <button
                                    onClick={() => setDeleteModal({ isOpen: true, blogId: blog.postId })}
                                    className="w-1/4 px-4 py-2 bg-red-500 text-white rounded-r-md hover:bg-red-600"
                                >
                                    Delete
                                </button>
                            </div>
                        }
                    />
                ))}
            </div>

            {/* Pagination */}
            <Pagination
                pagination={pagination}
                onPageChange={handlePageChange(setPagination)}
            />

            {/* Delete Confirmation Modal */}
            {deleteModal.isOpen && (
                <DeleteBlogModal
                    blogId={deleteModal.blogId}
                    isOpen={deleteModal.isOpen}
                    onClose={() => setDeleteModal({ isOpen: false, blogId: null })}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
}