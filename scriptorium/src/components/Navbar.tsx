import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

const Navbar: React.FC = () => {
  const { isLoggedIn, role, profileURL, logout } = useAuth();
  const { theme, setTheme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  const profileImage = `/${profileURL}`;

  const logoutFunction = () => {
    logout();
    localStorage.setItem("theme", "LIGHT");
    setTheme("LIGHT");
  }

  return (
    <nav className="w-full bg-gray-800 text-white px-4 py-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <h1 className="text-2xl font-bold">
          <Link href="/">Scriptorium</Link>
        </h1>

        {/* Links */}
        <ul className="hidden md:flex space-x-4">
          <li>
            <Link href="/coding" className="hover:underline">
              Coding
            </Link>
          </li>
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
          {isLoggedIn ? (
            <li className="relative">
              {/* Theme Toggle Button */}
              <div
                onClick={toggleTheme}
                className="relative w-12 h-6 bg-gray-600 rounded-full cursor-pointer flex items-center p-1 transition-colors duration-300"
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                    theme === "DARK" ? "translate-x-6" : "translate-x-0"
                  }`}
                ></div>
                <span
                  className={`absolute left-1 text-xs text-gray-200 transition-opacity duration-300 ${
                    theme === "DARK" ? "opacity-0" : "opacity-100"
                  }`}
                >
                  ☀️
                </span>
                <span
                  className={`absolute right-1 text-xs text-gray-200 transition-opacity duration-300 ${
                    theme === "DARK" ? "opacity-100" : "opacity-0"
                  }`}
                >
                  🌙
                </span>
              </div>
              {/* Profile Image */}
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="focus:outline-none"
              >
                <Image
                  src={profileImage}
                  alt="Profile"
                  className="w-8 h-8 rounded-full border-2 border-white object-cover"
                  width={32}
                  height={32}
                />
              </button>
              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg z-10">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Edit My Profile
                  </Link>
                  <Link
                    href="/template/user"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    My Templates
                  </Link>
                  <Link
                    href="/blog/user"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    My Blogs
                  </Link>
                  {role === "ADMIN" && (
                    <Link
                      href="/admin/"
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={logoutFunction}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </li>
          ) : (
            <li>
              <Link href="/auth" className="hover:underline">
                Login/Signup
              </Link>
            </li>
          )}
        </ul>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <button
            className="text-white focus:outline-none"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            ☰
          </button>
          {dropdownOpen && (
            <ul className="absolute top-16 left-0 w-full bg-gray-800 text-white space-y-2 p-4 shadow-lg z-10">
              <li>
                <Link href="/template" className="block hover:underline">
                  Templates
                </Link>
              </li>
              <li>
                <Link href="/blog" className="block hover:underline">
                  Blogs
                </Link>
              </li>
              {isLoggedIn ? (
                <>
                  <li>
                    <Link href="/profile" className="block hover:underline">
                      Edit My Profile
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/template/user"
                      className="block hover:underline"
                    >
                      My Templates
                    </Link>
                  </li>
                  <li>
                    <Link href="/blog/user" className="block hover:underline">
                      My Blogs
                    </Link>
                  </li>
                  {role === "ADMIN" && (
                    <li>
                      <Link
                        href="/admin"
                        className="block hover:underline"
                      >
                        Admin Dashboard
                      </Link>
                    </li>
                  )}
                  <li>
                    <button
                      onClick={logoutFunction}
                      className="block w-full text-left hover:underline"
                    >
                      Sign Out
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <Link href="/auth" className="block hover:underline">
                    Login/Signup
                  </Link>
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;