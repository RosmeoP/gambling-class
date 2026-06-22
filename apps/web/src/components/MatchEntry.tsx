import type { MatchDTO } from "@gambling-class/shared";
import { useState } from "react";
import { MatchCard } from "./MatchCard";
import { PredictionForm } from "./PredictionForm";

export function MatchEntry({
  match,
  showWeekday,
  readOnly = false,
  expanded: controlledExpanded,
  onToggle: controlledOnToggle,
}: {
  match: MatchDTO;
  showWeekday?: boolean;
  readOnly?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
}) {
  const kickoffPassed = new Date(match.kickoff) <= new Date();
  const [internalExpanded, setInternalExpanded] = useState(false);

  if (readOnly) {
    return (
      <MatchCard
        match={match}
        expanded={false}
        onToggle={() => {}}
        showWeekday={showWeekday}
        showToggle={false}
      />
    );
  }

  const expanded = controlledExpanded ?? internalExpanded;
  const onToggle = controlledOnToggle ?? (() => setInternalExpanded((e) => !e));

  return (
    <div className="space-y-3">
      <MatchCard match={match} expanded={expanded} onToggle={onToggle} showWeekday={showWeekday} />
      {expanded && <PredictionForm match={match} />}
    </div>
  );
}
