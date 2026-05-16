import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState } from "react";
import { flushQueue, getQueue } from "../services/api";

export default function Layout() {
  const { user, logout } = useAuth();
  const [offline, setOffline] = useState(!navigator.onLine);
  const [pendingCount, setPendingCount] = useState(getQueue().length);

  useEffect(() => {
    const onOnline = async () => {
      setOffline(false);
      await flushQueue();
      setPendingCount(getQueue().length);
    };
    const onOffline = () => setOffline(true);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => { window.removeEventListener("online", onOnline); window.removeEventListener("offline", onOffline); };
  }, []);

  return (
    <>
      {offline && (
        <div className="offline-banner">
          ⚠️ Offline – zmiany zostaną zsynchronizowane po powrocie do sieci
          {pendingCount > 0 && ` (${pendingCount} oczekujących)`}
        </div>
      )}
      <div className="layout" style={{ paddingTop: offline ? 32 : 0 }}>
        <nav className="sidebar">
          <div className="logo">Budget<span>App</span></div>
          <NavLink to="/" end className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
            <span className="icon">📊</span> Dashboard
          </NavLink>
          <NavLink to="/transactions" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
            <span className="icon">💸</span> Transakcje
          </NavLink>
          <NavLink to="/categories" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
            <span className="icon">🏷️</span> Kategorie
          </NavLink>
          <div className="sidebar-footer">
            <div className="text-muted" style={{ padding: "0 8px 8px", fontSize: 13 }}>
              👤 {user?.username}
            </div>
            <button className="btn btn-ghost w-full" onClick={logout}>Wyloguj</button>
          </div>
        </nav>
        <main className="main">
          <Outlet />
        </main>
      </div>
    </>
  );
}
