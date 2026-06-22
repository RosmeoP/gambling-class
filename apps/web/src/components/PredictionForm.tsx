import type { MatchDTO } from "@gambling-class/shared";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";

export function PredictionForm({ match }: { match: MatchDTO }) {
  const queryClient = useQueryClient();
  const kickoffPassed = new Date(match.kickoff) <= new Date();
  const [homeScore, setHomeScore] = useState(match.myPrediction?.homeScore ?? 0);
  const [awayScore, setAwayScore] = useState(match.myPrediction?.awayScore ?? 0);

  const mutation = useMutation({
    mutationFn: () =>
      apiFetch("/predictions", {
        method: "POST",
        body: JSON.stringify({ matchId: match.id, homeScore, awayScore }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });

  if (kickoffPassed) {
    return (
      <div className="liquid-glass rounded-2xl p-5 text-white shadow-xl">
        <div className="liquid-glass-sheen" aria-hidden />
        <h3 className="relative text-lg font-bold">Your prediction</h3>
        <p className="relative mt-2 text-sm text-white/80">
          {match.myPrediction
            ? `You predicted ${match.myPrediction.homeScore} - ${match.myPrediction.awayScore}`
            : "You didn't submit a prediction for this match."}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
      className="liquid-glass rounded-2xl p-5 text-white shadow-xl"
    >
      <div className="liquid-glass-sheen" aria-hidden />
      <h3 className="relative text-lg font-bold">Predict the score</h3>

      <div className="relative mt-5 flex items-center justify-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-white/60">
            {match.homeTeam}
          </span>
          <input
            type="number"
            min={0}
            max={50}
            value={homeScore}
            onChange={(e) => setHomeScore(Number(e.target.value))}
            className="w-16 rounded-lg border border-white/25 bg-white/15 py-2 text-center text-2xl font-bold text-white outline-none focus:border-orange-400"
          />
        </div>
        <span className="text-xl font-bold text-white/50">-</span>
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-white/60">
            {match.awayTeam}
          </span>
          <input
            type="number"
            min={0}
            max={50}
            value={awayScore}
            onChange={(e) => setAwayScore(Number(e.target.value))}
            className="w-16 rounded-lg border border-white/25 bg-white/15 py-2 text-center text-2xl font-bold text-white outline-none focus:border-orange-400"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={mutation.isPending}
        className="relative mt-5 w-full rounded-full bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-500 py-2 text-sm font-bold uppercase tracking-wide text-black transition hover:opacity-90 disabled:opacity-50"
      >
        {match.myPrediction ? "Update prediction" : "Submit prediction"}
      </button>
    </form>
  );
}
