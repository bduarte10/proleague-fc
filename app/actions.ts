// app/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { calculateStandings } from "@/app/utils";
import { redirect } from "next/navigation";
import { Match } from "@prisma/client";

export async function updateMatchScore(formData: FormData) {
  // 1. Pegar dados do formulário
  const matchId = formData.get("matchId") as string;
  const homeScore = parseInt(formData.get("homeScore") as string);
  const awayScore = parseInt(formData.get("awayScore") as string);

  // 2. Buscar o jogo atual
  const match = await prisma.match.findUnique({
    where: { id: matchId },
  });

  if (!match) {
    throw new Error("Partida não encontrada");
  }

  // 3. Prevenir empate em jogos de mata-mata
  if (match.stage !== "GROUP_STAGE" && homeScore === awayScore) {
    throw new Error("Mata-mata não pode ter empate! Defina um vencedor.");
  }

  // 4. Atualizar no Banco
  await prisma.match.update({
    where: { id: matchId },
    data: {
      homeScore: homeScore,
      awayScore: awayScore,
      status: "FINISHED", // Marca como finalizado automaticamente
    },
  });

  // 5. Se for mata-mata, propagar o vencedor para a próxima fase
  if (match.stage !== "GROUP_STAGE") {
    const winnerId =
      homeScore > awayScore ? match.homeTeamId : match.awayTeamId;
    if (winnerId) {
      await propagateWinner(match, winnerId);
    }
  }

  // 6. Atualizar a tela (Cache Revalidation)
  revalidatePath("/");
  revalidatePath("/bracket");
}

async function propagateWinner(match: Match, winnerId: string) {
  // Se for SEMIFINAL, atualizar a FINAL
  if (match.stage === "SEMIFINAL") {
    // Buscar todas as semifinais
    const semifinals = await prisma.match.findMany({
      where: { stage: "SEMIFINAL" },
      orderBy: { id: "asc" },
    });

    // Buscar a final
    const final = await prisma.match.findFirst({
      where: { stage: "FINAL" },
    });

    if (!final) return;

    // Determinar se o vencedor vai para home ou away da final
    const isFirstSemifinal = semifinals[0]?.id === match.id;

    if (isFirstSemifinal) {
      // Vencedor da primeira semi vai para home da final
      await prisma.match.update({
        where: { id: final.id },
        data: { homeTeamId: winnerId },
      });
    } else {
      // Vencedor da segunda semi vai para away da final
      await prisma.match.update({
        where: { id: final.id },
        data: { awayTeamId: winnerId },
      });
    }
  }
}
export async function generateSemifinals() {
  // 1. Busca todos os jogos da fase de grupos
  const matches = await prisma.match.findMany({
    where: { stage: "GROUP_STAGE" },
    include: { homeTeam: true, awayTeam: true },
  });

  // 2. Trava de Segurança: Todos devem estar FINISHED
  const pendingGames = matches.filter((m) => m.status !== "FINISHED");
  if (pendingGames.length > 0) {
    throw new Error(
      `Ainda faltam ${pendingGames.length} jogos para encerrar a fase de grupos.`
    );
  }

  // 3. Calcula a classificação final
  const standingsA = calculateStandings(matches.filter((m) => m.group === "A"));
  const standingsB = calculateStandings(matches.filter((m) => m.group === "B"));

  // 4. Cria as Semifinais (1ºA x 2ºB e 1ºB x 2ºA)
  await prisma.match.create({
    data: {
      stage: "SEMIFINAL",
      homeTeamId: standingsA[0].teamId,
      awayTeamId: standingsB[1].teamId,
      status: "SCHEDULED",
    },
  });

  await prisma.match.create({
    data: {
      stage: "SEMIFINAL",
      homeTeamId: standingsB[0].teamId,
      awayTeamId: standingsA[1].teamId,
      status: "SCHEDULED",
    },
  });

  // 5. Cria a Final (Vazia por enquanto)
  await prisma.match.create({
    data: {
      stage: "FINAL",
      status: "SCHEDULED",
    },
  });

  revalidatePath("/");
}
