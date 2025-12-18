import { GroupName, Stage, MatchStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";

async function main() {
  // Clear existing data to keep seeds idempotent.
  await prisma.match.deleteMany();
  await prisma.team.deleteMany();

  console.log("Criando times...");

  // Grupo A (Grupo 1)
  const groupA = await Promise.all([
    prisma.team.create({
      data: { name: "Espanha", group: GroupName.A, isoCode: "ES" },
    }),
    prisma.team.create({
      data: { name: "Noruega", group: GroupName.A, isoCode: "NO" },
    }),
    prisma.team.create({
      data: { name: "Argentina", group: GroupName.A, isoCode: "AR" },
    }),
    prisma.team.create({
      data: { name: "Alemanha", group: GroupName.A, isoCode: "DE" },
    }),
  ]);

  // Grupo B (Grupo 2)
  const groupB = await Promise.all([
    prisma.team.create({
      data: { name: "França", group: GroupName.B, isoCode: "FR" },
    }),
    prisma.team.create({
      data: { name: "Inglaterra", group: GroupName.B, isoCode: "GB" },
    }),
    prisma.team.create({
      data: { name: "Holanda", group: GroupName.B, isoCode: "NL" },
    }),
    prisma.team.create({
      data: { name: "Portugal", group: GroupName.B, isoCode: "PT" },
    }),
  ]);

  console.log("Gerando partidas da fase de grupos...");

  // Cria confrontos todos contra todos para o grupo informado.
  const createMatchesForGroup = async (
    teams: { id: string }[],
    groupName: GroupName
  ) => {
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        await prisma.match.create({
          data: {
            homeTeamId: teams[i].id,
            awayTeamId: teams[j].id,
            stage: Stage.GROUP_STAGE,
            group: groupName,
            status: MatchStatus.SCHEDULED,
          },
        });
      }
    }
  };

  await createMatchesForGroup(groupA, GroupName.A);
  await createMatchesForGroup(groupB, GroupName.B);

  console.log("Seed concluído! Banco pronto para o Frontend.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
