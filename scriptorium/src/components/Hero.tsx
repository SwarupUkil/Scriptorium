import React from "react";
import Link from "next/link";

const Hero: React.FC = () => {
    return (
        <section className="flex flex-grow items-center justify-center bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
            <div className="container mx-auto text-center px-4">
                <h1 className="text-4xl font-bold mb-6">
                    Welcome to <span className="text-blue-500 dark:text-blue-400">Scriptorium</span>
                </h1>
                <p className="text-lg mb-8">
                    Discover, write, and share code effortlessly. Your one-stop solution for collaborative coding.
                </p>
                <div className="flex justify-center space-x-4">
                    <Link
                        href="/template"
                        className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                    >
                        Explore Templates
                    </Link>
                    <Link
                        href="/coding"
                        className="bg-gray-300 text-gray-900 px-6 py-3 rounded hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                        Start Coding
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default Hero;