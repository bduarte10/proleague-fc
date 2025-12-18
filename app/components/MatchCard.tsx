// components/MatchCard.tsx
"use client";

import Image from "next/image";
import { Match, Team } from "@prisma/client";
import { updateMatchScore } from "@/app/actions"; // Importamos a action do passo 1
import { useState } from "react";

type TeamWithFlag = Team & { isoCode?: string | null };

type MatchWithTeams = Match & {
  homeTeam: TeamWithFlag | null;
  awayTeam: TeamWithFlag | null;
};

const getFlagUrl = (isoCode?: string | null) =>
  isoCode ? `https://flagcdn.com/w40/${isoCode.toLowerCase()}.png` : null;

function TeamInfo({
  team,
  flagFirst,
}: {
  team: TeamWithFlag | null;
  flagFirst: boolean;
}) {
  const flagUrl = getFlagUrl(team?.isoCode);
  const initials = team?.name?.[0]?.toUpperCase() ?? "–";

  const flagNode = flagUrl ? (
    <Image
      src={flagUrl}
      alt={`Bandeira de ${team?.name ?? "time"}`}
      width={32}
      height={24}
      className="h-6 w-8 rounded object-cover border border-slate-200 shadow-sm"
    />
  ) : (
    <div className="h-8 w-8 rounded-md bg-slate-100 text-slate-500 flex items-center justify-center border border-slate-200">
      <span className="text-xs font-semibold">{initials}</span>
    </div>
  );

  return (
    <div
      className={`flex w-full min-w-0 items-center gap-2 px-2 ${
        flagFirst ? "justify-start text-left" : "justify-end text-right"
      }`}
    >
      {flagFirst && <div className="shrink-0">{flagNode}</div>}
      <span className="font-semibold text-slate-800 truncate flex-1">
        {team?.name ?? "Sem time"}
      </span>
      {!flagFirst && <div className="shrink-0">{flagNode}</div>}
    </div>
  );
}

export function MatchCard({ match }: { match: MatchWithTeams }) {
  const [isEditing, setIsEditing] = useState(false);
  const isFinished = match.status === "FINISHED";

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 transition-all hover:shadow-md overflow-hidden">
      {/* Envolvemos tudo num <form> que chama a Server Action */}
      <form
        action={async (formData) => {
          await updateMatchScore(formData);
          setIsEditing(false); // Fecha a edição após salvar
        }}
        className="flex flex-col gap-3 w-full"
      >
        {/* Input Escondido para enviar o ID */}
        <input type="hidden" name="matchId" value={match.id} />

        {/* Linha principal: times e placar alinhados */}
        <div className="grid grid-cols-[minmax(140px,1fr)_auto_minmax(140px,1fr)] items-center gap-3 md:gap-5 w-full justify-items-center">
          <TeamInfo team={match.homeTeam} flagFirst={false} />

          <div className="flex items-center justify-center gap-3">
            {isEditing ? (
              // MODO EDIÇÃO: Inputs
              <>
                <input
                  name="homeScore"
                  type="number"
                  defaultValue={match.homeScore ?? 0}
                  className="w-12 h-11 text-center text-slate-800 border border-slate-200 rounded-lg bg-slate-50 font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none [-moz-appearance:textfield]"
                />
                <span className="text-base font-bold text-slate-500">-</span>
                <input
                  name="awayScore"
                  type="number"
                  defaultValue={match.awayScore ?? 0}
                  className="w-12 h-11 text-center text-slate-800 border border-slate-200 rounded-lg bg-slate-50 font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none [-moz-appearance:textfield]"
                />
              </>
            ) : (
              // MODO VISUALIZAÇÃO: Texto
              <div className="flex items-center gap-3 text-xl font-bold text-slate-800">
                <span
                  className={`w-11 h-11 flex items-center justify-center rounded-xl ${
                    isFinished
                      ? "bg-slate-800 text-white"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {isFinished ? match.homeScore : "-"}
                </span>
                <span className="text-base font-bold text-slate-500">-</span>
                <span
                  className={`w-11 h-11 flex items-center justify-center rounded-xl ${
                    isFinished
                      ? "bg-slate-800 text-white"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {isFinished ? match.awayScore : "-"}
                </span>
              </div>
            )}
          </div>

          <TeamInfo team={match.awayTeam} flagFirst={true} />
        </div>

        {/* Botões de ação abaixo, alinhados ao centro */}
        <div className="flex items-center justify-center gap-2">
          {isEditing ? (
            <>
              <button
                type="submit"
                className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 font-semibold"
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-md hover:bg-slate-200 font-semibold border border-slate-200"
              >
                Cancelar
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setIsEditing(true);
              }}
              className="text-[10px] text-blue-600 hover:underline uppercase font-bold tracking-wide"
            >
              {isFinished ? "Alterar" : "Jogar"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
