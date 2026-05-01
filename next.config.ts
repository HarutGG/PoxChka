import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /**
   * Turbopack has a known bug with non-ASCII (e.g. Cyrillic) characters in
   * file paths. Setting turbopack.root to the project directory explicitly
   * works around the issue.
   */
  turbopack: {
    root: path.resolve(__dirname),
  },
  
  // Optimize for production
  reactStrictMode: true,
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
};

export default nextConfig;
