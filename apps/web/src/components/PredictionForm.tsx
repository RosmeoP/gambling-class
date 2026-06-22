import type { MatchDTO } from "@gambling-class/shared";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";
import { useNotifications } from "../context/NotificationContext";

export function PredictionForm({ match, flat = false }: { match: MatchDTO; flat?: boolean }) {
  const queryClient = useQueryClient();
  const notifications = useNotifications();
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
      notifications.success(match.myPrediction ? "Prediction updated!" : "Prediction submitted!");
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
    onError: (err: any) => {
      let errMsg = "Failed to submit prediction. Please try again.";
      if (err instanceof Error) {
        try {
          const parsed = JSON.parse(err.message);
          errMsg = typeof parsed === "string" ? parsed : (parsed.error || errMsg);
        } catch {
          errMsg = err.message;
        }
      }
      notifications.error(errMsg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Kickoff passed check
    if (new Date(match.kickoff) <= new Date()) {
      notifications.error("This match has already started. Predictions are locked.");
      return;
    }

    // 2. Score validation
    const homeVal = Number(homeScore);
    const awayVal = Number(awayScore);
    if (
      isNaN(homeVal) ||
      isNaN(awayVal) ||
      homeVal < 0 ||
      awayVal < 0 ||
      homeVal > 50 ||
      awayVal > 50 ||
      !Number.isInteger(homeVal) ||
      !Number.isInteger(awayVal)
    ) {
      notifications.error("Scores must be integers between 0 and 50.");
      return;
    }

    mutation.mutate();
  };

  if (kickoffPassed) {
    const passedContent = (
      <>
        <h3 className="relative text-base font-semibold tracking-tight text-neutral-900 dark:text-white">Your prediction</h3>
        <p className="relative mt-2 text-sm text-neutral-600 dark:text-white/80">
          {match.myPrediction
            ? `You predicted ${match.myPrediction.homeScore} - ${match.myPrediction.awayScore}`
            : "You didn't submit a prediction for this match."}
        </p>
      </>
    );

    if (flat) {
      return <div className="relative w-full">{passedContent}</div>;
    }

    return (
      <div className="liquid-glass p-5 text-neutral-900 dark:text-white">
        <div className="liquid-glass-sheen" aria-hidden />
        {passedContent}
      </div>
    );
  }

  const formContent = (
    <>
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
    </>
  );

  if (flat) {
    return (
      <form
        onSubmit={handleSubmit}
        noValidate
        className="relative w-full text-neutral-900 dark:text-white"
      >
        {formContent}
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="liquid-glass p-5 text-neutral-900 dark:text-white"
    >
      <div className="liquid-glass-sheen" aria-hidden />
      {formContent}
    </form>
  );
}
