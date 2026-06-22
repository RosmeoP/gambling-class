import cors from "cors";
import "dotenv/config";
import express from "express";
import { syncMatches } from "./lib/syncMatches.js";
import { authRouter } from "./routes/auth.js";
import { groupsRouter } from "./routes/groups.js";
import { matchesRouter } from "./routes/matches.js";
import { predictionsRouter } from "./routes/predictions.js";

const SYNC_INTERVAL_MS = 15 * 60 * 1000;

function scheduleMatchSync() {
  if (!process.env.FOOTBALL_DATA_API_KEY) {
    console.log("FOOTBALL_DATA_API_KEY not set — skipping scheduled match sync");
    return;
  }

  const runSync = () => {
    syncMatches()
      .then((count) => console.log(`[sync] updated ${count} matches`))
      .catch((err) => console.error("[sync] failed:", err instanceof Error ? err.message : err));
  };

  runSync();
  setInterval(runSync, SYNC_INTERVAL_MS);
}

const app = express();

app.use(cors({ origin: process.env.WEB_ORIGIN ?? "http://localhost:5173" }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRouter);
app.use("/groups", groupsRouter);
app.use("/matches", matchesRouter);
app.use("/predictions", predictionsRouter);

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
  scheduleMatchSync();
});
