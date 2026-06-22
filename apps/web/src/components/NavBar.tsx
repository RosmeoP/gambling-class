import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === "/login" || location.pathname === "/register") {
    return null;
  }

  return (
    <nav className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
      <Link to="/" className="text-lg font-bold text-emerald-700">
        World Cup Predictor
      </Link>
      {user && (
        <div className="flex items-center gap-4 text-sm">
          <Link to="/" className="text-gray-600 hover:text-emerald-700">
            Dashboard
          </Link>
          <Link to="/groups/new" className="text-gray-600 hover:text-emerald-700">
            New group
          </Link>
          <Link to="/groups/join" className="text-gray-600 hover:text-emerald-700">
            Join group
          </Link>
          <span className="text-gray-400">{user.name}</span>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="rounded bg-gray-100 px-3 py-1 text-gray-700 hover:bg-gray-200"
          >
            Log out
          </button>
        </div>
      )}
    </nav>
  );
}
