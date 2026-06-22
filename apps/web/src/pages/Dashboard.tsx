import type { MatchDTO } from "@gambling-class/shared";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";
import { PredictionForm } from "../components/PredictionForm";

export function Dashboard() {
  const { data: matches, isLoading } = useQuery({
    queryKey: ["matches", "today"],
    queryFn: () => apiFetch<MatchDTO[]>("/matches/today"),
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Today's matches</h1>
      {isLoading && <p className="text-gray-500">Loading...</p>}
      {!isLoading && matches?.length === 0 && (
        <p className="text-gray-500">No matches scheduled today.</p>
      )}
      <div className="space-y-4">
        {matches?.map((match) => (
          <div key={match.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-medium text-gray-900">
                {match.homeTeam} vs {match.awayTeam}
              </span>
              <span className="text-xs uppercase text-gray-400">{match.status}</span>
            </div>
            <p className="mb-3 text-sm text-gray-500">
              {new Date(match.kickoff).toLocaleString()}
              {match.status === "finished" && (
                <span className="ml-2 font-semibold text-gray-700">
                  Final: {match.homeScore} - {match.awayScore}
                </span>
              )}
            </p>
            <PredictionForm match={match} />
          </div>
        ))}
      </div>
    </div>
  );
}
