import { GroupName, Stage, MatchStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";

async function main() {
  // Clear existing data to keep seeds idempotent.
  await prisma.match.deleteMany();
  await prisma.team.deleteMany();

  console.log("Criando times...");

  // Grupo A
  const teamA1 = await prisma.team.create({
    data: { name: "Brasil", group: GroupName.A, isoCode: "BR" },
  });
  const teamA2 = await prisma.team.create({
    data: { name: "Argentina", group: GroupName.A, isoCode: "AR" },
  });
  const teamA3 = await prisma.team.create({
    data: { name: "Uruguai", group: GroupName.A, isoCode: "UY" },
  });
  const teamA4 = await prisma.team.create({
    data: { name: "Chile", group: GroupName.A, isoCode: "CL" },
  });

  // Grupo B
  const teamB1 = await prisma.team.create({
    data: { name: "França", group: GroupName.B, isoCode: "FR" },
  });
  const teamB2 = await prisma.team.create({
    data: { name: "Alemanha", group: GroupName.B, isoCode: "DE" },
  });
  const teamB3 = await prisma.team.create({
    data: { name: "Itália", group: GroupName.B, isoCode: "IT" },
  });
  const teamB4 = await prisma.team.create({
    data: { name: "Espanha", group: GroupName.B, isoCode: "ES" },
  });

  const groupA = [teamA1, teamA2, teamA3, teamA4];
  const groupB = [teamB1, teamB2, teamB3, teamB4];

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
