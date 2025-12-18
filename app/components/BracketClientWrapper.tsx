"use client";

import dynamic from "next/dynamic";
import type { BracketMatch } from "@/app/components/BracketClient";

const BracketClient = dynamic(
  () =>
    import("@/app/components/BracketClient").then((mod) => mod.BracketClient),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 text-sm text-slate-500">
        Carregando chave...
      </div>
    ),
  }
);

export function BracketClientWrapper({ matches }: { matches: BracketMatch[] }) {
  return <BracketClient matches={matches} />;
}


