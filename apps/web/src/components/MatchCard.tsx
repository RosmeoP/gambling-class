import type { MatchDTO } from "@gambling-class/shared";
import { getFlagUrl, getTeamCode } from "../lib/flags";

function TeamSide({ name, align }: { name: string; align: "left" | "right" }) {
  const flagUrl = getFlagUrl(name);
  const flag = (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-black/5 dark:bg-white/5 shadow-inner ring-1 ring-black/10 dark:ring-white/10">
      {flagUrl ? (
        <img src={flagUrl} alt={`${name} flag`} className="h-full w-full object-cover" />
      ) : (
        <span className="text-xs font-bold text-neutral-400 dark:text-white/40">?</span>
      )}
    </span>
  );

  const labels = (
    <div className={`max-w-[7rem] ${align === "left" ? "text-left" : "text-right"}`}>
      <p className="text-sm font-semibold uppercase tracking-wide text-neutral-900 dark:text-white">{getTeamCode(name)}</p>
      <p className="truncate text-xs text-neutral-500 dark:text-white/50">{name}</p>
    </div>
  );

  return (
    <div className={`flex items-center gap-3 ${align === "right" ? "flex-row-reverse" : ""}`}>
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
  flat = false,
}: {
  match: MatchDTO;
  expanded: boolean;
  onToggle: () => void;
  showWeekday?: boolean;
  showToggle?: boolean;
  flat?: boolean;
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

  const content = (
    <>
      <p className="relative mb-4 text-center text-xs font-semibold tracking-wide text-neutral-500 dark:text-white/70">
        {formattedDate}
        {match.status === "live" && (
          <span className="ml-2 inline-flex items-center gap-1 text-red-500 dark:text-red-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500 dark:bg-red-400" />
            LIVE
          </span>
        )}
      </p>

      <div className="relative flex items-center justify-center gap-4 sm:gap-6">
        <TeamSide name={match.homeTeam} align="left" />

        <div className="flex shrink-0 flex-col items-center justify-center">
          {isScheduled ? (
            <span className="rounded-full border border-neutral-200/60 dark:border-white/10 bg-black/5 dark:bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-white/55">
              vs
            </span>
          ) : (
            <>
              <span className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                {match.homeScore} - {match.awayScore}
              </span>
              <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-white/40">
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
          className="relative mt-5 w-full rounded-xl bg-black/5 hover:bg-black/10 active:bg-black/15 border border-neutral-200/80 text-neutral-800 dark:bg-white/10 dark:hover:bg-white/15 dark:active:bg-white/20 dark:border-white/10 dark:text-white px-4 py-2.5 text-center text-sm font-semibold tracking-tight transition-all duration-200 shadow-sm active:scale-[0.99]"
        >
          {expanded ? "Hide details" : "View details"}
        </button>
      )}
    </>
  );

  if (flat) {
    return <div className="relative w-full">{content}</div>;
  }

  return (
    <div className="liquid-glass overflow-hidden p-5">
      <div className="liquid-glass-sheen" aria-hidden />
      {content}
    </div>
  );
}
