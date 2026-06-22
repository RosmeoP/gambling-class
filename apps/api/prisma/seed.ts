import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const now = new Date();
  const matches = [
    {
      externalId: 1000001,
      homeTeam: "Argentina",
      awayTeam: "Mexico",
      kickoff: new Date(now.getTime() + 2 * 60 * 60 * 1000),
      status: "scheduled",
      homeScore: null,
      awayScore: null,
    },
    {
      externalId: 1000002,
      homeTeam: "Brazil",
      awayTeam: "Spain",
      kickoff: new Date(now.getTime() + 5 * 60 * 60 * 1000),
      status: "scheduled",
      homeScore: null,
      awayScore: null,
    },
    {
      externalId: 1000003,
      homeTeam: "France",
      awayTeam: "Germany",
      kickoff: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      status: "finished",
      homeScore: 2,
      awayScore: 1,
    },
  ];

  for (const match of matches) {
    await prisma.match.upsert({
      where: { externalId: match.externalId },
      create: match,
      update: match,
    });
  }

  console.log(`Seeded ${matches.length} sample matches.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
