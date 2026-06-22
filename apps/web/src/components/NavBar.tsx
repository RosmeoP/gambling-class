import { Shirt } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";
import { getFlagUrl } from "../lib/flags";

const NAV_LINKS = [
  { to: "/", label: "Dashboard", colorClass: "flag-text-portugal" },
  { to: "/upcoming", label: "Upcoming", colorClass: "flag-text-germany" },
  { to: "/groups/new", label: "New group", colorClass: "flag-text-argentina" },
  { to: "/groups/join", label: "Join group", colorClass: "flag-text-brazil" },
];

const TEAM_COLOR_CLASS: Record<string, string> = {
  brazil: "flag-text-brazil",
  portugal: "flag-text-portugal",
  argentina: "flag-text-argentina",
  france: "flag-text-france",
  germany: "flag-text-germany",
  netherlands: "flag-text-netherlands",
};

function getTeamColorClass(team: string | null): string {
  if (!team) return "flag-text-default";
  return TEAM_COLOR_CLASS[team.toLowerCase()] ?? "flag-text-default";
}

const FLAG_STORAGE_KEY = "gc_flag";

type IndicatorRect = { left: number; top: number; width: number; height: number };

function NavLinks({ pathname }: { pathname: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const [rect, setRect] = useState<IndicatorRect | null>(null);
  const [morphing, setMorphing] = useState(false);
  const prevPathRef = useRef(pathname);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const activeLink = linkRefs.current.get(pathname);
    if (container && activeLink) {
      const containerRect = container.getBoundingClientRect();
      const linkRect = activeLink.getBoundingClientRect();
      setRect({
        left: linkRect.left - containerRect.left,
        top: linkRect.top - containerRect.top,
        width: linkRect.width,
        height: linkRect.height,
      });
    }
  }, [pathname]);

  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      setMorphing(true);
      const timeout = setTimeout(() => setMorphing(false), 500);
      return () => clearTimeout(timeout);
    }
  }, [pathname]);

  return (
    <div ref={containerRef} className="relative flex items-center gap-1 text-sm">
      {rect && (
        <span
          aria-hidden
          className={`absolute z-0 border border-gray-200 bg-white shadow-sm transition-all duration-500 ease-[cubic-bezier(0.65,0,0.35,1.5)] ${
            morphing ? "liquid-indicator-morph" : "rounded-full"
          }`}
          style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }}
        />
      )}
      {NAV_LINKS.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          ref={(el) => {
            if (el) linkRefs.current.set(link.to, el);
          }}
          className={`${link.colorClass} relative z-10 rounded-full px-3 py-1.5 font-semibold`}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}

export function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: teams } = useQuery({
    queryKey: ["matches", "teams"],
    queryFn: () => apiFetch<string[]>("/matches/teams"),
  });

  const [selectedTeam, setSelectedTeam] = useState<string>(
    () => localStorage.getItem(FLAG_STORAGE_KEY) ?? "",
  );

  useEffect(() => {
    if (!teams || teams.length === 0) return;
    if (!selectedTeam || !teams.includes(selectedTeam)) {
      setSelectedTeam(teams[0]);
    }
  }, [teams, selectedTeam]);

  useEffect(() => {
    if (selectedTeam) {
      localStorage.setItem(FLAG_STORAGE_KEY, selectedTeam);
    }
  }, [selectedTeam]);

  if (location.pathname === "/login" || location.pathname === "/register") {
    return null;
  }

  const flagUrl = getFlagUrl(selectedTeam);

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-white/40 bg-white/60 px-6 py-3 backdrop-blur-xl backdrop-saturate-150 shadow-[0_4px_30px_rgba(0,0,0,0.06)]">
      <Link to="/" className="flag-text-france text-lg font-extrabold tracking-tight">
        World Cup Predictor
      </Link>
      {user && (
        <div className="flex items-center gap-2">
          <NavLinks pathname={location.pathname} />

          <div className="ml-2 flex items-center gap-2 rounded-full border border-white/50 bg-white/50 px-2 py-1 shadow-inner backdrop-blur-md">
            <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-white text-gray-400 shadow-sm">
              {flagUrl ? (
                <img src={flagUrl} alt={`${selectedTeam} flag`} className="h-full w-full object-cover" />
              ) : (
                <Shirt className="h-4 w-4" strokeWidth={2.5} />
              )}
            </span>
            <span className={`font-semibold ${getTeamColorClass(selectedTeam)}`}>{user.name}</span>
            {teams && teams.length > 0 && (
              <select
                value={selectedTeam}
                onChange={(event) => setSelectedTeam(event.target.value)}
                aria-label="Choose your team"
                className="rounded-full border border-gray-200 bg-white/70 px-2 py-1 text-xs text-gray-600 outline-none"
              >
                {teams.map((team) => (
                  <option key={team} value={team}>
                    {team}
                  </option>
                ))}
              </select>
            )}
          </div>

          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="rounded-full bg-red-300 px-3 py-1.5 text-white transition hover:bg-red-600"
          >
            Log out
          </button>
        </div>
      )}
    </nav>
  );
}
