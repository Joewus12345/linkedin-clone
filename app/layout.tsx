import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import UserInitializer from "@/components/UserInitializer";

export const metadata: Metadata = {
  title: "LinkedIn Clone created by @kwadjoe",
  description: "A LinkedIn clone built with Next.js, Microsoft Azure and Clerk.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <UserInitializer />
      <html lang="en" className="scrollbar-hide">
        <body className="min-h-screen flex flex-col">
          {/* Toaster */}
          <Toaster position="bottom-left" />

          <header className="sticky top-0 sm:bg-white z-50">
            {/* Header */}
            <Header />
          </header>

          <div className="bg-[#F4F2ED] flex-1 w-full">
            <main className="md:max-w-6xl mx-auto">
              {children}
            </main>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
