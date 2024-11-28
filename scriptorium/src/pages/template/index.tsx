import React, { useState } from "react";
import { searchTemplates } from "@/services/TemplateService";
import SearchBar from "@/components/SearchBar";
import Pagination from "@/components/Pagination";
import {handlePageChange} from "@/utils/frontend-helper/paginationHelper";
import {PaginationState} from "@/types/PaginationType";
import {Template} from "@/types/TemplateType";
import TemplateTable from "@/components/Table/TemplateTable";

export default function Templates() {
    const [data, setData] = useState<Template[]>([]);

    // State for pagination
    const [pagination, setPagination] = useState<PaginationState>({
        skip: 0,
        take: 10,
        currentPage: 1,
        totalPages: 1,
    });

    // const fetchByParam = searchBlogs({skip, take, blogTitle, desiredContent, blogTags, templateTitle});
    return (
        <>
            <div  className="min-h-screen bg-white dark:bg-gray-900 w-full h-full flex-grow flex flex-col justify-around p-6" >
                <div className="flex flex-col ">
                    <SearchBar onApiCall={searchTemplates}
                               setData={setData}
                               pagination={pagination}
                               setPagination={setPagination}
                               isBlog={true}/>

                    <TemplateTable data={data} onRowClick={() => {}} />
                </div>

                <Pagination pagination={pagination}
                            onPageChange={handlePageChange(setPagination)}/>

                <div className="h-1"></div>
            </div>
        </>
    );
}