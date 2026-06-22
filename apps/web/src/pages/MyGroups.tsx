import type { GroupDTO } from "@gambling-class/shared";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api";

export function MyGroups() {
  const { data: groups, isLoading } = useQuery({
    queryKey: ["groups", "mine"],
    queryFn: () => apiFetch<GroupDTO[]>("/groups/mine"),
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My groups</h1>
        <div className="flex gap-2">
          <Link
            to="/groups/new"
            className="rounded-full bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
          >
            New group
          </Link>
          <Link
            to="/groups/join"
            className="rounded-full border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Join group
          </Link>
        </div>
      </div>

      {isLoading && <p className="text-gray-500">Loading...</p>}
      {!isLoading && groups?.length === 0 && (
        <p className="text-gray-500">You're not in any groups yet. Create one or join with an invite code.</p>
      )}

      <div className="space-y-4">
        {groups?.map((group) => (
          <Link
            key={group.id}
            to={`/groups/${group.id}`}
            className="liquid-glass overflow-hidden flex items-center justify-between p-5 text-neutral-900 dark:text-white"
          >
            <div className="liquid-glass-sheen" aria-hidden />
            <div className="relative z-10">
              <p className="font-semibold text-neutral-900 dark:text-white">{group.name}</p>
              <p className="text-sm text-neutral-500 dark:text-white/50">
                {group.memberCount} member{group.memberCount === 1 ? "" : "s"}
              </p>
            </div>
            <span className="relative z-10 text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-white/40">
              {group.myRole}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
