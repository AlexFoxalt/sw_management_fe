import { useEffect, useMemo, useState } from "react";
import { getUser } from "../auth.js";
import {
  createComputer,
  fetchComputers,
  fetchDepartments,
  createComputerAssignment,
  deleteComputer,
  fetchSoftwareTypes,
  createSoftware,
  fetchSoftware,
  fetchVendors,
  createLicense,
  fetchLicenses,
  createInstallation,
  fetchInstallations,
  fetchInstalledSoftwareByComputer,
  createVendor,
  fetchReportInstalledSoftware,
  fetchReportCountSoftwareLicenses,
  fetchReportCountDepartmentsComputers,
} from "../api.js";

const MODULES = [
  { key: "create_computer", label: "Create computer" },
  { key: "assign_computer", label: "Assign computer" },
  { key: "delete_computer", label: "Delete computer" },
  { key: "create_software", label: "Create software" },
  { key: "create_license", label: "Create license" },
  { key: "install_software", label: "Install software" },
  { key: "computer_software", label: "Computer software" },
  { key: "create_vendor", label: "Create vendor" },
  { key: "reports", label: "Reports" },
];

function Menu({ activeKey, onSelect }) {
  return (
    <div style={{ width: 260, borderRight: "1px solid #ddd", padding: 12 }}>
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

function ReportsPanel() {
  const REPORTS = [
    {
      key: "installed",
      label: "Installed Software",
      fetcher: fetchReportInstalledSoftware,
    },
    {
      key: "count_licenses",
      label: "Count Software Licenses",
      fetcher: fetchReportCountSoftwareLicenses,
    },
    {
      key: "count_dept_computers",
      label: "Count Department Computers",
      fetcher: fetchReportCountDepartmentsComputers,
    },
  ];
  const [reportKey, setReportKey] = useState(REPORTS[0].key);
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);

  async function onRun(e) {
    e.preventDefault();
    setError("");
    setItems([]);
    if (!date) {
      setError("Please select a date");
      return;
    }
    setLoading(true);
    try {
      const fetcher = REPORTS.find((r) => r.key === reportKey)?.fetcher;
      const data = await fetcher({ date: `${date}T00:00:00` });
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to fetch report");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h3>Reports</h3>
      <form
        onSubmit={onRun}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
          marginBottom: 12,
        }}
      >
        <label>Type</label>
        <select
          value={reportKey}
          onChange={(e) => setReportKey(e.target.value)}
        >
          {REPORTS.map((r) => (
            <option key={r.key} value={r.key}>
              {r.label}
            </option>
          ))}
        </select>
        <label>Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Loading…" : "Create report"}
        </button>
      </form>
      {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
      {!loading && !error && items.length === 0 && <div>No data.</div>}
      {!loading &&
        !error &&
        items.length > 0 &&
        (() => {
          const columns = Object.keys(items[0] || {});
          const toCell = (val) => {
            if (val === null || val === undefined) return "";
            if (typeof val === "object") return JSON.stringify(val);
            return String(val);
          };
          return (
            <div style={{ overflowX: "auto" }}>
              <table style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                  <tr>
                    {columns.map((col) => (
                      <th
                        key={col}
                        style={{
                          borderBottom: "1px solid #ddd",
                          textTransform: "none",
                          textAlign: "left",
                          padding: 6,
                        }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((row, idx) => (
                    <tr key={idx}>
                      {columns.map((col) => (
                        <td
                          key={col}
                          style={{ borderBottom: "1px solid #eee", padding: 6 }}
                        >
                          {toCell(row[col])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })()}
    </div>
  );
}

function CreateVendorPanel() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!name.trim() || !address.trim() || !phone.trim() || !website.trim()) {
      setError("All fields are required");
      return;
    }
    setLoading(true);
    try {
      const res = await createVendor({
        name: name.trim(),
        address: address.trim(),
        phone: phone.trim(),
        website: website.trim(),
      });
      setSuccess(`Vendor #${res?.vendor_id} created`);
      setName("");
      setAddress("");
      setPhone("");
      setWebsite("");
      setTimeout(() => setSuccess(""), 3500);
    } catch (err) {
      const msg = String(err?.message || "").toLowerCase();
      if (msg.startsWith("conflict:")) {
        setError(err.message.replace(/^conflict:\s*/i, ""));
      } else {
        setError("Failed to create vendor");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h3>Create vendor</h3>
      <form
        onSubmit={onSubmit}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 8,
          alignItems: "end",
          maxWidth: 1100,
        }}
      >
        <div>
          <label>Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ display: "block", width: "100%", padding: 8 }}
          />
        </div>
        <div>
          <label>Address</label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            style={{ display: "block", width: "100%", padding: 8 }}
          />
        </div>
        <div>
          <label>Phone</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ display: "block", width: "100%", padding: 8 }}
          />
        </div>
        <div>
          <label>Website</label>
          <input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            style={{ display: "block", width: "100%", padding: 8 }}
          />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <button type="submit" disabled={loading}>
            {loading ? "Creating…" : "Create"}
          </button>
        </div>
      </form>
      {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
      {success && (
        <div
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

function Stub({ title }) {
  return (
    <div>
      <h3>{title}</h3>
      <div>Coming soon…</div>
    </div>
  );
}

function CreateComputerPanel() {
  const [inventory, setInventory] = useState("");
  const [type, setType] = useState("workstation");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("active");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function composePurchaseDate(d) {
    if (!d) return "";
    return `${d}T00:00:00`;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!inventory.trim()) {
      setError("Inventory number is required");
      return;
    }
    if (!date) {
      setError("Purchase date is required");
      return;
    }
    setLoading(true);
    try {
      const result = await createComputer({
        inventory_number: inventory.trim(),
        computer_type: type,
        purchase_date: composePurchaseDate(date),
        status,
      });
      setSuccess(`Computer #${result?.computer_id} created`);
      setInventory("");
      setType("workstation");
      setDate("");
      setStatus("active");
      setTimeout(() => setSuccess(""), 3500);
    } catch (err) {
      const msg = String(err?.message || "").toLowerCase();
      if (msg.startsWith("conflict:")) {
        setError(err.message.replace(/^conflict:\s*/i, ""));
      } else {
        setError("Failed to create computer");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h3>Create computer</h3>
      <form
        onSubmit={onSubmit}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 8,
          alignItems: "end",
          maxWidth: 900,
        }}
      >
        <div>
          <label>Inventory number</label>
          <input
            value={inventory}
            onChange={(e) => setInventory(e.target.value)}
            style={{ display: "block", width: "100%", padding: 8 }}
          />
        </div>
        <div>
          <label>Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={{ display: "block", width: "100%", padding: 8 }}
          >
            <option value="server">server</option>
            <option value="workstation">workstation</option>
          </select>
        </div>
        <div>
          <label>Purchase date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ display: "block", width: "100%", padding: 8 }}
          />
        </div>
        <div>
          <label>Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{ display: "block", width: "100%", padding: 8 }}
          >
            <option value="active">active</option>
            <option value="maintenance">maintenance</option>
            <option value="retired">retired</option>
          </select>
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <button type="submit" disabled={loading}>
            {loading ? "Creating…" : "Create"}
          </button>
        </div>
      </form>
      {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
      {success && (
        <div
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

function InstallSoftwarePanel() {
  const [computers, setComputers] = useState([]);
  const [licenses, setLicenses] = useState([]);
  const [installations, setInstallations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [computerId, setComputerId] = useState("");
  const [licenseId, setLicenseId] = useState("");
  const [installDate, setInstallDate] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  async function loadAll() {
    setLoading(true);
    setError("");
    try {
      const [cs, ls, ins] = await Promise.all([
        fetchComputers(),
        fetchLicenses(),
        fetchInstallations(),
      ]);
      setComputers(Array.isArray(cs) ? cs : []);
      setLicenses(Array.isArray(ls) ? ls : []);
      setInstallations(Array.isArray(ins) ? ins : []);
      if (cs && cs[0]) setComputerId(String(cs[0].computer_id));
      if (ls && ls[0]) setLicenseId(String(ls[0].license_id));
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setCreateError("");
    setCreateSuccess("");
    if (!computerId || !licenseId || !installDate) {
      setCreateError("All fields are required");
      return;
    }
    setCreating(true);
    try {
      const res = await createInstallation({
        computer_id: Number(computerId),
        license_id: Number(licenseId),
        install_date: `${installDate}T00:00:00`,
      });
      setCreateSuccess(`Installation #${res?.installation_id} created`);
      setInstallDate("");
      setTimeout(() => setCreateSuccess(""), 3500);
      await loadAll();
    } catch (err) {
      const msg = String(err?.message || "").toLowerCase();
      if (msg.startsWith("conflict:")) {
        setCreateError(err.message.replace(/^conflict:\s*/i, ""));
      } else {
        setCreateError("Failed to create installation");
      }
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <h3>Install software</h3>
      {loading && <div>Loading…</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
      {!loading && !error && (
        <>
          <form
            onSubmit={onSubmit}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: 8,
              alignItems: "end",
              maxWidth: 1100,
            }}
          >
            <div>
              <label>Computer</label>
              <select
                value={computerId}
                onChange={(e) => setComputerId(e.target.value)}
                style={{ display: "block", width: "100%", padding: 8 }}
              >
                {computers.map((c) => (
                  <option key={c.computer_id} value={String(c.computer_id)}>
                    #{c.inventory_number} ({c.computer_type})
                  </option>
                ))}
                {computers.length === 0 && (
                  <option value="">No computers</option>
                )}
              </select>
            </div>
            <div>
              <label>License</label>
              <select
                value={licenseId}
                onChange={(e) => setLicenseId(e.target.value)}
                style={{ display: "block", width: "100%", padding: 8 }}
              >
                {licenses.map((l) => (
                  <option key={l.license_id} value={String(l.license_id)}>
                    {l.software_name} — {l.vendor_name}
                  </option>
                ))}
                {licenses.length === 0 && <option value="">No licenses</option>}
              </select>
            </div>
            <div>
              <label>Install date</label>
              <input
                type="date"
                value={installDate}
                onChange={(e) => setInstallDate(e.target.value)}
                style={{ display: "block", width: "100%", padding: 8 }}
              />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <button type="submit" disabled={creating}>
                {creating ? "Creating…" : "Create installation"}
              </button>
            </div>
          </form>
          {createError && (
            <div style={{ color: "red", marginTop: 8 }}>{createError}</div>
          )}
          {createSuccess && (
            <div
              style={{
                marginTop: 8,
                background: "#e6ffed",
                border: "1px solid #b7eb8f",
                padding: "8px 10px",
                borderRadius: 4,
              }}
            >
              {createSuccess}
            </div>
          )}

          <div style={{ marginTop: 16 }}>
            <h4>Existing installations</h4>
            {installations.length === 0 ? (
              <div>No installations yet.</div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: 12,
                }}
              >
                {installations.map((ins) => (
                  <div
                    key={ins.installation_id}
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: 6,
                      padding: 12,
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>
                      #{ins.installation_id}
                    </div>
                    <div style={{ marginTop: 6 }}>
                      <div>
                        Computer: #{ins.computer?.inventory_number} (
                        {ins.computer?.computer_type})
                      </div>
                      <div>
                        License: {ins.license?.software_name} —{" "}
                        {ins.license?.vendor_name}
                      </div>
                      <div style={{ color: "#888" }}>
                        Installed: {ins.install_date}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function ComputerSoftwarePanel() {
  const [computers, setComputers] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadComputers() {
      setLoading(true);
      setError("");
      try {
        const cs = await fetchComputers();
        if (cancelled) return;
        setComputers(Array.isArray(cs) ? cs : []);
        if (cs && cs[0]) setSelectedId(String(cs[0].computer_id));
      } catch (err) {
        if (!cancelled) setError("Failed to load computers");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadComputers();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadItems() {
      if (!selectedId) {
        setItems([]);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const data = await fetchInstalledSoftwareByComputer(selectedId);
        if (!cancelled) setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setError("Failed to load software");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadItems();
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  return (
    <div>
      <h3>Computer software</h3>
      <div style={{ margin: "8px 0 16px" }}>
        <label>Computer</label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          style={{ marginLeft: 8, padding: 8, minWidth: 220 }}
        >
          {computers.map((c) => (
            <option key={c.computer_id} value={String(c.computer_id)}>
              #{c.inventory_number} ({c.computer_type})
            </option>
          ))}
          {computers.length === 0 && <option value="">No computers</option>}
        </select>
      </div>
      {loading && <div>Loading…</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
      {!loading &&
        !error &&
        selectedId &&
        (items.length === 0 ? (
          <div>No software installed on this computer.</div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 12,
            }}
          >
            {items.map((sw) => (
              <div
                key={`${sw.software_id}-${sw.code}`}
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
      {!loading && !error && !selectedId && (
        <div>Select a computer to view installed software.</div>
      )}
    </div>
  );
}

function AssignForm({ computer, departments, onAssigned }) {
  const [deptId, setDeptId] = useState(
    departments[0] ? String(departments[0].dept_id) : "",
  );
  const [docNumber, setDocNumber] = useState("");
  const [docDate, setDocDate] = useState("");
  const [docType, setDocType] = useState("paper");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function composeDate(d, end = false) {
    if (!d) return "";
    return end ? `${d}T23:59:59.999` : `${d}T00:00:00`;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!deptId) {
      setError("Select department");
      return;
    }
    if (!docDate) {
      setError("Document date is required");
      return;
    }
    if (!startDate || !endDate) {
      setError("Start and end dates are required");
      return;
    }
    const sd = new Date(startDate);
    const ed = new Date(endDate);
    if (
      !(sd instanceof Date) ||
      isNaN(sd) ||
      !(ed instanceof Date) ||
      isNaN(ed) ||
      sd > ed
    ) {
      setError("Invalid date range");
      return;
    }
    setLoading(true);
    try {
      await createComputerAssignment({
        computer_id: computer.computer_id,
        dept_id: Number(deptId),
        doc_number: docNumber,
        doc_date: composeDate(docDate),
        doc_type: docType,
        start_date: composeDate(startDate),
        end_date: composeDate(endDate, true),
      });
      onAssigned?.();
    } catch (err) {
      const msg = String(err?.message || "").toLowerCase();
      if (msg.startsWith("conflict:")) {
        setError(err.message.replace(/^conflict:\s*/i, ""));
      } else {
        setError("Failed to assign computer");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: 8,
        alignItems: "end",
      }}
    >
      <div>
        <label>Department</label>
        <select
          value={deptId}
          onChange={(e) => setDeptId(e.target.value)}
          style={{ display: "block", width: "100%", padding: 8 }}
        >
          {departments.map((d) => (
            <option key={d.dept_id} value={String(d.dept_id)}>
              {d.dept_name} ({d.dept_code})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Doc number</label>
        <input
          value={docNumber}
          onChange={(e) => setDocNumber(e.target.value)}
          style={{ display: "block", width: "100%", padding: 8 }}
        />
      </div>
      <div>
        <label>Doc date</label>
        <input
          type="date"
          value={docDate}
          onChange={(e) => setDocDate(e.target.value)}
          style={{ display: "block", width: "100%", padding: 8 }}
        />
      </div>
      <div>
        <label>Doc type</label>
        <select
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
          style={{ display: "block", width: "100%", padding: 8 }}
        >
          <option value="paper">paper</option>
          <option value="pdf">pdf</option>
          <option value="electronic">electronic</option>
          <option value="email">email</option>
        </select>
      </div>
      <div>
        <label>Start date</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{ display: "block", width: "100%", padding: 8 }}
        />
      </div>
      <div>
        <label>End date</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={{ display: "block", width: "100%", padding: 8 }}
        />
      </div>
      <div style={{ gridColumn: "1 / -1" }}>
        <button type="submit" disabled={loading}>
          {loading ? "Assigning…" : "Assign"}
        </button>
        {error && <div style={{ color: "red", marginTop: 6 }}>{error}</div>}
      </div>
    </form>
  );
}

function AssignComputerPanel() {
  const [computers, setComputers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [cs, ds] = await Promise.all([
        fetchComputers(),
        fetchDepartments(),
      ]);
      setComputers(Array.isArray(cs) ? cs : []);
      setDepartments(Array.isArray(ds) ? ds : []);
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h3>Assign computer</h3>
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
          {computers.length === 0 && (
            <div style={{ gridColumn: "1 / -1" }}>No computers found.</div>
          )}
          {computers.map((c) => (
            <div
              key={c.computer_id}
              style={{ border: "1px solid #ddd", borderRadius: 6, padding: 12 }}
            >
              <div style={{ fontWeight: 600 }}>#{c.inventory_number}</div>
              <div style={{ color: "#666" }}>{c.computer_type}</div>
              <div style={{ color: "#888", marginBottom: 8 }}>
                Status: {c.status}
              </div>
              {c.assigned_dept ? (
                <div>
                  <div style={{ marginTop: 8 }}>
                    <span
                      style={{
                        border: "1px solid #ddd",
                        borderRadius: 4,
                        padding: "2px 6px",
                      }}
                    >
                      Assigned to: {c.assigned_dept.dept_name} (
                      {c.assigned_dept.dept_code})
                    </span>
                  </div>
                </div>
              ) : (
                <AssignForm
                  computer={c}
                  departments={departments}
                  onAssigned={load}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DeleteComputerPanel() {
  const [computers, setComputers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const cs = await fetchComputers();
      setComputers(Array.isArray(cs) ? cs : []);
    } catch (err) {
      setError("Failed to load computers");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onDelete(c) {
    if (!confirm(`Delete computer #${c.inventory_number}?`)) return;
    setBusyId(c.computer_id);
    try {
      await deleteComputer(c.computer_id);
      await load();
    } catch (err) {
      alert("Failed to delete computer");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <h3>Delete computer</h3>
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
          {computers.length === 0 && (
            <div style={{ gridColumn: "1 / -1" }}>No computers found.</div>
          )}
          {computers.map((c) => (
            <div
              key={c.computer_id}
              style={{ border: "1px solid #ddd", borderRadius: 6, padding: 12 }}
            >
              <div style={{ fontWeight: 600 }}>#{c.inventory_number}</div>
              <div style={{ color: "#666" }}>{c.computer_type}</div>
              <div style={{ color: "#888", marginBottom: 8 }}>
                Status: {c.status}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  title={`Delete #${c.inventory_number}`}
                  onClick={() => onDelete(c)}
                  disabled={busyId === c.computer_id}
                  style={{
                    background: "#fff1f0",
                    border: "1px solid #ffa39e",
                    padding: "6px 10px",
                  }}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CreateSoftwarePanel() {
  const [types, setTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [errorTypes, setErrorTypes] = useState("");

  const [swTypeId, setSwTypeId] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoadingTypes(true);
      setErrorTypes("");
      try {
        const data = await fetchSoftwareTypes();
        if (cancelled) return;
        setTypes(Array.isArray(data) ? data : []);
        if (data && data[0]) setSwTypeId(String(data[0].sw_type_id));
      } catch (err) {
        if (!cancelled) setErrorTypes("Failed to load software types");
      } finally {
        if (!cancelled) setLoadingTypes(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (
      !swTypeId ||
      !code.trim() ||
      !name.trim() ||
      !shortName.trim() ||
      !manufacturer.trim()
    ) {
      setError("All fields are required");
      return;
    }
    setLoading(true);
    try {
      const res = await createSoftware({
        sw_type_id: Number(swTypeId),
        code: code.trim(),
        name: name.trim(),
        short_name: shortName.trim(),
        manufacturer: manufacturer.trim(),
      });
      setSuccess(`Software #${res?.software_id} created`);
      setCode("");
      setName("");
      setShortName("");
      setManufacturer("");
      setTimeout(() => setSuccess(""), 3500);
    } catch (err) {
      const msg = String(err?.message || "").toLowerCase();
      if (msg.startsWith("conflict:")) {
        setError(err.message.replace(/^conflict:\s*/i, ""));
      } else {
        setError("Failed to create software");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h3>Create software</h3>
      {errorTypes && (
        <div style={{ color: "red", marginBottom: 8 }}>{errorTypes}</div>
      )}
      <form
        onSubmit={onSubmit}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          gap: 8,
          alignItems: "end",
          maxWidth: 1100,
        }}
      >
        <div>
          <label>Type</label>
          <select
            value={swTypeId}
            onChange={(e) => setSwTypeId(e.target.value)}
            disabled={loadingTypes}
            style={{ display: "block", width: "100%", padding: 8 }}
          >
            {types.map((t) => (
              <option key={t.sw_type_id} value={String(t.sw_type_id)}>
                {t.name}
              </option>
            ))}
            {types.length === 0 && <option value="">No types</option>}
          </select>
        </div>
        <div>
          <label>Code</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            style={{ display: "block", width: "100%", padding: 8 }}
          />
        </div>
        <div>
          <label>Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ display: "block", width: "100%", padding: 8 }}
          />
        </div>
        <div>
          <label>Short name</label>
          <input
            value={shortName}
            onChange={(e) => setShortName(e.target.value)}
            style={{ display: "block", width: "100%", padding: 8 }}
          />
        </div>
        <div>
          <label>Manufacturer</label>
          <input
            value={manufacturer}
            onChange={(e) => setManufacturer(e.target.value)}
            style={{ display: "block", width: "100%", padding: 8 }}
          />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <button type="submit" disabled={loading}>
            {loading ? "Creating…" : "Create"}
          </button>
        </div>
      </form>
      {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
      {success && (
        <div
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

function CreateLicensePanel() {
  const [software, setSoftware] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loadingLists, setLoadingLists] = useState(false);
  const [errorLists, setErrorLists] = useState("");

  const [softwareId, setSoftwareId] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoadingLists(true);
      setErrorLists("");
      try {
        const [sw, vd] = await Promise.all([fetchSoftware(), fetchVendors()]);
        if (cancelled) return;
        setSoftware(Array.isArray(sw) ? sw : []);
        setVendors(Array.isArray(vd) ? vd : []);
        if (sw && sw[0]) setSoftwareId(String(sw[0].software_id));
        if (vd && vd[0]) setVendorId(String(vd[0].vendor_id));
      } catch (err) {
        if (!cancelled) setErrorLists("Failed to load lists");
      } finally {
        if (!cancelled) setLoadingLists(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!softwareId || !vendorId || !startDate || !endDate || !price) {
      setError("All fields are required");
      return;
    }
    const sd = new Date(startDate);
    const ed = new Date(endDate);
    if (
      !(sd instanceof Date) ||
      isNaN(sd) ||
      !(ed instanceof Date) ||
      isNaN(ed) ||
      sd > ed
    ) {
      setError("Invalid date range");
      return;
    }
    const priceNum = Number(price);
    if (!isFinite(priceNum) || priceNum < 0) {
      setError("Invalid price");
      return;
    }
    setLoading(true);
    try {
      const res = await createLicense({
        software_id: Number(softwareId),
        vendor_id: Number(vendorId),
        start_date: `${startDate}T00:00:00`,
        end_date: `${endDate}T23:59:59.999`,
        price_per_unit: priceNum,
      });
      setSuccess(`License #${res?.license_id} created`);
      setStartDate("");
      setEndDate("");
      setPrice("");
      setTimeout(() => setSuccess(""), 3500);
    } catch (err) {
      const msg = String(err?.message || "").toLowerCase();
      if (msg.startsWith("conflict:")) {
        setError(err.message.replace(/^conflict:\s*/i, ""));
      } else {
        setError("Failed to create license");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h3>Create license</h3>
      {errorLists && (
        <div style={{ color: "red", marginBottom: 8 }}>{errorLists}</div>
      )}
      <form
        onSubmit={onSubmit}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          gap: 8,
          alignItems: "end",
          maxWidth: 1100,
        }}
      >
        <div>
          <label>Software</label>
          <select
            value={softwareId}
            onChange={(e) => setSoftwareId(e.target.value)}
            disabled={loadingLists}
            style={{ display: "block", width: "100%", padding: 8 }}
          >
            {software.map((s) => (
              <option key={s.software_id} value={String(s.software_id)}>
                {s.name}
              </option>
            ))}
            {software.length === 0 && <option value="">No software</option>}
          </select>
        </div>
        <div>
          <label>Vendor</label>
          <select
            value={vendorId}
            onChange={(e) => setVendorId(e.target.value)}
            disabled={loadingLists}
            style={{ display: "block", width: "100%", padding: 8 }}
          >
            {vendors.map((v) => (
              <option key={v.vendor_id} value={String(v.vendor_id)}>
                {v.vendor_name || v.name}
              </option>
            ))}
            {vendors.length === 0 && <option value="">No vendors</option>}
          </select>
        </div>
        <div>
          <label>Start date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ display: "block", width: "100%", padding: 8 }}
          />
        </div>
        <div>
          <label>End date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ display: "block", width: "100%", padding: 8 }}
          />
        </div>
        <div>
          <label>Price per unit</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            style={{ display: "block", width: "100%", padding: 8 }}
          />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <button type="submit" disabled={loading}>
            {loading ? "Creating…" : "Create"}
          </button>
        </div>
      </form>
      {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
      {success && (
        <div
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
export default function ManagerPage() {
  const user = getUser();
  const name = user?.username || "user";
  const role = user?.role || "manager";
  const [activeKey, setActiveKey] = useState("create_computer");

  const Content = useMemo(() => {
    if (activeKey === "create_computer") return <CreateComputerPanel />;
    if (activeKey === "assign_computer") return <AssignComputerPanel />;
    if (activeKey === "delete_computer") return <DeleteComputerPanel />;
    if (activeKey === "create_software") return <CreateSoftwarePanel />;
    if (activeKey === "create_license") return <CreateLicensePanel />;
    if (activeKey === "install_software") return <InstallSoftwarePanel />;
    if (activeKey === "computer_software") return <ComputerSoftwarePanel />;
    if (activeKey === "create_vendor") return <CreateVendorPanel />;
    if (activeKey === "reports") return <ReportsPanel />;
    const current = MODULES.find((m) => m.key === activeKey);
    return <Stub title={current?.label || "Module"} />;
  }, [activeKey]);

  return (
    <div className="panel">
      <h2 style={{ marginTop: 0 }}>Manager</h2>
      <div className="side-layout" style={{ marginTop: 16 }}>
        <Menu activeKey={activeKey} onSelect={setActiveKey} />
        <div className="col">{Content}</div>
      </div>
    </div>
  );
}
