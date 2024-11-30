import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from 'next/router';
import { UserRole, UserProfileUrls } from "@/types/UserTypes";
import { accountVerification } from "@/services/UserService";
import toast from "react-hot-toast";

interface AuthContextProps {
  isLoggedIn: boolean;
  role: UserRole | null;
  profileURL: UserProfileUrls | null;
  setProfileURL: (image: UserProfileUrls) => void;
  login: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

let globalLogout: () => void = () => {
  console.error("Logout function not initialized.");
};

export const getGlobalLogout = () => globalLogout;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [role, setRole] = useState<UserRole | null>(null);
  const [profileURL, setProfileURL] = useState<UserProfileUrls | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const storedRole = localStorage.getItem("userRole") as UserRole | null;

    setIsLoggedIn(!!token);
    setRole(storedRole);
  }, []);

  useEffect(() => {
    if (profileURL) {
      localStorage.setItem("profileURL", profileURL);
    }
  }, [profileURL]);

  useEffect(() => {
    const url = localStorage.getItem("profileURL");
    if (url) {
      setProfileURL(url as UserProfileUrls);
    }
    else {
      setProfileURL("Option1.png");
    }
  }, []);

  useEffect(() => {
    const fetchAuthStatus = async () => {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (accessToken && refreshToken) {
        const userVerify = await accountVerification(accessToken, refreshToken, logout);
        if (userVerify) {
          localStorage.setItem("accessToken", userVerify.accessToken);
          localStorage.setItem("refreshToken", userVerify.refreshToken);
          login(userVerify.accountType);
        }
        else {
          logout();
        }
      }
    };

    fetchAuthStatus();
  }, [router]);

  const login = (userRole: UserRole) => {
    setIsLoggedIn(true);
    setRole(userRole);
    localStorage.setItem("userRole", userRole);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("username");
    localStorage.removeItem("userRole");
    localStorage.removeItem("profileURL");
    localStorage.removeItem('theme');

    setIsLoggedIn(false);
    setRole(null);
    toast.dismiss(); // Dismiss all previous toasts
    toast.error("Login required.");
    router.push('/auth');
  };

  globalLogout = logout;

  return (
    <AuthContext.Provider value={{ isLoggedIn, role, profileURL, setProfileURL, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
