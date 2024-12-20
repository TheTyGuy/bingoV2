import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'react-native$': 'react-native-web', // Use react-native-web for React Native imports
    };
    config.resolve.extensions = ['.web.js', ...config.resolve.extensions];
    return config;
  },
};

export default nextConfig;
