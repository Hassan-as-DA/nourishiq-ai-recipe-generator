"use client";

import { useRouter } from "next/navigation";
import { Label } from "@radix-ui/react-label";
import { ShoppingBasket, WandSparkles } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function HomePage() {
  const router = useRouter();
  return (
    <div>
      {/* Content */}
      <div className="h-[85vh] grid grid-cols-1 md:grid-cols-2 items-center justify-items-center px-8 gap-6">
        {/* Left Column */}
        <div className="p-4 w-full h-full flex items-center">
          <div className="text-left">
            <div className="text-left">
              <h2 className="text-6xl font-bold mb-2">
                <span className="leading-0">Eat Smart.</span>
              </h2>
              <h2 className="text-6xl font-bold mb-2">
                <span className="bg-slate-950 text-white leading-0 px-2">
                  Waste Less<span className="text-emerald-400">.</span>
                </span>
              </h2>
              <h2 className="text-6xl font-bold mb-2">Cook Creatively.</h2>
            </div>
            <br />
            <Label className="text-slate-600 text-xl font-light">
              Track ingredients, plan meals, and share what you can - with
              personalized AI that keeps food waste low and creativity high.
            </Label>
            <div className="flex flex-row space-x-2 items-start mt-8">
              <Button
                className="rounded-full py-6 px-12 cursor-pointer"
                onClick={() => router.push("/recipe/generate")}
              >
                <span className="flex flex-row gap-2">
                  Generate Recipe <WandSparkles />
                </span>
              </Button>
              <Button
                className="rounded-full py-6 px-12 cursor-pointer bg-emerald-500 hover:bg-emerald-700"
                onClick={() => router.push("/ingredients")}
              >
                <span className="flex flex-row gap-2">
                  Manage Ingredients <ShoppingBasket />
                </span>
              </Button>
            </div>
            <div className="mt-12 text-md text-slate-600 font-light flex flex-col items-start gap-2">
              {/* <Label>Thousands of users have donated through <b className="text-slate-500 font-semibold">NourishIQ</b>. Got more than you need? Share it with someone who needs it.</Label> */}
              <Label>
                Thousands of users have donated through{" "}
                <b className="text-slate-600 font-semibold">NourishIQ</b>. You
                can too - today 💚.
              </Label>
              <Label>
                Got extra ingredients? Share with your community 💖 - or pick up
                what you need from a local food bank to reduce waste and your
                carbon footprint ♻️.
              </Label>
              <div>
                <Link
                  href="/donate"
                  className="flex flex-row gap-1 text-slate-950 text-md cursor-pointer"
                >
                  <span className="underline decoration-slate-900 font-normal">
                    {/* Donate Food with Your Local Community 💖 */}
                    {/* See Local Food Banks 🤝 */}
                    Find Nearby Food Banks 🌍
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex justify-center w-full h-full px-6">
          <div className="flex items-center justify-center w-full h-full">
            <img
              src="/home.png"
              alt="Recipe"
              className="w-full h-full object-cover rounded-2xl aspect-square"
              style={{
                filter: "brightness(1) contrast(1)",
                maskImage:
                  "radial-gradient(circle, rgba(0,0,0,0.8) 25%, rgba(0,0,0,0) 100%)",
                WebkitMaskImage:
                  "radial-gradient(circle, rgba(0,0,0,0.8) 25%, rgba(0,0,0,0) 100%)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
