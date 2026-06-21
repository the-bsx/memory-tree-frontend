import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navLink = (to, label) => (
    <Link
      to={to}
      className={`text-sm font-medium transition-colors ${
        location.pathname.startsWith(to)
          ? "text-bark"
          : "text-bark-light/60 hover:text-bark"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen bg-parchment-light bg-paper-grain">
      <header className="border-b border-parchment-dark bg-white/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-bark">
                <path
                  d="M12 2C12 2 7 6 7 11C7 14.3137 9.23858 17 12 17C14.7614 17 17 14.3137 17 11C17 6 12 2 12 2Z"
                  stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"
                />
                <path d="M12 17V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M9 20H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span className="font-serif text-lg text-bark">MemoryTree</span>
            </Link>
            <nav className="hidden sm:flex items-center gap-6">
              {navLink("/dashboard", "Dashboard")}
              {navLink("/events", "Events")}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-bark-light/70 hidden sm:inline">
              {user?.name?.split(" ")[0]}
            </span>
            <button onClick={logout} className="btn-secondary text-sm py-2">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">{children}</main>
    </div>
  );
}
