// app/page.tsx
import { prisma } from "@/lib/prisma";
import { MatchCard } from "@/app/components/MatchCard"; // <--- Importamos o componente novo
import { AdminControls } from "@/app/components/AdminControls";
import { calculateStandings } from "@/app/utils";
import type { Prisma } from "@prisma/client";
import Link from "next/link";

type MatchWithTeams = Prisma.MatchGetPayload<{
  include: { homeTeam: true; awayTeam: true };
}>;

export default async function Home() {
  const [groupMatches, semifinalMatches, finalMatches] = await Promise.all([
    prisma.match.findMany({
      where: { stage: "GROUP_STAGE" },
      include: { homeTeam: true, awayTeam: true },
      orderBy: { id: "asc" },
    }),
    prisma.match.findMany({
      where: { stage: "SEMIFINAL" },
      include: { homeTeam: true, awayTeam: true },
      orderBy: { id: "asc" },
    }),
    prisma.match.findMany({
      where: { stage: "FINAL" },
      include: { homeTeam: true, awayTeam: true },
    }),
  ]);

  const groupA = groupMatches.filter((m) => m.group === "A");
  const groupB = groupMatches.filter((m) => m.group === "B");
  const pendingGames = groupMatches.filter(
    (m) => m.status !== "FINISHED"
  ).length;
  const hasFinishedGroupStage = semifinalMatches.length > 0;
  const standingsA = calculateStandings(groupA as MatchWithTeams[]);
  const standingsB = calculateStandings(groupB as MatchWithTeams[]);

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      {/* Header com a marca ProLeague FC */}
      <div className="bg-slate-900 text-white py-8 shadow-lg mb-8">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-black tracking-tighter italic uppercase text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-green-400">
            ProLeague FC
          </h1>
          <p className="text-slate-400 text-sm mt-1 tracking-widest">
            OFFICIAL TOURNAMENT
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 grid md:grid-cols-2 gap-8">
        {/* Grupo A */}
        <section>
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="font-bold text-xl text-slate-800 border-l-4 border-blue-600 pl-3">
              Grupo A
            </h2>
          </div>
          <div className="text-sm text-slate-600 mb-3">
            {standingsA.map((team, idx) => (
              <div key={team.teamId} className="flex justify-between">
                <span>
                  {idx + 1}º {team.teamName}
                </span>
                <span className="font-semibold">{team.points} pts</span>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {groupA.map((match) => (
              // Agora usamos o componente Client Side
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>

        {/* Grupo B */}
        <section>
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="font-bold text-xl text-slate-800 border-l-4 border-green-600 pl-3">
              Grupo B
            </h2>
          </div>
          <div className="text-sm text-slate-600 mb-3">
            {standingsB.map((team, idx) => (
              <div key={team.teamId} className="flex justify-between">
                <span>
                  {idx + 1}º {team.teamName}
                </span>
                <span className="font-semibold">{team.points} pts</span>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {groupB.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>
      </div>

      <div className="max-w-5xl mx-auto px-4">
        <AdminControls
          pendingGames={pendingGames}
          hasFinishedGroupStage={hasFinishedGroupStage}
        />
      </div>

      {hasFinishedGroupStage && (
        <div className="max-w-5xl mx-auto px-4 mt-10 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-xl text-slate-900">Mata-mata</h2>
            <p className="text-xs text-slate-500">Semifinais e Final</p>
          </div>

          <section className="grid md:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800">
                  Semifinais
                </h3>
              </div>
              <div className="space-y-3">
                {semifinalMatches.length === 0 && (
                  <p className="text-sm text-slate-500">
                    Nenhuma semifinal gerada ainda.
                  </p>
                )}
                {semifinalMatches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800">Final</h3>
              </div>
              <div className="space-y-3">
                {finalMatches.length === 0 && (
                  <p className="text-sm text-slate-500">
                    Final será preenchida após as semifinais.
                  </p>
                )}
                {finalMatches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            </div>
          </section>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 mt-8">
        <Link
          href="/bracket"
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline"
        >
          Ver chave estilo g-loot →
        </Link>
      </div>
    </main>
  );
}
