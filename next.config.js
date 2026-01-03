import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/manuals/oxi-one-mk2',
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  // Silence workspace root warning when running from worktrees
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
