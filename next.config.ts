import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Spoonacular recipe images
        protocol: "https",
        hostname: "img.spoonacular.com",
      },
      {
        // Spoonacular also serves images from spoonacular.com directly
        protocol: "https",
        hostname: "spoonacular.com",
      },
    ],
  },
};

export default nextConfig;
