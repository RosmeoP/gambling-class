import type { GroupMemberDTO, MatchDTO } from "@gambling-class/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { GroupMatchHistory } from "../components/GroupMatchHistory";
import { GroupMatchPredictions } from "../components/GroupMatchPredictions";

interface GroupDetail {
  id: string;
  name: string;
  inviteCode: string;
  myRole: "admin" | "member";
  members: GroupMemberDTO[];
}

function DeleteGroupSection({ group }: { group: GroupDetail }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const deleteMutation = useMutation({
    mutationFn: () => apiFetch(`/groups/${group.id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups", "mine"] });
      navigate("/groups");
    },
  });

  if (group.myRole !== "admin") {
    return null;
  }

  if (!confirming) {
    return (
      <div className="mb-6">
        <button
          onClick={() => setConfirming(true)}
          className="text-sm font-medium text-red-500 hover:text-red-600"
        >
          Delete this group
        </button>
      </div>
    );
  }

  const canConfirm = confirmText.trim() === group.name;

  return (
    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
      <p className="mb-2 text-sm font-semibold text-red-700">Delete "{group.name}"?</p>
      <p className="mb-3 text-sm text-red-600">
        This permanently removes the group and its members for everyone. This can't be undone. Type the
        group name to confirm.
      </p>
      <input
        type="text"
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        placeholder={group.name}
        className="mb-3 w-full rounded border border-red-300 px-2 py-1 text-sm"
      />
      {deleteMutation.isError && (
        <p className="mb-2 text-sm text-red-600">Could not delete the group. Try again.</p>
      )}
      <div className="flex gap-2">
        <button
          disabled={!canConfirm || deleteMutation.isPending}
          onClick={() => deleteMutation.mutate()}
          className="rounded bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {deleteMutation.isPending ? "Deleting..." : "Delete permanently"}
        </button>
        <button
          onClick={() => {
            setConfirming(false);
            setConfirmText("");
          }}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export function Group() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState<"upcoming" | "history">("upcoming");

  const { data: group, isLoading: groupLoading } = useQuery({
    queryKey: ["group", id],
    queryFn: () => apiFetch<GroupDetail>(`/groups/${id}`),
    enabled: Boolean(id),
  });

  const { data: matches } = useQuery({
    queryKey: ["matches", "today"],
    queryFn: () => apiFetch<MatchDTO[]>("/matches/today"),
    refetchInterval: 60 * 1000,
  });

  const inviteLink = group ? `${window.location.origin}/groups/join?code=${group.inviteCode}` : "";

  if (groupLoading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (!group) return <div className="p-8 text-center text-gray-500">Group not found.</div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        to="/groups"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700"
      >
        ← Back to my groups
      </Link>

      <h1 className="mb-2 text-2xl font-bold text-gray-900">{group.name}</h1>

      <div className="liquid-glass mb-6 p-5 text-neutral-900 dark:text-white animate-liquid-entrance delay-0">
        <div className="liquid-glass-sheen" aria-hidden />
        <p className="relative mb-2 text-sm font-semibold tracking-tight text-neutral-900 dark:text-white">Invite friends</p>
        <div className="relative flex items-center gap-2">
          <input
            readOnly
            value={inviteLink}
            className="flex-1 rounded-xl border border-neutral-200 dark:border-white/10 bg-white/60 dark:bg-black/20 px-3 py-1.5 text-sm text-neutral-800 dark:text-neutral-200 outline-none"
          />
          <button
            onClick={() => navigator.clipboard.writeText(inviteLink)}
            className="rounded-xl bg-neutral-900 hover:bg-neutral-850 active:bg-neutral-950 text-white dark:bg-white dark:hover:bg-white/90 dark:active:bg-white/95 dark:text-neutral-900 px-4 py-1.5 text-sm font-semibold transition active:scale-[0.98]"
          >
            Copy
          </button>
        </div>
        <p className="relative mt-2 text-xs text-neutral-400 dark:text-white/40">Code: {group.inviteCode}</p>
      </div>

      <div className="liquid-glass mb-6 p-5 text-neutral-900 dark:text-white animate-liquid-entrance delay-1">
        <div className="liquid-glass-sheen" aria-hidden />
        <p className="relative mb-3 text-sm font-semibold tracking-tight text-neutral-900 dark:text-white">Members ({group.members.length})</p>
        <ul className="relative divide-y divide-neutral-100 dark:divide-white/5">
          {group.members.map((m) => (
            <li key={m.userId} className="flex justify-between py-2 text-sm text-neutral-700 dark:text-white/80 first:pt-0 last:pb-0">
              <span>{m.name}</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-white/40">{m.role}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-4 flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setTab("upcoming")}
          className={`px-3 py-2 text-sm font-medium ${
            tab === "upcoming"
              ? "border-b-2 border-gray-900 text-gray-900"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Today's matches
        </button>
        <button
          onClick={() => setTab("history")}
          className={`px-3 py-2 text-sm font-medium ${
            tab === "history"
              ? "border-b-2 border-gray-900 text-gray-900"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          History
        </button>
      </div>

      {tab === "upcoming" && (
        <div className="mb-6 space-y-8">
          {matches?.length === 0 && <p className="text-gray-500">No matches scheduled today.</p>}
          {matches?.map((match, idx) => (
            <div key={match.id} className={`animate-liquid-entrance delay-${Math.min(idx + 2, 9)}`}>
              {idx > 0 && <div className="h-px bg-neutral-200 dark:bg-white/10 my-8" />}
              <GroupMatchPredictions match={match} groupId={group.id} />
            </div>
          ))}
        </div>
      )}

      {tab === "history" && <div className="mb-6"><GroupMatchHistory groupId={group.id} /></div>}

      <DeleteGroupSection group={group} />
    </div>
  );
}
