import { getToken, clearToken } from "./auth.js";

const API_BASE_URL = "http://0.0.0.0:8000/api";

export async function loginRequest({ username, password }) {
  const url = new URL(`${API_BASE_URL}/login`);
  url.searchParams.set("username", username);
  url.searchParams.set("password", password);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      accept: "application/json",
    },
  });

  if (response.status === 401) {
    // Unauthorized
    throw new Error("unauthorized");
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export async function apiGet(path) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  });
  if (response.status === 401) {
    clearToken();
    // If running in browser context, redirect to login
    if (typeof window !== "undefined") {
      const redirect = encodeURIComponent(
        window.location.pathname + window.location.search,
      );
      window.location.replace(`/login?redirect=${redirect}`);
    }
    throw new Error("unauthorized");
  }
  if (response.status === 403) {
    let message = "Insufficient permissions";
    try {
      const data = await response.clone().json();
      if (data?.message) message = data.message;
    } catch (_) {
      try {
        const text = await response.text();
        if (text) message = text;
      } catch (_) {
        // ignore
      }
    }
    if (typeof window !== "undefined") {
      const msg = encodeURIComponent(message);
      window.location.replace(`/forbidden?message=${msg}`);
    }
    throw new Error("forbidden");
  }
  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      text || `GET ${path} failed with status ${response.status}`,
    );
  }
  return response.json();
}

export async function fetchAuditLogs({ limit = 50 } = {}) {
  const query = new URLSearchParams({ limit: String(limit) }).toString();
  return apiGet(`/auditLogs?${query}`);
}

async function apiPost(path, { body = "" } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body,
  });
  if (response.status === 401) {
    clearToken();
    if (typeof window !== "undefined") {
      const redirect = encodeURIComponent(
        window.location.pathname + window.location.search,
      );
      window.location.replace(`/login?redirect=${redirect}`);
    }
    throw new Error("unauthorized");
  }
  if (response.status === 403) {
    let message = "Insufficient permissions";
    try {
      const data = await response.clone().json();
      if (data?.message) message = data.message;
    } catch (_) {
      try {
        const text = await response.text();
        if (text) message = text;
      } catch (_) {
        // ignore
      }
    }
    if (typeof window !== "undefined") {
      const msg = encodeURIComponent(message);
      window.location.replace(`/forbidden?message=${msg}`);
    }
    throw new Error("forbidden");
  }
  if (response.status === 409) {
    let message = "Conflict";
    try {
      const data = await response.clone().json();
      if (data?.message) message = data.message;
    } catch (_) {
      try {
        const text = await response.text();
        if (text) message = text;
      } catch (_) {
        // ignore
      }
    }
    throw new Error(`conflict: ${message}`);
  }
  return response;
}

export async function createSoftwareType(name) {
  const query = new URLSearchParams({ name }).toString();
  const res = await apiPost(`/softwareTypes?${query}`, { body: "" });
  if (res.status !== 201) {
    const text = await res.text();
    throw new Error(
      text || `POST /softwareTypes failed with status ${res.status}`,
    );
  }
  return res.json();
}

async function apiPut(path) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "PUT",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  });
  if (response.status === 401) {
    clearToken();
    if (typeof window !== "undefined") {
      const redirect = encodeURIComponent(
        window.location.pathname + window.location.search,
      );
      window.location.replace(`/login?redirect=${redirect}`);
    }
    throw new Error("unauthorized");
  }
  if (response.status === 403) {
    let message = "Insufficient permissions";
    try {
      const data = await response.clone().json();
      if (data?.message) message = data.message;
    } catch (_) {
      try {
        const text = await response.text();
        if (text) message = text;
      } catch (_) {
        // ignore
      }
    }
    if (typeof window !== "undefined") {
      const msg = encodeURIComponent(message);
      window.location.replace(`/forbidden?message=${msg}`);
    }
    throw new Error("forbidden");
  }
  if (response.status === 409) {
    let message = "Conflict";
    try {
      const data = await response.clone().json();
      if (data?.message) message = data.message;
    } catch (_) {
      try {
        const text = await response.text();
        if (text) message = text;
      } catch (_) {
        // ignore
      }
    }
    throw new Error(`conflict: ${message}`);
  }
  return response;
}

async function apiDelete(path) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "DELETE",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  });
  if (response.status === 401) {
    clearToken();
    if (typeof window !== "undefined") {
      const redirect = encodeURIComponent(
        window.location.pathname + window.location.search,
      );
      window.location.replace(`/login?redirect=${redirect}`);
    }
    throw new Error("unauthorized");
  }
  if (response.status === 403) {
    let message = "Insufficient permissions";
    try {
      const data = await response.clone().json();
      if (data?.message) message = data.message;
    } catch (_) {
      try {
        const text = await response.text();
        if (text) message = text;
      } catch (_) {
        // ignore
      }
    }
    if (typeof window !== "undefined") {
      const msg = encodeURIComponent(message);
      window.location.replace(`/forbidden?message=${msg}`);
    }
    throw new Error("forbidden");
  }
  if (response.status === 409) {
    let message = "Conflict";
    try {
      const data = await response.clone().json();
      if (data?.message) message = data.message;
    } catch (_) {
      try {
        const text = await response.text();
        if (text) message = text;
      } catch (_) {
        // ignore
      }
    }
    throw new Error(`conflict: ${message}`);
  }
  return response;
}

// Users CRUD
export async function fetchUsers() {
  return apiGet("/users");
}

export async function createUser({ username, password, role, full_name }) {
  const query = new URLSearchParams({
    username,
    password,
    role,
    full_name,
  }).toString();
  const res = await apiPost(`/users?${query}`, { body: "" });
  if (res.status !== 201) {
    const text = await res.text();
    throw new Error(text || `POST /users failed with status ${res.status}`);
  }
  return res.json();
}

export async function updateUser({ user_id, username, role, full_name }) {
  const query = new URLSearchParams({ username, role, full_name }).toString();
  const res = await apiPut(
    `/users/${encodeURIComponent(String(user_id))}?${query}`,
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      text || `PUT /users/${user_id} failed with status ${res.status}`,
    );
  }
  return res.json();
}

export async function deleteUser(user_id) {
  const res = await apiDelete(`/users/${encodeURIComponent(String(user_id))}`);
  if (res.status !== 204) {
    const text = await res.text();
    throw new Error(
      text || `DELETE /users/${user_id} failed with status ${res.status}`,
    );
  }
}

// Supervisor endpoints
export async function fetchDepartments() {
  return apiGet("/departments");
}

export async function fetchInstalledSoftwareByDepartment(deptId) {
  return apiGet(
    `/departments/installedSoftware/${encodeURIComponent(String(deptId))}`,
  );
}

export async function fetchAssignedComputersByDepartment(deptId) {
  return apiGet(
    `/departments/assignedComputers/${encodeURIComponent(String(deptId))}`,
  );
}

export async function fetchExpiringLicenses({ start_date, end_date }) {
  const qs = new URLSearchParams({ start_date, end_date }).toString();
  return apiGet(`/licenses/expiring?${qs}`);
}

// Manager endpoints
export async function createComputer({
  inventory_number,
  computer_type,
  purchase_date,
  status = "active",
}) {
  const qs = new URLSearchParams({
    inventory_number,
    computer_type,
    purchase_date,
    status,
  }).toString();
  const res = await apiPost(`/computers?${qs}`, { body: "" });
  if (res.status !== 201) {
    const text = await res.text();
    throw new Error(text || `POST /computers failed with status ${res.status}`);
  }
  return res.json();
}

export async function fetchComputers() {
  return apiGet("/computers");
}

export async function createComputerAssignment({
  computer_id,
  dept_id,
  doc_number,
  doc_date,
  doc_type,
  start_date,
  end_date,
}) {
  const qs = new URLSearchParams({
    computer_id: String(computer_id),
    dept_id: String(dept_id),
    doc_number: String(doc_number || ""),
    doc_date,
    doc_type,
    start_date,
    end_date,
  }).toString();
  const res = await apiPost(`/computerAssignments?${qs}`, { body: "" });
  if (res.status !== 201) {
    const text = await res.text();
    throw new Error(
      text || `POST /computerAssignments failed with status ${res.status}`,
    );
  }
  return res.json();
}

export async function deleteComputer(computer_id) {
  const res = await apiDelete(
    `/computers/${encodeURIComponent(String(computer_id))}`,
  );
  if (res.status !== 204) {
    const text = await res.text();
    throw new Error(
      text ||
        `DELETE /computers/${computer_id} failed with status ${res.status}`,
    );
  }
}

// Software
export async function fetchSoftwareTypes() {
  return apiGet("/softwareTypes");
}

export async function createSoftware({
  sw_type_id,
  code,
  name,
  short_name,
  manufacturer,
}) {
  const qs = new URLSearchParams({
    sw_type_id: String(sw_type_id),
    code,
    name,
    short_name,
    manufacturer,
  }).toString();
  const res = await apiPost(`/software?${qs}`, { body: "" });
  if (res.status !== 201) {
    const text = await res.text();
    throw new Error(text || `POST /software failed with status ${res.status}`);
  }
  return res.json();
}

// Licenses
export async function fetchSoftware() {
  return apiGet("/software");
}

export async function fetchVendors() {
  return apiGet("/vendors");
}

export async function createLicense({
  software_id,
  vendor_id,
  start_date,
  end_date,
  price_per_unit,
}) {
  const qs = new URLSearchParams({
    software_id: String(software_id),
    vendor_id: String(vendor_id),
    start_date,
    end_date,
    price_per_unit: String(price_per_unit),
  }).toString();
  const res = await apiPost(`/licenses?${qs}`, { body: "" });
  if (res.status !== 201) {
    const text = await res.text();
    throw new Error(text || `POST /licenses failed with status ${res.status}`);
  }
  return res.json();
}

// Installations
export async function fetchLicenses() {
  return apiGet("/licenses");
}

export async function fetchInstallations() {
  return apiGet("/installations");
}

export async function createInstallation({
  license_id,
  computer_id,
  install_date,
}) {
  const qs = new URLSearchParams({
    license_id: String(license_id),
    computer_id: String(computer_id),
    install_date,
  }).toString();
  const res = await apiPost(`/installations?${qs}`, { body: "" });
  if (res.status !== 201) {
    const text = await res.text();
    throw new Error(
      text || `POST /installations failed with status ${res.status}`,
    );
  }
  return res.json();
}

export async function fetchInstalledSoftwareByComputer(computerId) {
  return apiGet(
    `/computers/installedSoftware/${encodeURIComponent(String(computerId))}`,
  );
}

// Vendors
export async function createVendor({ name, address, phone, website }) {
  const qs = new URLSearchParams({ name, address, phone, website }).toString();
  const res = await apiPost(`/vendors?${qs}`, { body: "" });
  if (res.status !== 201) {
    const text = await res.text();
    throw new Error(text || `POST /vendors failed with status ${res.status}`);
  }
  return res.json();
}

// Reports
export async function fetchReportInstalledSoftware({ date }) {
  const qs = new URLSearchParams({ date }).toString();
  return apiGet(`/reports/installedSoftware?${qs}`);
}

export async function fetchReportCountSoftwareLicenses({ date }) {
  const qs = new URLSearchParams({ date }).toString();
  return apiGet(`/reports/countSoftwareLicenses?${qs}`);
}

export async function fetchReportCountDepartmentsComputers({ date }) {
  const qs = new URLSearchParams({ date }).toString();
  return apiGet(`/reports/countDepartmentsComputers?${qs}`);
}
