import { Link } from "react-router-dom";
import { getUser, clearAuth } from "../auth.js";

export default function Layout({ children }) {
  const user = getUser();
  function logout() {
    clearAuth();
    window.location.replace("/login");
  }
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="inner">
          <div className="brand">Software Management CRM</div>
          <div>
            {user && (
              <span style={{ marginRight: 12 }}>
                Hi, {user.full_name || user.username}
              </span>
            )}
            <button
              onClick={logout}
              className="btn"
              style={{
                background: "transparent",
                color: "white",
                borderColor: "rgba(255,255,255,0.6)",
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="app-main">
        <div className="container">{children}</div>
      </main>
    </div>
  );
}
