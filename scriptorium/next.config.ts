// next.config.ts

import type { NextConfig } from "next";
import MonacoWebpackPlugin from "monaco-editor-webpack-plugin";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.plugins.push(
        new MonacoWebpackPlugin({
          // Specify languages you want to support
          languages: ["javascript", "python", "cpp", "java"],
          // Optionally, disable features to reduce bundle size
          features: [
            "!gotoSymbol",
            "!gotoDefinition",
            "!hover",
            "!rename",
            // Add or remove features as needed
          ] as any[],
        })
      );

      // Optional: Handle worker files if necessary
      config.module.rules.push({
        test: /\.ttf$/,
        use: ["file-loader"],
      });
    }

    return config;
  },
};

export default nextConfig;