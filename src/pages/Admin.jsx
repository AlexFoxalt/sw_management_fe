import { useEffect, useMemo, useState } from "react";
import { getUser } from "../auth.js";
import {
  fetchAuditLogs,
  createSoftwareType,
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../api.js";
import { formatDateTime } from "../utils/format.js";
import { SideMenu } from "../components";

const MODULES = [
  { key: "audit", label: "Audit Logs" },
  { key: "create_software", label: "Create software" },
  { key: "users", label: "Users" },
];

function Menu({ activeKey, onSelect }) {
  return <SideMenu items={MODULES} activeKey={activeKey} onSelect={onSelect} />;
}

function AuditLogsPanel() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchAuditLogs({ limit: 50 });
        if (!cancelled) setLogs(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setError("Failed to load audit logs");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <h3>Audit Logs</h3>
      {loading && <div>Loading…</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
      {!loading && !error && (
        <div style={{ marginTop: 8 }}>
          {logs.length === 0 ? (
            <div>No logs</div>
          ) : (
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
              <thead>
                <tr>
                  <th
                    style={{
                      borderBottom: "1px solid #ddd",
                      textAlign: "left",
                      padding: 6,
                    }}
                  >
                    Time
                  </th>
                  <th
                    style={{
                      borderBottom: "1px solid #ddd",
                      textAlign: "left",
                      padding: 6,
                    }}
                  >
                    User
                  </th>
                  <th
                    style={{
                      borderBottom: "1px solid #ddd",
                      textAlign: "left",
                      padding: 6,
                    }}
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.log_id}>
                    <td style={{ borderBottom: "1px solid #eee", padding: 6 }}>
                      {formatDateTime(log.action_time)}
                    </td>
                    <td style={{ borderBottom: "1px solid #eee", padding: 6 }}>
                      {log.username}
                    </td>
                    <td style={{ borderBottom: "1px solid #eee", padding: 6 }}>
                      {log.action}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

function CreateSoftwareStub() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function onCreate(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    setLoading(true);
    try {
      const result = await createSoftwareType(name.trim());
      setSuccess(`New software added: ${result?.name || name.trim()}`);
      setName("");
      setTimeout(() => setSuccess(""), 3500);
    } catch (err) {
      setError("Failed to create software");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h3>Create software</h3>
      <form
        onSubmit={onCreate}
        style={{ display: "flex", alignItems: "center", gap: 8 }}
      >
        <input
          type="text"
          placeholder="Software name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: 8, minWidth: 240 }}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Creating…" : "Create"}
        </button>
      </form>
      {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
      {success && (
        <div
          role="alert"
          style={{
            marginTop: 8,
            background: "#e6ffed",
            border: "1px solid #b7eb8f",
            padding: "8px 10px",
            borderRadius: 4,
          }}
        >
          {success}
        </div>
      )}
    </div>
  );
}

function UsersStub() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [cUsername, setCUsername] = useState("");
  const [cPassword, setCPassword] = useState("");
  const [cFullName, setCFullName] = useState("");
  const [cRole, setCRole] = useState("manager");
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [eUsername, setEUsername] = useState("");
  const [eFullName, setEFullName] = useState("");
  const [eRole, setERole] = useState("manager");
  const [saving, setSaving] = useState(false);
  const [busyDeleteId, setBusyDeleteId] = useState(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await fetchUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e) {
    e.preventDefault();
    if (!cUsername.trim() || !cPassword.trim() || !cFullName.trim()) return;
    setCreating(true);
    try {
      await createUser({
        username: cUsername.trim(),
        password: cPassword.trim(),
        role: cRole,
        full_name: cFullName.trim(),
      });
      setCUsername("");
      setCPassword("");
      setCFullName("");
      setCRole("manager");
      await load();
    } catch (err) {
      alert("Failed to create user");
    } finally {
      setCreating(false);
    }
  }

  function beginEdit(u) {
    setEditingId(u.user_id);
    setEUsername(u.username);
    setEFullName(u.full_name);
    setERole(u.role);
  }

  function cancelEdit() {
    setEditingId(null);
    setEUsername("");
    setEFullName("");
    setERole("manager");
  }

  async function saveEdit(u) {
    setSaving(true);
    try {
      await updateUser({
        user_id: u.user_id,
        username: eUsername.trim(),
        role: eRole,
        full_name: eFullName.trim(),
      });
      cancelEdit();
      await load();
    } catch (err) {
      alert("Failed to update user");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(u) {
    if (u.you) return;
    if (!confirm(`Delete user ${u.username}?`)) return;
    setBusyDeleteId(u.user_id);
    try {
      await deleteUser(u.user_id);
      await load();
    } catch (err) {
      alert("Failed to delete user");
    } finally {
      setBusyDeleteId(null);
    }
  }

  return (
    <div>
      <h3>Users</h3>
      <form
        onSubmit={onCreate}
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <input
          placeholder="Username"
          value={cUsername}
          onChange={(e) => setCUsername(e.target.value)}
          style={{ padding: 8 }}
        />
        <input
          placeholder="Password"
          type="password"
          value={cPassword}
          onChange={(e) => setCPassword(e.target.value)}
          style={{ padding: 8 }}
        />
        <input
          placeholder="Full name"
          value={cFullName}
          onChange={(e) => setCFullName(e.target.value)}
          style={{ padding: 8 }}
        />
        <select
          value={cRole}
          onChange={(e) => setCRole(e.target.value)}
          style={{ padding: 8 }}
        >
          <option value="admin">admin</option>
          <option value="manager">manager</option>
          <option value="supervisor">supervisor</option>
        </select>
        <button
          type="submit"
          disabled={creating}
          style={{
            background: "#e6ffed",
            border: "1px solid #b7eb8f",
            padding: "8px 12px",
          }}
        >
          {creating ? "Creating…" : "Create user"}
        </button>
      </form>

      {loading && <div>Loading…</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
      {!loading && !error && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 12,
          }}
        >
          {users.map((u) => (
            <div
              key={u.user_id}
              style={{ border: "1px solid #ddd", borderRadius: 6, padding: 12 }}
            >
              {editingId === u.user_id ? (
                <div>
                  <div style={{ marginBottom: 8 }}>
                    <label>Username</label>
                    <input
                      value={eUsername}
                      onChange={(e) => setEUsername(e.target.value)}
                      style={{ width: "100%", padding: 6 }}
                    />
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <label>Full name</label>
                    <input
                      value={eFullName}
                      onChange={(e) => setEFullName(e.target.value)}
                      style={{ width: "100%", padding: 6 }}
                    />
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <label>Role</label>
                    <select
                      value={eRole}
                      onChange={(e) => setERole(e.target.value)}
                      style={{ width: "100%", padding: 6 }}
                    >
                      <option value="admin">admin</option>
                      <option value="manager">manager</option>
                      <option value="supervisor">supervisor</option>
                    </select>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => saveEdit(u)}
                      disabled={saving}
                      style={{
                        background: "#e6ffed",
                        border: "1px solid #b7eb8f",
                        padding: "6px 10px",
                      }}
                    >
                      {saving ? "Saving…" : "Save"}
                    </button>
                    <button
                      onClick={cancelEdit}
                      style={{ padding: "6px 10px" }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontWeight: 600 }}>{u.username}</div>
                  <div style={{ color: "#666", marginBottom: 8 }}>
                    {u.full_name}
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <span
                      style={{
                        border: "1px solid #ddd",
                        padding: "2px 6px",
                        borderRadius: 4,
                      }}
                    >
                      {u.role}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      title="Edit"
                      onClick={() => beginEdit(u)}
                      style={{
                        background: "#fffbe6",
                        border: "1px solid #ffe58f",
                        padding: "6px 10px",
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      title={u.you ? "You cannot delete yourself" : "Delete"}
                      onClick={() => onDelete(u)}
                      disabled={u.you || busyDeleteId === u.user_id}
                      style={{
                        background: "#fff1f0",
                        border: "1px solid #ffa39e",
                        padding: "6px 10px",
                        opacity: u.you ? 0.6 : 1,
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  const user = getUser();
  const name = user?.username || "user";
  const role = user?.role || "admin";
  const [activeKey, setActiveKey] = useState("audit");

  const Content = useMemo(() => {
    if (activeKey === "audit") return <AuditLogsPanel />;
    if (activeKey === "create_software") return <CreateSoftwareStub />;
    if (activeKey === "users") return <UsersStub />;
    return null;
  }, [activeKey]);

  return (
    <div className="panel">
      <h2 style={{ marginTop: 0 }}>Admin</h2>
      <div className="side-layout" style={{ marginTop: 16 }}>
        <Menu activeKey={activeKey} onSelect={setActiveKey} />
        <div className="col">{Content}</div>
      </div>
    </div>
  );
}
