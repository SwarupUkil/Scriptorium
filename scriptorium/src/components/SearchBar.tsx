import React, { useState, useEffect } from 'react';
import Input from './Input';
import TagInput from './TagInput';
import {SearchBarProps, SearchParams} from "@/types/SearchType";
import {calcTotalPages} from "@/utils/frontend-helper/paginationHelper";
import {parseTagsToCSV} from "@/utils/frontend-helper/apiHelper";

const SearchBar: React.FC<SearchBarProps> = ({
     onApiCall,
     setData,
     pagination,
     setPagination,
     additionalFields,
     isBlog,}) => {

    const [title, setTitle] = useState<string>("");
    const [content, setContent] = useState<string>("");
    const [tags, setTags] = useState<string[]>([]);
    const [additionalParams, setAdditionalParams] = useState<Record<string, any>>({});
    const [templateTitle, setTemplateTitle] = useState<string>("");

    // const handleAdditionalFieldChange = (key: string, value: any) => {
    //     setAdditionalParams((prev) => ({ ...prev, [key]: value }));
    // };

    const handleTagsChange = (newTags: string[]) => {
        setTags(newTags);
    };

    const handleSearch = async () => {
        const params: SearchParams = {
            skip: pagination.skip,
            take: pagination.take,
            title: title || undefined,
            content: content || undefined,
            tags: tags ? parseTagsToCSV(tags): undefined,
            ...additionalParams,
            templates: isBlog ? templateTitle : undefined,
        };

        try {
            const [results, paginate] = await onApiCall(params);
            return [results, paginate];
        } catch (error) {
            console.error("Search failed:", error);
        }
    };

    // Debounced dynamic search
    useEffect(() => {
        const delay = 300; // Delay in milliseconds
        const handler = setTimeout(() => {
            handleSearch().then(([results, paginate]) => {
                setPagination({
                    skip: 0,
                    take: paginate.take,
                    currentPage: 1,
                    totalPages: Math.max(calcTotalPages(paginate.take, paginate.total), 1),
                });
                setData(results);
            });
        }, delay);

        // Clear the timeout if dependencies change
        return () => clearTimeout(handler);
    }, [title, content, tags, additionalParams, templateTitle]); // Dependencies for dynamic searching

    useEffect(() => {
        handleSearch().then(([results, paginate]) => {
            setPagination({
                ...pagination,
                skip: paginate.nextSkip,
                take: paginate.take,
            });
            setData(results);
        });
    }, [pagination.currentPage]);

    return (
        <div className="bg-white dark:bg-gray-900 p-4 rounded-md flex gap-4">
            <Input
                id="search-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Search by title"
                label="Title"
                className="w-full md:w-1/2"
            />
            <Input
                id="search-content"
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Search by content"
                label="Content"
                className="w-full md:w-1/2"
            />
            {/*<Input*/}
            {/*    id="search-tags"*/}
            {/*    type="text"*/}
            {/*    value={tags}*/}
            {/*    onChange={(e) => setTags(e.target.value)}*/}
            {/*    placeholder="Search by tags (comma-separated)"*/}
            {/*    label="Tags"*/}
            {/*    className="w-full md:w-1/2"*/}
            {/*/>*/}
            {/*{additionalFields &&*/}
            {/*    React.cloneElement(additionalFields as React.ReactElement, {*/}
            {/*        onFieldChange: handleAdditionalFieldChange,*/}
            {/*    })*/}
            {/*}*/}
            {/*<TagInput*/}
            {/*    onChange={handleTagsChange}*/}
            {/*    containerClassName="w-full md:w-1/2 rounded-md border px-3 py-2 shadow-sm"*/}
            {/*    tagClassName="bg-indigo-500 text-white"*/}
            {/*    inputClassName="text-gray-700 dark:text-gray-200"*/}
            {/*/>*/}
            <TagInput
                onChange={handleTagsChange}
                label="Tags"
                containerClassName="w-full md:w-1/2"
                tagClassName="bg-blue-500 text-white"
                inputClassName="text-gray-700 dark:text-gray-200"
            />
            {isBlog &&
                <Input
                    id="search-templateTitles"
                    type="text"
                    value={templateTitle}
                    onChange={(e) => setTemplateTitle(e.target.value)}
                    placeholder="Search by template title"
                    label="Template Title"
                    className="w-full md:w-1/2"
                />
            }
        </div>
    );
};

export default SearchBar;