// Shared parameters
import React from "react";
import {PaginationState} from "@/types/PaginationType";
import {BlogPost} from "@/types/PostType";
import {Template} from "@/types/TemplateType";

export type SearchParams = {
    skip?: number;
    take?: number;
    title?: string;
    content?: string;
    tags?: string;
    [key: string]: any; // Allow additional parameters for customization
};

export type SearchBarProps = {
    onApiCall: (params: SearchParams) => Promise<any>,
    setData: ((state: BlogPost[]) => void) | ((state: Template[]) => void),
    pagination: PaginationState,
    setPagination: (state: PaginationState) => void,
    additionalFields?: React.ReactNode,
    isBlog?: boolean
};

export type SearchBlogsParams = SearchParams & {
    templateTitle?: string;
};

export type SearchTemplatesParams = SearchParams;