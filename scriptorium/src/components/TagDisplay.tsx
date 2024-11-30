import React from "react";
import { parseCSVToTags } from "@/utils/frontend-helper/apiHelper";

interface TagDisplayProps {
    value: string; // CSV-formatted string of tags
}

const TagDisplay: React.FC<TagDisplayProps> = ({ value }) => {
    const tags = parseCSVToTags(value); // Parse CSV string into array of tags

    return (
        <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
                <span
                    key={index}
                    className="px-3 py-1 bg-indigo-500 text-white text-sm rounded-full"
                >
                    {tag}
                </span>
            ))}
        </div>
    );
};

export default TagDisplay;