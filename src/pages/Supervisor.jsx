import { useEffect, useMemo, useState } from "react";
import { getUser } from "../auth.js";
import {
  fetchDepartments,
  fetchInstalledSoftwareByDepartment,
  fetchAssignedComputersByDepartment,
  fetchExpiringLicenses,
} from "../api.js";
import { formatDateTime } from "../utils/format.js";

const MODULES = [
  { key: "dept_sw", label: "Department Software" },
  { key: "dept_pc", label: "Department Computers" },
  { key: "licenses", label: "Expiring licenses" },
];

function Menu({ activeKey, onSelect }) {
  return (
    <div style={{ width: 220, borderRight: "1px solid #ddd", padding: 12 }}>
      {MODULES.map((m) => (
        <button
          key={m.key}
          onClick={() => onSelect(m.key)}
          style={{
            display: "block",
            width: "100%",
            textAlign: "left",
            padding: "8px 10px",
            marginBottom: 8,
            background: activeKey === m.key ? "#eef" : "#f7f7f7",
            border: activeKey === m.key ? "1px solid #88a" : "1px solid #ddd",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}

function DepartmentSoftwarePanel() {
  const [departments, setDepartments] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [errorDepts, setErrorDepts] = useState("");
  const [selectedDeptId, setSelectedDeptId] = useState("");

  const [installed, setInstalled] = useState([]);
  const [loadingInstalled, setLoadingInstalled] = useState(false);
  const [errorInstalled, setErrorInstalled] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoadingDepts(true);
      setErrorDepts("");
      try {
        const data = await fetchDepartments();
        if (cancelled) return;
        const list = Array.isArray(data) ? data : [];
        setDepartments(list);
        if (list.length > 0 && !selectedDeptId) {
          setSelectedDeptId(String(list[0].dept_id));
        }
      } catch (err) {
        if (!cancelled) setErrorDepts("Failed to load departments");
      } finally {
        if (!cancelled) setLoadingDepts(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadInstalled() {
      if (!selectedDeptId) {
        setInstalled([]);
        return;
      }
      setLoadingInstalled(true);
      setErrorInstalled("");
      try {
        const data = await fetchInstalledSoftwareByDepartment(selectedDeptId);
        if (!cancelled) setInstalled(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setErrorInstalled("Failed to load installed software");
      } finally {
        if (!cancelled) setLoadingInstalled(false);
      }
    }
    loadInstalled();
    return () => {
      cancelled = true;
    };
  }, [selectedDeptId]);

  return (
    <div>
      <h3>Department Software</h3>
      <div style={{ margin: "8px 0 16px" }}>
        <label htmlFor="dept-select">Department</label>
        <select
          id="dept-select"
          style={{ marginLeft: 8, padding: 8, minWidth: 200 }}
          value={selectedDeptId}
          onChange={(e) => setSelectedDeptId(e.target.value)}
          disabled={loadingDepts}
        >
          {departments.map((d) => (
            <option key={d.dept_id} value={String(d.dept_id)}>
              {d.dept_name} ({d.dept_code})
            </option>
          ))}
          {departments.length === 0 && <option value="">No departments</option>}
        </select>
      </div>
      {loadingInstalled && <div>Loading…</div>}
      {errorInstalled && <div style={{ color: "red" }}>{errorInstalled}</div>}
      {!loadingInstalled &&
        !errorInstalled &&
        selectedDeptId &&
        (installed.length === 0 ? (
          <div>No installed software for this department.</div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 12,
            }}
          >
            {installed.map((sw) => (
              <div
                key={sw.software_id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  padding: 12,
                }}
              >
                <div style={{ fontWeight: 600 }}>{sw.name}</div>
                <div style={{ color: "#666" }}>{sw.sw_type_name}</div>
                <div style={{ marginTop: 6 }}>
                  <span
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: 4,
                      padding: "2px 6px",
                    }}
                  >
                    {sw.manufacturer}
                  </span>
                </div>
                <div style={{ color: "#888", marginTop: 6 }}>
                  Code: {sw.code} • Short: {sw.short_name}
                </div>
              </div>
            ))}
          </div>
        ))}
      {!loadingInstalled && !errorInstalled && !selectedDeptId && (
        <div>Select a department to view software.</div>
      )}
    </div>
  );
}

function DepartmentComputersStub() {
  const [departments, setDepartments] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [errorDepts, setErrorDepts] = useState("");
  const [selectedDeptId, setSelectedDeptId] = useState("");

  const [computers, setComputers] = useState([]);
  const [loadingComputers, setLoadingComputers] = useState(false);
  const [errorComputers, setErrorComputers] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoadingDepts(true);
      setErrorDepts("");
      try {
        const data = await fetchDepartments();
        if (cancelled) return;
        const list = Array.isArray(data) ? data : [];
        setDepartments(list);
        if (list.length > 0 && !selectedDeptId) {
          setSelectedDeptId(String(list[0].dept_id));
        }
      } catch (err) {
        if (!cancelled) setErrorDepts("Failed to load departments");
      } finally {
        if (!cancelled) setLoadingDepts(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadComputers() {
      if (!selectedDeptId) {
        setComputers([]);
        return;
      }
      setLoadingComputers(true);
      setErrorComputers("");
      try {
        const data = await fetchAssignedComputersByDepartment(selectedDeptId);
        if (!cancelled) setComputers(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setErrorComputers("Failed to load computers");
      } finally {
        if (!cancelled) setLoadingComputers(false);
      }
    }
    loadComputers();
    return () => {
      cancelled = true;
    };
  }, [selectedDeptId]);

  return (
    <div>
      <h3>Department Computers</h3>
      <div style={{ margin: "8px 0 16px" }}>
        <label htmlFor="dept-select2">Department</label>
        <select
          id="dept-select2"
          style={{ marginLeft: 8, padding: 8, minWidth: 200 }}
          value={selectedDeptId}
          onChange={(e) => setSelectedDeptId(e.target.value)}
          disabled={loadingDepts}
        >
          {departments.map((d) => (
            <option key={d.dept_id} value={String(d.dept_id)}>
              {d.dept_name} ({d.dept_code})
            </option>
          ))}
          {departments.length === 0 && <option value="">No departments</option>}
        </select>
      </div>
      {loadingComputers && <div>Loading…</div>}
      {errorComputers && <div style={{ color: "red" }}>{errorComputers}</div>}
      {!loadingComputers &&
        !errorComputers &&
        selectedDeptId &&
        (computers.length === 0 ? (
          <div>No computers assigned to this department.</div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 12,
            }}
          >
            {computers.map((pc) => (
              <div
                key={pc.computer_id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  padding: 12,
                }}
              >
                <div style={{ fontWeight: 600 }}>{pc.inventory_number}</div>
                <div style={{ color: "#666" }}>{pc.computer_type}</div>
                <div style={{ marginTop: 6 }}>Status: {pc.status}</div>
                <div style={{ color: "#888", marginTop: 6 }}>
                  Purchased: {pc.purchase_date}
                </div>
              </div>
            ))}
          </div>
        ))}
      {!loadingComputers && !errorComputers && !selectedDeptId && (
        <div>Select a department to view computers.</div>
      )}
    </div>
  );
}

function ExpiringLicensesPanel() {
  const [startLocal, setStartLocal] = useState("");
  const [endLocal, setEndLocal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);

  function toDateInputValue(date) {
    const pad = (n) => String(n).padStart(2, "0");
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    return `${yyyy}-${mm}-${dd}`;
  }

  useEffect(() => {
    const now = new Date();
    const end = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    setStartLocal(toDateInputValue(now));
    setEndLocal(toDateInputValue(end));
  }, []);

  async function load(e) {
    if (e) e.preventDefault();
    setError("");
    setItems([]);
    if (!startLocal || !endLocal) {
      setError("Please select both start and end dates");
      return;
    }
    const startDate = new Date(`${startLocal}T00:00:00`);
    const endDate = new Date(`${endLocal}T23:59:59.999`);
    if (
      !(startDate instanceof Date) ||
      isNaN(startDate) ||
      !(endDate instanceof Date) ||
      isNaN(endDate)
    ) {
      setError("Invalid date");
      return;
    }
    if (startDate >= endDate) {
      setError("Start date must be earlier than end date");
      return;
    }
    setLoading(true);
    try {
      const data = await fetchExpiringLicenses({
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      });
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load expiring licenses");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h3>Expiring licenses</h3>
      <form
        onSubmit={load}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
          marginBottom: 12,
        }}
      >
        <label>Start</label>
        <input
          type="date"
          value={startLocal}
          onChange={(e) => setStartLocal(e.target.value)}
        />
        <label>End</label>
        <input
          type="date"
          value={endLocal}
          onChange={(e) => setEndLocal(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Loading…" : "Load"}
        </button>
      </form>
      {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
      {!loading && !error && items.length === 0 && (
        <div>No expiring licenses for selected range.</div>
      )}
      {!loading && !error && items.length > 0 && (
        <div className="grid-3">
          {items.map((lic) => (
            <div key={lic.license_id} className="panel">
              <div style={{ fontWeight: 600 }}>{lic.software_name}</div>
              <div className="muted">{lic.vendor_name}</div>
              <div style={{ marginTop: 6 }}>
                Price per unit: {lic.price_per_unit}
              </div>
              <div className="muted" style={{ marginTop: 6 }}>
                From: {formatDateTime(lic.start_date)}
              </div>
              <div className="muted">To: {formatDateTime(lic.end_date)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SupervisorPage() {
  const user = getUser();
  const name = user?.username || "user";
  const role = user?.role || "supervisor";
  const [activeKey, setActiveKey] = useState("dept_sw");

  const Content = useMemo(() => {
    if (activeKey === "dept_sw") return <DepartmentSoftwarePanel />;
    if (activeKey === "dept_pc") return <DepartmentComputersStub />;
    if (activeKey === "licenses") return <ExpiringLicensesPanel />;
    return null;
  }, [activeKey]);

  return (
    <div className="panel">
      <h2 style={{ marginTop: 0 }}>Supervisor</h2>
      <div className="side-layout" style={{ marginTop: 16 }}>
        <Menu activeKey={activeKey} onSelect={setActiveKey} />
        <div className="col">{Content}</div>
      </div>
    </div>
  );
}
