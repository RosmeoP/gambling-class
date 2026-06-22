import type { MatchDTO } from "@gambling-class/shared";
import { getFlagUrl, getTeamCode } from "../lib/flags";

function TeamSide({ name, align }: { name: string; align: "left" | "right" }) {
  const flagUrl = getFlagUrl(name);
  const flag = (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10 shadow-inner ring-1 ring-white/15">
      {flagUrl ? (
        <img src={flagUrl} alt={`${name} flag`} className="h-full w-full object-cover" />
      ) : (
        <span className="text-xs font-bold text-white/40">?</span>
      )}
    </span>
  );

  const labels = (
    <div className={align === "left" ? "text-left" : "text-right"}>
      <p className="text-sm font-bold uppercase tracking-wide text-white">{getTeamCode(name)}</p>
      <p className="truncate text-xs text-white/50">{name}</p>
    </div>
  );

  return (
    <div className={`flex min-w-0 flex-1 items-center gap-3 ${align === "right" ? "flex-row-reverse" : ""}`}>
      {flag}
      {labels}
    </div>
  );
}

export function MatchCard({
  match,
  expanded,
  onToggle,
  showWeekday = false,
  showToggle = true,
}: {
  match: MatchDTO;
  expanded: boolean;
  onToggle: () => void;
  showWeekday?: boolean;
  showToggle?: boolean;
}) {
  const formattedDate = new Date(match.kickoff).toLocaleString(undefined, {
    weekday: showWeekday ? "short" : undefined,
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: showWeekday ? "short" : undefined,
  });

  const isScheduled = match.status === "scheduled";

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-900 to-black p-5 shadow-lg">
      <p className="mb-4 text-center text-sm font-medium text-white/60">
        {formattedDate}
        {match.status === "live" && (
          <span className="ml-2 inline-flex items-center gap-1 text-red-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
            LIVE
          </span>
        )}
      </p>

      <div className="flex items-center gap-3">
        <TeamSide name={match.homeTeam} align="left" />

        <div className="flex shrink-0 flex-col items-center justify-center">
          {isScheduled ? (
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white/60">
              vs
            </span>
          ) : (
            <>
              <span className="text-2xl font-extrabold text-white">
                {match.homeScore} - {match.awayScore}
              </span>
              <span className="mt-1 text-[10px] font-bold uppercase tracking-wide text-white/40">
                {match.status === "live" ? "Live" : "Final"}
              </span>
            </>
          )}
        </div>

        <TeamSide name={match.awayTeam} align="right" />
      </div>

      {showToggle && (
        <button
          onClick={onToggle}
          className="mt-5 w-full rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 px-4 py-2 text-center text-sm font-bold uppercase tracking-wide text-black transition hover:from-yellow-400 hover:to-orange-400"
        >
          {expanded ? "Hide details" : "View details"}
        </button>
      )}
    </div>
  );
}
