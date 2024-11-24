import React from "react";
import Link from "next/link";

const Navbar: React.FC = () => {
    return (
        <nav className="bg-gray-800 text-white py-4">
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-2xl font-bold">
                    <Link href="/">Scriptorium</Link>
                </h1>
                <ul className="flex space-x-4">
                    <li>
                        <Link href="/template" className="hover:underline">
                            Templates
                        </Link>
                    </li>
                    <li>
                        <Link href="/blog" className="hover:underline">
                            Blogs
                        </Link>
                    </li>
                    <li>
                        <Link href="/user" className="hover:underline">
                            Profile
                        </Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;