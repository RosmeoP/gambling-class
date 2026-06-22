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
      <div className="liquid-glass p-5 text-neutral-900 dark:text-white shadow-xl">
        <div className="liquid-glass-sheen" aria-hidden />
        <h3 className="relative text-base font-semibold tracking-tight text-neutral-900 dark:text-white">Your prediction</h3>
        <p className="relative mt-2 text-sm text-neutral-600 dark:text-white/80">
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
      className="liquid-glass p-5 text-neutral-900 dark:text-white shadow-xl"
    >
      <div className="liquid-glass-sheen" aria-hidden />
      <h3 className="relative text-base font-semibold tracking-tight text-neutral-900 dark:text-white">Predict the score</h3>

      <div className="relative mt-5 flex items-center justify-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-white/55">
            {match.homeTeam}
          </span>
          <input
            type="number"
            min={0}
            max={50}
            value={homeScore}
            onChange={(e) => setHomeScore(Number(e.target.value))}
            className="w-16 rounded-xl border border-neutral-200 dark:border-white/10 bg-white/60 dark:bg-black/20 py-2.5 text-center text-2xl font-bold text-neutral-900 dark:text-white outline-none transition-all duration-200 focus:border-neutral-400 dark:focus:border-white/30 focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10"
          />
        </div>
        <span className="text-xl font-bold text-neutral-400 dark:text-white/40">-</span>
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-white/55">
            {match.awayTeam}
          </span>
          <input
            type="number"
            min={0}
            max={50}
            value={awayScore}
            onChange={(e) => setAwayScore(Number(e.target.value))}
            className="w-16 rounded-xl border border-neutral-200 dark:border-white/10 bg-white/60 dark:bg-black/20 py-2.5 text-center text-2xl font-bold text-neutral-900 dark:text-white outline-none transition-all duration-200 focus:border-neutral-400 dark:focus:border-white/30 focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={mutation.isPending}
        className="relative mt-5 w-full rounded-xl bg-neutral-900 hover:bg-neutral-850 active:bg-neutral-950 text-white dark:bg-white dark:hover:bg-white/90 dark:active:bg-white/95 dark:text-neutral-900 py-2.5 text-sm font-semibold tracking-tight transition-all duration-200 shadow-md disabled:bg-neutral-200 disabled:text-neutral-400 dark:disabled:bg-white/30 dark:disabled:text-neutral-500 disabled:cursor-not-allowed active:scale-[0.99]"
      >
        {match.myPrediction ? "Update prediction" : "Submit prediction"}
      </button>
    </form>
  );
}
