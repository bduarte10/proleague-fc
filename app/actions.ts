// app/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateMatchScore(formData: FormData) {
  // 1. Pegar dados do formulário
  const matchId = formData.get("matchId") as string;
  const homeScore = parseInt(formData.get("homeScore") as string);
  const awayScore = parseInt(formData.get("awayScore") as string);

  // 2. Atualizar no Banco
  await prisma.match.update({
    where: { id: matchId },
    data: {
      homeScore: homeScore,
      awayScore: awayScore,
      status: "FINISHED", // Marca como finalizado automaticamente
    },
  });

  // 3. Atualizar a tela (Cache Revalidation)
  // Isso faz a tela piscar com os dados novos sem você precisar dar F5
  revalidatePath("/");
}
