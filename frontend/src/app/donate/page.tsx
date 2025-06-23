"use client";

import dynamic from "next/dynamic";

const Map = dynamic(() => import("./map"), { ssr: false });

export default function DonatePage() {
  return (
    <div className="w-full h-[87vh] flex flex-col px-14 items-center justify-center">
      <h2 className="text-4xl font-semibold mb-2 text-center px-8">
        Share More. <span className="text-emerald-500">Waste Less.</span>
      </h2>
      <h4 className="text-lg font-light text-slate-600 mb-8 text-center px-8">
        Find local food banks in Hamburg to donate your extras or pick up what you need. Cut waste and carbon, together.
      </h4>
      <Map />
    </div>
  );
}
