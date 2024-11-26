// components/Layout.tsx
import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type LayoutProps = {
    children: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Navbar */}
            <Navbar/>

            {/* Main Content */}
            <main className="flex flex-col flex-grow">{children}</main>

            {/* Footer */}
            <Footer />
            {/*<footer className="bg-gray-800 text-white h-16 flex items-center justify-center">*/}
            {/*    Footer Content Here*/}
            {/*</footer>*/}
        </div>
    );
};

export default Layout;