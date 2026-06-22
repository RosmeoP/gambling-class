import { fetchWorldCupMatches } from "../integrations/footballData.js";
import { prisma } from "./prisma.js";

export async function syncMatches(): Promise<number> {
  const matches = await fetchWorldCupMatches();
  for (const m of matches) {
    await prisma.match.upsert({
      where: { externalId: m.externalId },
      create: m,
      update: m,
    });
  }
  return matches.length;
}
