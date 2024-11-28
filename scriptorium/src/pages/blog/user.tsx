import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Pagination from "@/components/Pagination";
import BlogTable from "@/components/Table/BlogTable";
import { calcTotalPages, handlePageChange } from "@/utils/frontend-helper/paginationHelper";
import { PaginationState } from "@/types/PaginationType";
import { BlogPost } from "@/types/PostType";
import { getAllBlogsByUser, deleteBlog } from "@/services/PostService";
import DeleteBlogModal from "@/components/PostComponents/DeleteBlogModal";
import {tokenMiddleware} from "@/services/TokenMiddleware";

export default function BlogManagement() {
    const router = useRouter();
    const [data, setData] = useState<BlogPost[]>([]);
    const [pagination, setPagination] = useState<PaginationState>({
        skip: 0,
        take: 10,
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
                const response = await tokenMiddleware(getAllBlogsByUser, [{
                    skip: pagination.skip,
                    take: pagination.take,
                }]);

                if (response) {
                    const [blogs, paginate] = response;
                    setData(blogs); // Update the blog data
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

    const handleRowClick = (blog: BlogPost) => {
        router.push(`/blog/edit/${blog.postId}`); // Navigate to the edit blog page
    };

    const handleCreateNew = () => {
        router.push(`/blog/create`);
    };

    const handleDelete = async () => {
        if (deleteModal.blogId) {

            const success = await tokenMiddleware(deleteBlog, [{ id: deleteModal.blogId }]);
            if (success) {
                setData((prev) => prev.filter((blog) => blog.postId !== deleteModal.blogId));
                setDeleteModal({ isOpen: false, blogId: null });
            } else {
                console.error("Failed to delete blog.");
            }
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 w-full h-full flex-grow flex flex-col justify-between p-6">
            <div className="flex flex-col flex-grow">
                {/* Create Blog Button */}
                <div className="mb-4 flex justify-center">
                    <button
                        onClick={handleCreateNew}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:ring focus:ring-blue-300"
                    >
                        Create New Blog
                    </button>
                </div>

                {/* Blog Table */}
                <BlogTable
                    data={data}
                    onRowClick={handleRowClick}
                    onDelete={(blogId) => setDeleteModal({ isOpen: true, blogId })}
                />
            </div>

            {/* Pagination */}
            <Pagination pagination={pagination} onPageChange={handlePageChange(setPagination)} />

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