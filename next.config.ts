import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Overrides BUILD_SPEC §7 ("bn is the default") per client request 2026-08-18.
      { source: '/', destination: '/en', permanent: false },
    ];
  },
};

export default nextConfig;
