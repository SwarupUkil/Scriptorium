import React from "react";
import Link from "next/link";

const Hero: React.FC = () => {
    return (
        <section className="bg-gray-100 text-gray-900 py-16">
            <div className="container mx-auto text-center">
                <h1 className="text-4xl font-bold mb-6">
                    Welcome to <span className="text-blue-500">Scriptorium</span>
                </h1>
                <p className="text-lg mb-8">
                    Discover, write, and share code effortlessly. Your one-stop solution for collaborative coding.
                </p>
                <div className="flex justify-center space-x-4">
                    <Link
                        href="/template"
                        className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600"
                    >
                        Explore Templates
                    </Link>
                    <Link
                        href="/execute"
                        className="bg-gray-300 text-gray-900 px-6 py-3 rounded hover:bg-gray-400"
                    >
                        Start Coding
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default Hero;