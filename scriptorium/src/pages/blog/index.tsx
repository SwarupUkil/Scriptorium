import React, { useState } from "react";
import { useRouter } from "next/router";
import { searchBlogs } from "@/services/PostService";
import SearchBar from "@/components/SearchBar";
import Pagination from "@/components/Pagination";
import BlogTable from "@/components/Table/BlogTable";
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

    const handleRowClick = (blog: BlogPost) => {
        router.push(`/blog/${blog.postId}`); // Navigate to the dynamic blog page
    };

    return (
        <>
            <div  className="min-h-screen bg-white dark:bg-gray-900 w-full h-full flex-grow flex flex-col justify-around p-6" >
                <div className="flex flex-col ">
                    <SearchBar onApiCall={searchBlogs}
                               setData={setData}
                               pagination={pagination}
                               setPagination={setPagination}
                               isBlog={true}/>

                    <BlogTable data={data} onRowClick={handleRowClick} />
                </div>

                <Pagination pagination={pagination}
                            onPageChange={handlePageChange(setPagination)}/>

                <div className="h-1"></div>
            </div>
        </>
    );
}