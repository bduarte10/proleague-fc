export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type {
  BracketMatch,
  BracketParticipant,
} from "@/app/components/BracketClient";
import { BracketClientWrapper } from "@/app/components/BracketClientWrapper";

export default async function BracketPage() {
  const [semifinals, finals] = await Promise.all([
    prisma.match.findMany({
      where: { stage: "SEMIFINAL" },
      include: { homeTeam: true, awayTeam: true },
      orderBy: { id: "asc" },
    }),
    prisma.match.findMany({
      where: { stage: "FINAL" },
      include: { homeTeam: true, awayTeam: true },
      orderBy: { id: "asc" },
    }),
  ]);

  const finalId = finals[0]?.id;

  const mapToBracket = (
    match: (typeof semifinals)[number] | (typeof finals)[number],
    isSemifinal: boolean
  ): BracketMatch => {
    const isFinished = match.status === "FINISHED";
    const roundLabel = match.stage === "SEMIFINAL" ? "Semifinal" : "Final";

    const home: BracketParticipant = {
      id: match.homeTeam?.id ?? `${match.id}-home`,
      name: match.homeTeam?.name ?? "A definir",
      resultText: isFinished ? String(match.homeScore ?? 0) : null,
      isWinner:
        isFinished && (match.homeScore ?? 0) > (match.awayScore ?? 0)
          ? true
          : false,
    };

    const away: BracketParticipant = {
      id: match.awayTeam?.id ?? `${match.id}-away`,
      name: match.awayTeam?.name ?? "A definir",
      resultText: isFinished ? String(match.awayScore ?? 0) : null,
      isWinner:
        isFinished && (match.awayScore ?? 0) > (match.homeScore ?? 0)
          ? true
          : false,
    };

    return {
      id: match.id,
      name: roundLabel,
      tournamentRoundText: roundLabel,
      startTime: (match.matchDate ?? new Date()).toISOString(),
      state: isFinished ? "PLAYED" : "SCHEDULED",
      nextMatchId: isSemifinal && finalId ? finalId : null,
      participants: [home, away],
      homeScore: match.homeScore ?? 0,
      awayScore: match.awayScore ?? 0,
      matchId: match.id,
    };
  };

  const bracketMatches: BracketMatch[] = [
    ...semifinals.map((m) => mapToBracket(m, true)),
    ...finals.map((m) => mapToBracket(m, false)),
  ];

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 pb-16">
      <div className="bg-linear-to-r from-slate-900 to-slate-800 shadow-lg mb-8">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-blue-400 font-bold mb-2">
                🏆 Chave Eliminatória
              </p>
              <h1 className="text-3xl font-black text-white tracking-tight">
                Mata-Mata ProLeague FC
              </h1>
            </div>
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              ← Voltar para Home
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <BracketClientWrapper matches={bracketMatches} />
      </div>
    </main>
  );
}
