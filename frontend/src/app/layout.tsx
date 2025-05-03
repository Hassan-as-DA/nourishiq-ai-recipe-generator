import { ReactNode } from "react";
import type { Metadata } from "next";

import "./globals.css";

import Link from "next/link";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { ChefHat, HandHeart, ShoppingBasket, WandSparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "NourishIQ - Cook Intelligently. Waste Less. Give More.",
  description:
    "NourishIQ helps you reduce food waste with AI-powered recipe generation and local food donation. Cook smart, share what's extra.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={cn("min-h-screen bg-green-50")}>
        <main>
          {/* Navbar */}
          <nav className="p-6 bg-transparent flex justify-between items-center">
            <Link href="/">
              <Image
                src="/nourishiq-logo.png"
                alt="NourishIQ Logo"
                width={120}
                height={120}
                className="h-auto w-auto ml-6"
              />
            </Link>
            <div className="flex space-x-4 mr-8">
              <span className="text-sm text-gray-600">
                <Link
                  href="/recipe/generate"
                  className="flex items-center space-x-1"
                >
                  <span>
                    <WandSparkles size={16} />
                  </span>
                  <span>Generate Recipe</span>
                </Link>
              </span>
              <span className="text-sm text-gray-600">
                <Link href="/donate" className="flex items-center space-x-1">
                  <span>
                    <HandHeart size={16} />
                  </span>
                  <span>Local Food Banks</span>
                </Link>
              </span>
              <span className="text-sm text-gray-600">
                <Link
                  href="/ingredients"
                  className="flex items-center space-x-1"
                >
                  <span>
                    <ShoppingBasket size={16} />
                  </span>
                  <span>Manage Ingredients</span>
                </Link>
              </span>
              <span className="text-sm text-gray-600">
                <Link
                  href="/recipe/history"
                  className="flex items-center space-x-1"
                >
                  <span>
                    <ChefHat size={16} />
                  </span>
                  <span>Your Recipes</span>
                </Link>
              </span>
            </div>
          </nav>
          {children}
        </main>
      </body>
    </html>
  );
}
