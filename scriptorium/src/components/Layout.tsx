// components/Layout.tsx
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/contexts/ThemeContext";

type LayoutProps = {
    children: React.ReactNode;
};

const LayoutContent: React.FC<LayoutProps> = ({ children }) => {
    // const { theme, toggleTheme } = useTheme();
    return (
        <>
            {/* Navbar */}
            <Navbar/>

            {/* Main Content */}
            <main className="flex flex-col flex-grow">{children}</main>
            {/* <button
              onClick={toggleTheme}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Toggle {theme === 'light' ? 'Light' : 'Dark'} Mode
            </button> */}
            {/* Footer */}
            <Footer />
            {/*<footer className="bg-gray-800 text-white h-16 flex items-center justify-center">*/}
            {/*    Footer Content Here*/}
            {/*</footer>*/}
        </>
    );
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <ThemeProvider>
          <LayoutContent>{children}</LayoutContent>
        </ThemeProvider>
    );
};

export default Layout;