// app/page.tsx
import Image from "next/image";
import platformIcon from "@/app/icon.png";
import { prisma } from "@/lib/prisma";
import { MatchCard } from "@/app/components/MatchCard"; // <--- Importamos o componente novo
import { calculateStandings } from "@/lib/utils";
import { StandingsTable } from "@/app/components/StandingsTable";

export default async function Home() {
  const matches = await prisma.match.findMany({
    where: { stage: "GROUP_STAGE" },
    include: { homeTeam: true, awayTeam: true },
    orderBy: { id: "asc" },
  });

  const groupA = matches.filter((m) => m.group === "A");
  const groupB = matches.filter((m) => m.group === "B");
  const standingsA = calculateStandings(groupA);
  const standingsB = calculateStandings(groupB);

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      {/* Header com a marca ProLeague FC */}
      <div className="bg-slate-900 text-white py-8 shadow-lg mb-8">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-black tracking-tighter italic uppercase text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400 flex items-center justify-center gap-3">
            <Image
              src={platformIcon}
              alt="ProLeague FC"
              width={48}
              height={48}
              className="h-12 w-12 drop-shadow"
            />
            <span>ProLeague FC</span>
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
          <StandingsTable stats={standingsA} />
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
          <StandingsTable stats={standingsB} />
          <div className="space-y-3">
            {groupB.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
