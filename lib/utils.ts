import { Match, Team } from "@prisma/client";

type MatchWithTeams = Match & {
  homeTeam: Team | null;
  awayTeam: Team | null;
};

export type TeamStats = {
  teamId: string;
  teamName: string;
  points: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
};

export function calculateStandings(matches: MatchWithTeams[]): TeamStats[] {
  const stats: Record<string, TeamStats> = {};

  // 1. Inicializa o objeto para todos os times que aparecem nos jogos
  matches.forEach((match) => {
    if (match.homeTeam && !stats[match.homeTeam.id]) {
      stats[match.homeTeam.id] = createEmptyStats(
        match.homeTeam.id,
        match.homeTeam.name
      );
    }
    if (match.awayTeam && !stats[match.awayTeam.id]) {
      stats[match.awayTeam.id] = createEmptyStats(
        match.awayTeam.id,
        match.awayTeam.name
      );
    }

    // 2. Processa apenas jogos FINALIZADOS
    if (match.status === "FINISHED") {
      const home = stats[match.homeTeam!.id];
      const away = stats[match.awayTeam!.id];

      const goalsH = match.homeScore ?? 0;
      const goalsA = match.awayScore ?? 0;

      // Jogos Jogados
      home.played += 1;
      away.played += 1;

      // Gols
      home.goalsFor += goalsH;
      home.goalsAgainst += goalsA;
      home.goalDifference += goalsH - goalsA;

      away.goalsFor += goalsA;
      away.goalsAgainst += goalsH;
      away.goalDifference += goalsA - goalsH;

      // Pontos
      if (goalsH > goalsA) {
        home.points += 3;
        home.wins += 1;
        away.losses += 1;
      } else if (goalsA > goalsH) {
        away.points += 3;
        away.wins += 1;
        home.losses += 1;
      } else {
        home.points += 1;
        home.draws += 1;
        away.points += 1;
        away.draws += 1;
      }
    }
  });

  // 3. Transforma em Array e Ordena
  return Object.values(stats).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points; // Mais Pontos
    if (b.wins !== a.wins) return b.wins - a.wins; // Mais Vitórias
    return b.goalDifference - a.goalDifference; // Melhor Saldo
  });
}

function createEmptyStats(id: string, name: string): TeamStats {
  return {
    teamId: id,
    teamName: name,
    points: 0,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
  };
}
