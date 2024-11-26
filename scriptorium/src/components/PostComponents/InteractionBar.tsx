import React, { useState } from "react";

type InteractionBarProps = {
    parentId: number;
    initialRating: number;
    // onLike: (parentId: number) => void;
    // onDislike: (parentId: number) => void;
    // onReply: (parentId: number) => void;
};

const InteractionBar: React.FC<InteractionBarProps> = ({
                                                           parentId,
                                                           initialRating,
                                                           // onLike,
                                                           // onDislike,
                                                           // onReply,
                                                       }) => {
    const [rating, setRating] = useState(initialRating);
    const [userVote, setUserVote] = useState<"like" | "dislike" | null>(null);

    const handleLike = () => {
        if (userVote === "like") {
            setRating((prev) => prev - 1);
            setUserVote(null);
        } else {
            setRating((prev) => (userVote === "dislike" ? prev + 2 : prev + 1));
            setUserVote("like");
        }
        // onLike(parentId);
    };

    const handleDislike = () => {
        if (userVote === "dislike") {
            setRating((prev) => prev + 1);
            setUserVote(null);
        } else {
            setRating((prev) => (userVote === "like" ? prev - 2 : prev - 1));
            setUserVote("dislike");
        }
        // onDislike(parentId);
    };

    const handleReply = () => {
        // onReply(parentId);
    };

    return (
        <div className="flex items-center space-x-4 h-4">
            {/* Like Button */}
            <button
                onClick={handleLike}
                aria-label="Like"
                className={`px-1 py-1 rounded focus:outline-none ${
                    userVote === "like" ? "text-green-600" : "text-gray-500"
                } hover:text-green-600`}
            >
                ▲
            </button>

            {/* Rating */}
            <span className="text-gray-700 dark:text-gray-300 px-0.5">{rating}</span>

            {/* Dislike Button */}
            <button
                onClick={handleDislike}
                aria-label="Dislike"
                className={`px-1 py-1 rounded focus:outline-none ${
                    userVote === "dislike" ? "text-red-600" : "text-gray-500"
                } hover:text-red-600`}
            >
                ▼
            </button>

            {/*/!* Reply Button *!/*/}
            {/*<button*/}
            {/*    onClick={handleReply}*/}
            {/*    aria-label="Reply"*/}
            {/*    className="px-2 py-1 rounded focus:outline-none dark:text-white hover:text-gray-600"*/}
            {/*>*/}
            {/*    💬 Reply*/}
            {/*</button>*/}
        </div>
    );
};

export default InteractionBar;