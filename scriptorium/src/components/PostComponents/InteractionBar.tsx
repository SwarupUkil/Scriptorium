import React, {useEffect, useState} from "react";
import {updateVote, getVote} from "@/services/PostService";

type InteractionBarProps = {
    parentId: number;
    initialRating: number;
};

const InteractionBar: React.FC<InteractionBarProps> = ({parentId, initialRating,}) => {

    const [rating, setRating] = useState(initialRating);
    const [userVote, setUserVote] = useState<"like" | "dislike" | null>(null);
    const [initialUserVote, setInitialUserVote] = useState(false);

    useEffect(() => {

        if (initialUserVote) {
            return;
        }

        const fetchInitialVote = async () => {
            try {
                const initialVote = await getVote(parentId);
                if (initialVote == 1) {
                    setUserVote("like");
                } else if (initialVote == 0) {
                    setUserVote(null);
                } else {
                    setUserVote("dislike");
                }
                setInitialUserVote(true);
            } catch (error) {
                console.error("Failed to fetch initial user vote:", error);
            }
        };

        fetchInitialVote();
    }, [initialUserVote, parentId]);

    const handleLike = async () => {
        let vote: number;
        if (userVote === "like") {
            setRating((prev) => prev - 1);
            setUserVote(null);
            vote = 0;
        } else {
            setRating((prev) => (userVote === "dislike" ? prev + 2 : prev + 1));
            setUserVote("like");
            vote = 1;
        }
        const success: boolean = await updateVote(parentId, vote);

        if (success) {
            console.log("Vote updated successfully!");
        } else {
            console.log("Failed to update vote.");
        }
    };

    const handleDislike = async () => {
        let vote: number;
        if (userVote === "dislike") {
            setRating((prev) => prev + 1);
            setUserVote(null);
            vote = 0;
        } else {
            setRating((prev) => (userVote === "like" ? prev - 2 : prev - 1));
            setUserVote("dislike");
            vote = -1;
        }

        const success: boolean = await updateVote(parentId, vote);

        if (success) {
            console.log("Vote updated successfully!");
        } else {
            console.log("Failed to update vote.");
        }
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