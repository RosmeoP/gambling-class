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
    <div className="liquid-glass overflow-hidden shadow-xl">
      <div className="liquid-glass-sheen" aria-hidden />

      {/* 1. Match card info section (embedded flat) */}
      <div className="p-5 pb-4">
        <MatchCard match={match} expanded={false} onToggle={() => {}} showToggle={false} flat />
      </div>

      <div className="h-px bg-neutral-200/40 dark:bg-white/5 mx-5" />

      {/* 2. Prediction form input section (embedded flat) */}
      <div className="p-5 py-4">
        <PredictionForm match={match} flat />
      </div>

      <div className="h-px bg-neutral-200/40 dark:bg-white/5 mx-5" />

      {/* 3. Group predictions list section */}
      <div className="p-5 pt-4">
        <p className="relative mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-white/55">
          Group predictions
        </p>
        <ul className="relative divide-y divide-neutral-100 dark:divide-white/5">
          {predictions?.map((p) => (
            <li key={p.userId} className="flex justify-between py-2.5 text-sm first:pt-0 last:pb-0">
              <span className="text-neutral-700 dark:text-white/80">{p.name}</span>
              <span className={p.prediction ? "font-semibold text-neutral-900 dark:text-white" : "text-neutral-400 dark:text-white/40"}>
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
