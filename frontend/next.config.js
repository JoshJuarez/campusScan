/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow data URIs for event flyer uploads
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [],
  },
};

module.exports = nextConfig;
