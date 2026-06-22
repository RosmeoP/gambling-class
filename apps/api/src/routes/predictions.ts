import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

export const predictionsRouter = Router();
predictionsRouter.use(requireAuth);

const upsertSchema = z.object({
  matchId: z.string().uuid(),
  homeScore: z.number().int().min(0).max(50),
  awayScore: z.number().int().min(0).max(50),
});

predictionsRouter.post("/", async (req, res) => {
  const parsed = upsertSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { matchId, homeScore, awayScore } = parsed.data;

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) {
    res.status(404).json({ error: "Match not found" });
    return;
  }
  if (new Date(match.kickoff) <= new Date()) {
    res.status(400).json({ error: "Cannot predict after kickoff" });
    return;
  }

  const prediction = await prisma.prediction.upsert({
    where: { userId_matchId: { userId: req.userId!, matchId } },
    create: { userId: req.userId!, matchId, homeScore, awayScore },
    update: { homeScore, awayScore },
  });

  res.json(prediction);
});

// Predictions of everyone in a group for a given match. A teammate's pick is
// only visible once you've submitted your own for that match, or once
// kickoff has passed — whichever happens first. This stops people copying.
predictionsRouter.get("/matches/:matchId", async (req, res) => {
  const groupId = typeof req.query.groupId === "string" ? req.query.groupId : null;
  if (!groupId) {
    res.status(400).json({ error: "groupId query param is required" });
    return;
  }

  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: req.userId! } },
  });
  if (!membership) {
    res.status(403).json({ error: "Not a member of this group" });
    return;
  }

  const match = await prisma.match.findUnique({ where: { id: req.params.matchId } });
  if (!match) {
    res.status(404).json({ error: "Match not found" });
    return;
  }
  const kickoffPassed = new Date(match.kickoff) <= new Date();

  const myPrediction = await prisma.prediction.findUnique({
    where: { userId_matchId: { userId: req.userId!, matchId: req.params.matchId } },
  });
  const iHavePredicted = Boolean(myPrediction);

  const members = await prisma.groupMember.findMany({
    where: { groupId },
    include: {
      user: {
        include: { predictions: { where: { matchId: req.params.matchId } } },
      },
    },
  });

  const result = members.map((m) => {
    const prediction = m.user.predictions[0] ?? null;
    const visible = kickoffPassed || iHavePredicted;
    return {
      userId: m.userId,
      name: m.user.name,
      prediction: visible && prediction ? { homeScore: prediction.homeScore, awayScore: prediction.awayScore } : null,
      visible,
    };
  });

  res.json(result);
});
