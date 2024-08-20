import "~/styles/globals.css";

import { Navbar } from "~/components/navbar";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Scott's Apriora",
  description: "The Galaxy's Best Interviewer",
  icons: [{ rel: "icon", url: "/favicon.png" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <Toaster position="top-center" />
      <body className="flex h-screen w-full flex-col items-center">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
