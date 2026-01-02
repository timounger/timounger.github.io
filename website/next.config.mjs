import { execSync } from "node:child_process";

// Build metadata, injected at build time and exposed to the client via `env`.
const buildTime = new Date().toISOString().slice(0, 16).replace("T", " ") + " UTC";
let gitCommit = "unknown";
try {
  gitCommit = execSync("git rev-parse --short HEAD").toString().trim();
} catch {
  gitCommit = (process.env.GITHUB_SHA ?? "unknown").slice(0, 7);
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  reactStrictMode: true,
  images: {
    unoptimized: true,
    qualities: [75, 95],
  },
  trailingSlash: true,
  experimental: {
    inlineCss: true,
  },
  env: {
    NEXT_PUBLIC_BUILD_TIME: buildTime,
    NEXT_PUBLIC_GIT_COMMIT: gitCommit,
  },
};

export default nextConfig;
