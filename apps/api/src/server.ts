import cors from "cors";
import "dotenv/config";
import express from "express";
import { authRouter } from "./routes/auth.js";
import { groupsRouter } from "./routes/groups.js";
import { matchesRouter } from "./routes/matches.js";
import { predictionsRouter } from "./routes/predictions.js";

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
});
