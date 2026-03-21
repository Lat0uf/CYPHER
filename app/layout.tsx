import type { Metadata } from "next";
import "./globals.css";
import TitleGlitch from "@/components/TitleGlitch";

export const metadata: Metadata = {
    title: "CYPHER",
    description: "Infinite cipher-hacking game with Matrix aesthetics. How far can you go?",
    icons: {
        icon: [
            { url: "/favicon.ico", sizes: "any" },
            { url: "/icon.png", type: "image/png", sizes: "512x512" },
        ],
        apple: "/apple-touch-icon.png",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased">
                <TitleGlitch />
                {children}
            </body>
        </html>
    );
}
