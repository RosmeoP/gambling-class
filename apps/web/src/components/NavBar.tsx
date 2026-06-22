import { Shirt } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_LINKS = [
  { to: "/", label: "Dashboard", colorClass: "flag-text-portugal" },
  { to: "/upcoming", label: "Upcoming", colorClass: "flag-text-germany" },
  { to: "/groups", label: "My groups", colorClass: "flag-text-netherlands" },
  { to: "/groups/new", label: "New group", colorClass: "flag-text-argentina" },
  { to: "/groups/join", label: "Join group", colorClass: "flag-text-brazil" },
];

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

  if (location.pathname === "/login" || location.pathname === "/register") {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-white/40 bg-white/60 px-6 py-3 backdrop-blur-xl backdrop-saturate-150 shadow-[0_4px_30px_rgba(0,0,0,0.06)]">
      <Link to="/" className="flag-text-france text-lg font-extrabold tracking-tight">
        World Cup Predictor
      </Link>
      {user && (
        <div className="flex items-center gap-2">
          <NavLinks pathname={location.pathname} />

          <div className="ml-2 flex items-center gap-2 rounded-full border border-white/50 bg-white/50 px-2 py-1 shadow-inner backdrop-blur-md">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 via-yellow-400 to-blue-700 text-white shadow-sm">
              <Shirt className="h-4 w-4" strokeWidth={2.5} />
            </span>
            <span className="font-semibold text-gray-700">{user.name}</span>
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
