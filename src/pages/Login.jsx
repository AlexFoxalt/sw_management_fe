import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { loginRequest } from "../api.js";
import { setToken, setUser } from "../auth.js";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await loginRequest({ username, password });
      if (data?.token) {
        setToken(data.token);
        // Persist basic user metadata for role-based routing/UI
        setUser({
          username: data.username,
          user_id: data.user_id,
          role: data.role,
          full_name: data.full_name,
        });

        // Role-based default redirects
        const roleToPath = {
          admin: "/admin",
          manager: "/manager",
          supervisor: "/supervisor",
        };

        const redirect =
          searchParams.get("redirect") || roleToPath[data.role] || "/";
        navigate(redirect);
      } else {
        setError("Invalid server response");
      }
    } catch (err) {
      if (String(err?.message).toLowerCase().includes("unauthorized")) {
        setError("Invalid credentials");
      } else {
        setError("Login failed");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 420 }}>
      <div className="panel">
        <h2 style={{ marginTop: 0 }}>Software Management CRM</h2>
        <p className="muted">Sign in to continue</p>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <div style={{ color: "red", marginBottom: 12 }}>{error}</div>
          )}
          <button className="primary" type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
