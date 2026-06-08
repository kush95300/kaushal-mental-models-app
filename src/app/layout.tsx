import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { createInitialAdmin } from "@/actions/auth";
import AiChatbotWrapper from "@/components/chat/AiChatbotWrapper";


const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mental Model Repository | Educative",
  description: "A professional repository of cognitive mental models",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await createInitialAdmin();
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.variable} suppressHydrationWarning>
        <ThemeProvider>
            {children}
            <AiChatbotWrapper />
          </ThemeProvider>
      </body>
    </html>
  );
}
