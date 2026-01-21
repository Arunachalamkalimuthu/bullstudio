/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  transpilePackages: ["@bullstudio/ui", "@bullstudio/trpc", "@bullstudio/email", "@bullstudio/auth" ],
}

export default nextConfig
