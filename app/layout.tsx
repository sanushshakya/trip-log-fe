import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { Toaster } from "@/components/ui/sonner";
import "leaflet/dist/leaflet.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TruckPlan - Trip Planning & Logging",
  description:
    "Professional trucking trip planning and electronic logbook management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main>{children}</main>
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
