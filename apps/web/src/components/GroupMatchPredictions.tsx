import type { MatchDTO, MemberPredictionDTO } from "@gambling-class/shared";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";
import { PredictionForm } from "./PredictionForm";

export function GroupMatchPredictions({ match, groupId }: { match: MatchDTO; groupId: string }) {
  const { data: predictions } = useQuery({
    queryKey: ["predictions", match.id, groupId],
    queryFn: () => apiFetch<MemberPredictionDTO[]>(`/predictions/matches/${match.id}?groupId=${groupId}`),
  });

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-medium text-gray-900">
          {match.homeTeam} vs {match.awayTeam}
        </span>
        <span className="text-xs uppercase text-gray-400">{match.status}</span>
      </div>
      <p className="mb-3 text-sm text-gray-500">{new Date(match.kickoff).toLocaleString()}</p>

      <div className="mb-3">
        <PredictionForm match={match} />
      </div>

      <ul className="space-y-1">
        {predictions?.map((p) => (
          <li key={p.userId} className="flex justify-between text-sm">
            <span className="text-gray-700">{p.name}</span>
            <span className={p.prediction ? "font-medium text-gray-900" : "text-gray-400"}>
              {p.prediction
                ? `${p.prediction.homeScore} - ${p.prediction.awayScore}`
                : p.visible
                  ? "No prediction yet"
                  : "Predict yours to reveal"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
