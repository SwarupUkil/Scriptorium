import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from 'next/router';
import { UserRole } from "@/types/UserTypes";
import { accountVerification } from "@/services/UserService";

interface AuthContextProps {
  isLoggedIn: boolean;
  role: UserRole | null;
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
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const storedRole = localStorage.getItem("userRole") as UserRole | null;

    setIsLoggedIn(!!token);
    setRole(storedRole);
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

    localStorage.setItem("theme", "LIGHT");
    setIsLoggedIn(false);
    setRole(null);
    router.push('/');
  };

  globalLogout = logout;

  return (
    <AuthContext.Provider value={{ isLoggedIn, role, login, logout }}>
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
