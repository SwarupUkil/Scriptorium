import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Layout from "@/components/Layout";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "react-hot-toast";

export default function App({ Component, pageProps }: AppProps) {
    return (
        <AuthProvider>
            <Layout>
                {/* Toaster Component */}
                <Toaster position="top-center" reverseOrder={false} />
                <Component {...pageProps} />
            </Layout>
        </AuthProvider>
    );
}