"use client";

import {
  SingleEliminationBracket,
  SVGViewer,
  type MatchComponentProps,
  type SvgViewerProps,
} from "@g-loot/react-tournament-brackets";
import { updateMatchScore } from "@/app/actions";
import { useMemo, useState, useEffect } from "react";

export type BracketParticipant = {
  id: string | number;
  name: string;
  resultText?: string | null;
  isWinner?: boolean;
  status?: string;
};

export type BracketMatch = {
  id: string | number;
  name?: string;
  nextMatchId: string | number | null;
  tournamentRoundText?: string;
  startTime: string;
  state: string;
  participants: BracketParticipant[];
  // metadata para edição
  homeScore?: number | null;
  awayScore?: number | null;
  matchId?: string;
};

export function BracketClient({ matches }: { matches: BracketMatch[] }) {
  const mappedMatches = useMemo(() => {
    if (!matches || matches.length === 0) {
      return [];
    }
    return matches.map((m) => ({
      ...m,
      // fallback para não quebrar o componente
      participants: m.participants ?? [],
    }));
  }, [matches]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-4 overflow-x-auto">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .bracket-container svg {
          pointer-events: none !important;
        }
        .bracket-container foreignObject {
          pointer-events: auto !important;
        }
        .bracket-container foreignObject * {
          pointer-events: auto !important;
        }
        .bracket-container input {
          pointer-events: auto !important;
          cursor: text !important;
        }
      `,
        }}
      />
      {mappedMatches.length === 0 ? (
        <div className="text-sm text-slate-500 text-center p-6">
          Nenhuma partida de mata-mata disponível.
        </div>
      ) : (
        <div className="min-w-max bracket-container">
          <SingleEliminationBracket
            matches={mappedMatches}
            matchComponent={EditableMatch}
            options={{
              style: {
                roundHeader: {
                  isShown: true,
                  backgroundColor: "#0f172a",
                  fontColor: "#ffffff",
                  height: 40,
                  marginBottom: 20,
                },
                connectorColor: "#cbd5e1",
                connectorColorHighlight: "#3b82f6",
                lineInfo: { homeVisitorSpread: 0.35 },
                horizontalOffset: 30,
                spaceBetweenColumns: 100,
                spaceBetweenRows: 80,
                canvasPadding: 40,
                boxHeight: 110,
                width: 240,
              },
            }}
            svgWrapper={({
              children,
              ...props
            }: SvgViewerProps & { children: React.ReactElement }) => {
              const {
                width: _w,
                height: _h,
                bracketWidth,
                bracketHeight,
                startAt,
                scaleFactor,
                ...rest
              } = props;
              void _w;
              void _h;
              return (
                <SVGViewer
                  bracketWidth={bracketWidth}
                  bracketHeight={bracketHeight}
                  startAt={startAt ?? [0, 0]}
                  scaleFactor={scaleFactor ?? 1}
                  width={Math.max(900, bracketWidth + 100)}
                  height={Math.max(500, bracketHeight + 100)}
                  {...rest}
                >
                  {children}
                </SVGViewer>
              );
            }}
          />
        </div>
      )}
    </div>
  );
}

function EditableMatch({ match }: MatchComponentProps) {
  const [home, away] = match.participants;
  const initialHome =
    (match as BracketMatch & { homeScore?: number }).homeScore ??
    Number(home?.resultText ?? 0);
  const initialAway =
    (match as BracketMatch & { awayScore?: number }).awayScore ??
    Number(away?.resultText ?? 0);
  const matchId = (match as BracketMatch & { matchId?: string }).matchId;

  const [homeScore, setHomeScore] = useState(initialHome);
  const [awayScore, setAwayScore] = useState(initialAway);

  const handleScoreChange = async (newHome: number, newAway: number) => {
    if (!matchId) return;
    const formData = new FormData();
    formData.append("matchId", matchId);
    formData.append("homeScore", String(newHome));
    formData.append("awayScore", String(newAway));
    await updateMatchScore(formData);
  };

  return (
    <div className="w-full h-[110px] flex flex-col bg-white rounded-lg border border-slate-300 shadow-sm hover:shadow-md transition-shadow p-2">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5 text-center">
        {match.tournamentRoundText ?? match.name ?? "Partida"}
      </div>
      <div className="flex-1 flex flex-col justify-center gap-1.5">
        <TeamRow
          name={home?.name ?? "A definir"}
          defaultScore={homeScore}
          isWinner={home?.isWinner}
          onScoreChange={(newScore) => {
            setHomeScore(newScore);
            handleScoreChange(newScore, awayScore);
          }}
        />
        <TeamRow
          name={away?.name ?? "A definir"}
          defaultScore={awayScore}
          isWinner={away?.isWinner}
          onScoreChange={(newScore) => {
            setAwayScore(newScore);
            handleScoreChange(homeScore, newScore);
          }}
        />
      </div>
    </div>
  );
}

function TeamRow({
  name,
  defaultScore,
  isWinner,
  onScoreChange,
}: {
  name: string;
  defaultScore: number;
  isWinner?: boolean;
  onScoreChange: (score: number) => void;
}) {
  const [localScore, setLocalScore] = useState(defaultScore);
  const [lastSavedScore, setLastSavedScore] = useState(defaultScore);

  useEffect(() => {
    setLocalScore(defaultScore);
    setLastSavedScore(defaultScore);
  }, [defaultScore]);

  const handleBlur = () => {
    if (localScore !== lastSavedScore) {
      setLastSavedScore(localScore);
      onScoreChange(localScore);
    }
  };

  return (
    <div
      className={`flex items-center justify-between gap-1.5 px-1.5 py-0.5 rounded h-[26px] ${
        isWinner
          ? "bg-green-50 border border-green-300"
          : "bg-slate-50 border border-slate-200"
      }`}
    >
      <div className="min-w-0 flex-1 flex items-center gap-1">
        <p className="text-[11px] font-semibold text-slate-900 truncate leading-tight">
          {name}
        </p>
        {isWinner && <span className="text-[9px] shrink-0">🏆</span>}
      </div>
      <input
        type="number"
        min="0"
        max="99"
        value={localScore}
        onClick={(e) => {
          e.stopPropagation();
          e.currentTarget.focus();
          e.currentTarget.select();
        }}
        onChange={(e) => {
          const inputValue = e.target.value;
          if (inputValue === "") {
            setLocalScore(0);
            return;
          }
          const val = parseInt(inputValue);
          if (!isNaN(val)) {
            setLocalScore(Math.max(0, Math.min(99, val)));
          }
        }}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.currentTarget.blur();
          }
        }}
        style={{ pointerEvents: "auto" }}
        className="w-7 h-5 text-center text-[11px] font-bold text-slate-900 border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 shrink-0 [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
    </div>
  );
}
