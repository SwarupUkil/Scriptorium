import React, { useState, useEffect } from "react";
import Input from "./Input";
import TagInput from "./TagInput";
import TemplateSelect from "@/components/Code/TemplateSelect";
import { SearchBarProps, SearchParams } from "@/types/SearchType";
import { calcTotalPages } from "@/utils/frontend-helper/paginationHelper";
import { parseTagsToCSV } from "@/utils/frontend-helper/apiHelper";
import { ORDER } from "@/utils/validateConstants";
import {MultiValue, SingleValue} from "react-select";

interface TemplateOption {
    value: number;
    label: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
    onApiCall,
    setData,
    pagination,
    setPagination,
    isBlog,
}) => {
    const [title, setTitle] = useState<string>("");
    const [content, setContent] = useState<string>("");
    const [tags, setTags] = useState<string[]>([]);
    const [templateTitle, setTemplateTitle] = useState<string>("");
    const [sortOrder, setSortOrder] = useState<string>(ORDER.DESC); // Default to 'most rated'
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateOption | null>(null);

    const handleTagsChange = (newTags: string[]) => {
        setTags(newTags);
    };

    const handleSearch = async () => {
        const params: SearchParams = {
            skip: pagination.skip,
            take: pagination.take,
            title: title || undefined,
            content: content || undefined,
            tags: tags ? parseTagsToCSV(tags) : undefined,
            templates: isBlog ? templateTitle : undefined,
            orderBy: sortOrder, // Add sortOrder to the parameters
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
        const handler = setTimeout(async () => {
            const resp = await handleSearch();
            if (resp) {
                const [results, paginate] = resp;
                setPagination({
                    skip: 0,
                    take: paginate.take,
                    currentPage: 1,
                    totalPages: Math.max(calcTotalPages(paginate.take, paginate.total), 1),
                });
                setData(results);
            }
        }, delay);

        return () => clearTimeout(handler);
    }, [title, content, tags, templateTitle, sortOrder]); // Dependencies for dynamic searching

    useEffect(() => {
        const func = async () => {
            const resp = await handleSearch();
            if (resp) {
                const [results, paginate] = resp;
                setPagination({
                    ...pagination,
                    skip: paginate.nextSkip,
                    take: paginate.take,
                });
                setData(results);
            }
        }
        func();
    }, [pagination.currentPage]);

    // 1) Single-select: We'll receive a SingleValue<TemplateOption> or null from TemplateSelect.
    // 2) We'll set 'selectedTemplate' state for the UI.
    // 3) We'll set 'templateTitle' so your backend sees the updated string in handleSearch().
    const handleTemplateChange = (
        newValue: SingleValue<TemplateOption> | MultiValue<TemplateOption>
    ) => {
        if (newValue as SingleValue<TemplateOption> && newValue !== null) {
            setSelectedTemplate(newValue as SingleValue<TemplateOption>);
            // We set 'templateTitle' to the label, or you could store something else if the backend expects partial titles
            if ("label" in newValue) {
                // Extract the title part from the label
                const actualTitle = newValue.label.replace(/^Id-\d+: /, ""); // Remove "Id-<id number>: "
                setTemplateTitle(actualTitle);
            }
        } else {
            setSelectedTemplate(null);
            setTemplateTitle("");
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 p-4 rounded-md shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Title Input */}
                <Input
                    id="search-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Search by title"
                    label="Title"
                    className="w-full"
                />

                {/* Content Input */}
                <Input
                    id="search-content"
                    type="text"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Search by content"
                    label="Content"
                    className="w-full"
                />

                {/* Tag Input */}
                <TagInput
                    onChange={handleTagsChange}
                    label="Tags"
                    containerClassName="w-full"
                    tagClassName="bg-blue-500 text-white"
                    inputClassName="text-gray-700 dark:text-gray-200"
                />

                {/*/!* Template Title Input *!/*/}
                {/*{isBlog && (*/}
                {/*    <Input*/}
                {/*        id="search-templateTitles"*/}
                {/*        type="text"*/}
                {/*        value={templateTitle}*/}
                {/*        onChange={(e) => setTemplateTitle(e.target.value)}*/}
                {/*        placeholder="Search by template title"*/}
                {/*        label="Template Title"*/}
                {/*        className="w-full"*/}
                {/*    />*/}
                {/*)}*/}

                {/*
                  1) Remove the old Input for templateTitle
                  2) Add TemplateSelect for single-select
                */}
                {isBlog && (
                    <TemplateSelect
                        label="Template Title"
                        placeholder="Type to search by template title..."
                        isMulti={false}
                        value={selectedTemplate}
                        onChange={handleTemplateChange}
                        className="w-full"
                    />
                )}

                {/* Sort Dropdown */}
                {isBlog &&
                    <div className="flex flex-col">
                        <label
                            htmlFor="sort-order"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Sort By
                        </label>
                        <select
                            id="sort-order"
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="mt-1 w-full p-2 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 "
                        >
                            <option value={ORDER.DESC}>Most Rated</option>
                            <option value={ORDER.ASC}>Least Rated</option>
                            <option value={ORDER.CONTROVERSIAL}>Controversial</option>
                        </select>
                    </div>
                }
            </div>
        </div>
    );
};

export default SearchBar;