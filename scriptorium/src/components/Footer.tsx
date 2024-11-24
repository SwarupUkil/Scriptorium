import React from "react";
import Link from "next/link";

const Footer: React.FC = () => {
    return (
        <footer className="bg-gray-800 text-white py-6">
            <div className="container mx-auto text-center">
                <p>&copy; 2024 Scriptorium. All rights reserved.</p>
                <p className="text-sm">
                    <Link href="/" className="hover:underline">
                        Privacy Policy
                    </Link>{" "}
                    |{" "}
                    <Link href="/" className="hover:underline">
                        Terms of Service
                    </Link>
                </p>
            </div>
        </footer>
    );
};

export default Footer;