import type { GroupMemberDTO, MatchDTO } from "@gambling-class/shared";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { GroupMatchPredictions } from "../components/GroupMatchPredictions";

interface GroupDetail {
  id: string;
  name: string;
  inviteCode: string;
  members: GroupMemberDTO[];
}

export function Group() {
  const { id } = useParams<{ id: string }>();

  const { data: group, isLoading: groupLoading } = useQuery({
    queryKey: ["group", id],
    queryFn: () => apiFetch<GroupDetail>(`/groups/${id}`),
    enabled: Boolean(id),
  });

  const { data: matches } = useQuery({
    queryKey: ["matches", "today"],
    queryFn: () => apiFetch<MatchDTO[]>("/matches/today"),
  });

  const inviteLink = group ? `${window.location.origin}/groups/join?code=${group.inviteCode}` : "";

  if (groupLoading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (!group) return <div className="p-8 text-center text-gray-500">Group not found.</div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">{group.name}</h1>

      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <p className="mb-2 text-sm font-medium text-gray-700">Invite friends</p>
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={inviteLink}
            className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm text-gray-600"
          />
          <button
            onClick={() => navigator.clipboard.writeText(inviteLink)}
            className="rounded bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
          >
            Copy
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-400">Code: {group.inviteCode}</p>
      </div>

      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <p className="mb-2 text-sm font-medium text-gray-700">Members ({group.members.length})</p>
        <ul className="space-y-1">
          {group.members.map((m) => (
            <li key={m.userId} className="flex justify-between text-sm text-gray-600">
              <span>{m.name}</span>
              <span className="text-xs uppercase text-gray-400">{m.role}</span>
            </li>
          ))}
        </ul>
      </div>

      <h2 className="mb-3 text-lg font-semibold text-gray-900">Today's matches</h2>
      <div className="space-y-4">
        {matches?.length === 0 && <p className="text-gray-500">No matches scheduled today.</p>}
        {matches?.map((match) => <GroupMatchPredictions key={match.id} match={match} groupId={group.id} />)}
      </div>
    </div>
  );
}
