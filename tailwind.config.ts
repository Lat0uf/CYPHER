import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                matrix: {
                    50: '#e8e8e8',
                    100: '#a8a8a8',
                    200: '#8b8b8b',
                    300: '#6b6b6b',
                    400: '#4d4d4d',
                    500: '#333333',
                    600: '#262626',
                    700: '#1a1a1a',
                    800: '#0d0d0d',
                    900: '#0a0a0a',
                },
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Space Grotesk', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            backdropBlur: {
                xs: '2px',
            },
            animation: {
                'shake': 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
                'glow': 'glow 2s ease-in-out infinite alternate',
            },
            keyframes: {
                shake: {
                    '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
                    '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
                    '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
                    '40%, 60%': { transform: 'translate3d(4px, 0, 0)' },
                },
                glow: {
                    from: { boxShadow: '0 0 10px rgba(102, 102, 102, 0.3)' },
                    to: { boxShadow: '0 0 20px rgba(102, 102, 102, 0.6)' },
                },
            },
        },
    },
    plugins: [],
};

export default config;
