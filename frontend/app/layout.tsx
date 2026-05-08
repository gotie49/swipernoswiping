import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import "maplibre-gl/dist/maplibre-gl.css";
import { UserProvider } from "@/context/UserContext";

export const metadata: Metadata = {
  title: "Kartentool",
  description: "Entdecke Orte in Wilhelmsburg",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full w-full overflow-x-hidden">
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}