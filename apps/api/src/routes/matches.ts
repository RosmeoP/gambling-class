import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { syncMatches } from "../lib/syncMatches.js";
import { requireAuth } from "../middleware/auth.js";

export const matchesRouter = Router();
matchesRouter.use(requireAuth);

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

async function listMatchesWithMyPrediction(userId: string, from: Date, to: Date) {
  const matches = await prisma.match.findMany({
    where: { kickoff: { gte: from, lte: to } },
    orderBy: { kickoff: "asc" },
    include: { predictions: { where: { userId } } },
  });

  return matches.map((m) => ({
    id: m.id,
    externalId: m.externalId,
    homeTeam: m.homeTeam,
    awayTeam: m.awayTeam,
    kickoff: m.kickoff,
    status: m.status,
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    myPrediction: m.predictions[0] ?? null,
  }));
}

matchesRouter.get("/teams", async (_req, res) => {
  const homeTeams = await prisma.match.findMany({
    select: { homeTeam: true },
    distinct: ["homeTeam"],
  });
  const awayTeams = await prisma.match.findMany({
    select: { awayTeam: true },
    distinct: ["awayTeam"],
  });
  const teams = Array.from(
    new Set([...homeTeams.map((m) => m.homeTeam), ...awayTeams.map((m) => m.awayTeam)]),
  ).sort((a, b) => a.localeCompare(b));
  res.json(teams);
});

matchesRouter.get("/today", async (req, res) => {
  const now = new Date();
  const matches = await listMatchesWithMyPrediction(req.userId!, startOfDay(now), endOfDay(now));
  res.json(matches);
});

matchesRouter.get("/upcoming", async (req, res) => {
  const now = new Date();
  const threeDaysOut = new Date(now);
  threeDaysOut.setDate(threeDaysOut.getDate() + 3);

  const matches = await prisma.match.findMany({
    where: { kickoff: { gt: endOfDay(now), lte: endOfDay(threeDaysOut) } },
    orderBy: { kickoff: "asc" },
    include: { predictions: { where: { userId: req.userId! } } },
  });

  res.json(
    matches.map((m) => ({
      id: m.id,
      externalId: m.externalId,
      homeTeam: m.homeTeam,
      awayTeam: m.awayTeam,
      kickoff: m.kickoff,
      status: m.status,
      homeScore: m.homeScore,
      awayScore: m.awayScore,
      myPrediction: m.predictions[0] ?? null,
    })),
  );
});

matchesRouter.get("/", async (req, res) => {
  const dateParam = typeof req.query.date === "string" ? req.query.date : null;
  const date = dateParam ? new Date(dateParam) : new Date();
  if (Number.isNaN(date.getTime())) {
    res.status(400).json({ error: "Invalid date" });
    return;
  }
  const matches = await listMatchesWithMyPrediction(req.userId!, startOfDay(date), endOfDay(date));
  res.json(matches);
});

matchesRouter.post("/sync", async (_req, res) => {
  try {
    const synced = await syncMatches();
    res.json({ synced });
  } catch (err) {
    res.status(502).json({ error: err instanceof Error ? err.message : "Sync failed" });
  }
});
