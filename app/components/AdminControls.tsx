"use client";

import { generateSemifinals } from "@/app/actions";
import { useState } from "react";

interface AdminControlsProps {
  pendingGames: number;
  hasFinishedGroupStage: boolean;
}

export function AdminControls({
  pendingGames,
  hasFinishedGroupStage,
}: AdminControlsProps) {
  const [loading, setLoading] = useState(false);

  // Se já tem semifinal criada, o botão some
  if (hasFinishedGroupStage) {
    return null;
  }

  const canGenerate = pendingGames === 0;

  return (
    <div className="text-center mt-5 bg-slate-50">
      {!canGenerate ? (
        <div className="inline-flex items-center gap-3 bg-amber-50 text-amber-800 px-6 py-3 rounded-full border border-amber-200 shadow-sm text-sm font-medium">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
          </span>
          Atenção: Faltam finalizar{" "}
          <strong className="text-amber-900">{pendingGames} jogos</strong> da
          fase de grupos.
        </div>
      ) : (
        <form
          action={async () => {
            setLoading(true);
            await generateSemifinals();
            setLoading(false);
          }}
        >
          <button
            disabled={loading}
            className="bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-xl font-bold shadow-xl shadow-slate-900/10 transition-all hover:scale-105 active:scale-95 flex items-center gap-3 mx-auto"
          >
            {loading
              ? "Processando..."
              : "🏆 Encerrar Grupos e Gerar Mata-mata"}
          </button>
        </form>
      )}
    </div>
  );
}
