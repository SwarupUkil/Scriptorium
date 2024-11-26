import React, { useState } from "react";
import { useRouter } from "next/router";
import { searchBlogs } from "@/services/PostService";
import SearchBar from "@/components/SearchBar";
import Pagination from "@/components/Pagination";
import {handlePageChange} from "@/utils/frontend-helper/paginationHelper";
import {PaginationState} from "@/types/PaginationType";
import {BlogPost} from "@/types/PostType";

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

    const handleRowClick = (id: number) => {
        router.push(`/blog/${id}`); // Navigate to the dynamic blog page
    };

    return (
        <>
            <div  className="bg-white dark:bg-gray-900 w-full h-full flex-grow flex flex-col justify-between p-6" >
                <div className="flex flex-col flex-grow">
                    <SearchBar onApiCall={searchBlogs}
                               setData={setData}
                               pagination={pagination}
                               setPagination={setPagination}
                               isBlog={true}/>

                    <div className="flex-grow min-h-[400px] mt-4"> {/* Set a minimum height for the table's container */}
                        <table id="blog-table"
                               className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden table-fixed">
                            <thead className="bg-gray-200 dark:bg-gray-700">
                            <tr>
                                <th className="w-1/6 px-4 py-2 text-left text-gray-700 dark:text-gray-300 font-medium">
                                    Rating
                                </th>
                                <th className="w-2/6 px-4 py-2 text-left text-gray-700 dark:text-gray-300 font-medium">
                                    Title
                                </th>
                                <th className="w-3/6 px-4 py-2 text-left text-gray-700 dark:text-gray-300 font-medium">
                                    Tags
                                </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {data.map((blog) => (
                                <tr key={blog.postId} onClick={() => {handleRowClick(blog.postId)}} className="hover:bg-gray-100 dark:hover:bg-gray-900">
                                    <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{blog.rating}</td>
                                    <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{blog.title}</td>
                                    <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{blog.tags}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                </div>

                <Pagination pagination={pagination}
                            onPageChange={handlePageChange(setPagination)}/>

                <div className="h-1"></div>
            </div>
        </>
    );
}