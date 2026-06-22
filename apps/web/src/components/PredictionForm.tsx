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
      <p className="text-sm text-gray-500">
        {match.myPrediction
          ? `Your pick: ${match.myPrediction.homeScore} - ${match.myPrediction.awayScore}`
          : "You didn't submit a prediction"}
      </p>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
      className="flex items-center gap-2"
    >
      <input
        type="number"
        min={0}
        max={50}
        value={homeScore}
        onChange={(e) => setHomeScore(Number(e.target.value))}
        className="w-14 rounded border border-gray-300 px-2 py-1 text-center text-sm"
      />
      <span className="text-gray-400">-</span>
      <input
        type="number"
        min={0}
        max={50}
        value={awayScore}
        onChange={(e) => setAwayScore(Number(e.target.value))}
        className="w-14 rounded border border-gray-300 px-2 py-1 text-center text-sm"
      />
      <button
        type="submit"
        disabled={mutation.isPending}
        className="rounded bg-emerald-600 px-3 py-1 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        {match.myPrediction ? "Update" : "Predict"}
      </button>
    </form>
  );
}
