import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {AUTH} from "@/utils/validateConstants";

type AdminAuthWrapperProps = {
    children: React.ReactNode; // The content to render if authorized
};

const AdminAuthWrapper: React.FC<AdminAuthWrapperProps> = ({ children }) => {
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Fetch user type from local storage
        const userType = localStorage.getItem("userRole");

        // Check if user is an admin
        if (userType === AUTH.ADMIN) {
            setIsAuthorized(true);
        } else {
            setIsAuthorized(false);
        }
    }, []);

    if (isAuthorized === null) {
        // Show a loading state while checking
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                <p className="text-lg font-medium">Checking Authorization...</p>
            </div>
        );
    }

    if (!isAuthorized) {
        // Unauthorized message
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
                    <h1 className="text-2xl font-semibold text-red-500">Unauthorized</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        You do not have the necessary permissions to access this page.
                    </p>
                    <button
                        onClick={() => router.push("/")} // Redirect to home or login
                        className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }

    // Render children if authorized
    return <>{children}</>;
};

export default AdminAuthWrapper;