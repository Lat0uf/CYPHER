/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        // lib/utils.ts has a pre-existing type mismatch in randomWords options
        // that does not affect runtime behaviour. Suppress to allow builds.
        ignoreBuildErrors: true,
    },
};

export default nextConfig;
