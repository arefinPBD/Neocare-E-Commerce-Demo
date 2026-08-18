import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // BUILD_SPEC §7 — bn is the default locale.
      { source: '/', destination: '/bn', permanent: false },
    ];
  },
};

export default nextConfig;
