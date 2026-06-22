import type { MatchDTO, MemberPredictionDTO } from "@gambling-class/shared";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";
import { MatchCard } from "./MatchCard";
import { PredictionForm } from "./PredictionForm";

export function GroupMatchPredictions({ match, groupId }: { match: MatchDTO; groupId: string }) {
  const { data: predictions } = useQuery({
    queryKey: ["predictions", match.id, groupId],
    queryFn: () => apiFetch<MemberPredictionDTO[]>(`/predictions/matches/${match.id}?groupId=${groupId}`),
    refetchInterval: 60 * 1000,
  });

  return (
    <div className="space-y-3">
      <MatchCard match={match} expanded={false} onToggle={() => {}} showToggle={false} />

      <PredictionForm match={match} />

      <div className="liquid-glass rounded-2xl p-4 shadow-xl">
        <div className="liquid-glass-sheen" aria-hidden />
        <p className="relative mb-2 text-xs font-bold uppercase tracking-wide text-white/60">
          Group predictions
        </p>
        <ul className="relative space-y-1.5">
          {predictions?.map((p) => (
            <li key={p.userId} className="flex justify-between text-sm">
              <span className="text-white/80">{p.name}</span>
              <span className={p.prediction ? "font-semibold text-white" : "text-white/40"}>
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
    </div>
  );
}
