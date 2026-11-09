import type { NextConfig } from 'next';

// Static export: the whole app is client-side and deploys to any static host
// (Firebase Hosting, Vercel, Netlify, GitHub Pages).
const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
