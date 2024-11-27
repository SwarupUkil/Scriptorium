import React, {useEffect, useState} from "react";
import { useRouter } from "next/router";
import Pagination from "@/components/Pagination";
import BlogTable from "@/components/Table/BlogTable";
import {calcTotalPages, handlePageChange} from "@/utils/frontend-helper/paginationHelper";
import {PaginationState} from "@/types/PaginationType";
import {BlogPost} from "@/types/PostType";
import {getAllBlogsByUser} from "@/services/PostService";

export default function Blog() {
    const router = useRouter();
    const [data, setData] = useState<BlogPost[]>([]);

    // State for pagination
    const [pagination, setPagination] = useState<PaginationState>({
        skip: 0,
        take: 10,
        currentPage: 1,
        totalPages: 1,
    });

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await getAllBlogsByUser({
                    skip: pagination.skip,
                    take: pagination.take,
                });

                if (response) {
                    const [blogs, paginate] = response;
                    setData(blogs); // Update the blog data
                    setPagination((prev) => ({
                        ...prev,
                        totalPages: Math.max(calcTotalPages(paginate.take, paginate.total), 1), // Calculate total pages
                    }));
                }
            } catch (error) {
                console.error("Failed to fetch blogs:", error);
            }
        };

        fetchBlogs();
    }, [pagination.currentPage]);

    const handleRowClick = (blog: BlogPost) => {
        router.push(`/blog/${blog.postId}`); // Navigate to the dynamic blog page
    };

    return (
        <>
            <div  className="bg-white dark:bg-gray-900 w-full h-full flex-grow flex flex-col justify-between p-6" >
                <div className="flex flex-col flex-grow">
                    <BlogTable data={data} onRowClick={handleRowClick} />
                </div>

                <Pagination pagination={pagination}
                            onPageChange={handlePageChange(setPagination)}/>

                <div className="h-1"></div>
            </div>
        </>
    );
}