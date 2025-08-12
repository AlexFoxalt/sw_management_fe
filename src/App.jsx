import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import "./App.css";
import LoginPage from "./pages/Login.jsx";
import { isAuthenticated, getUser } from "./auth.js";
import AdminPage from "./pages/Admin.jsx";
import ManagerPage from "./pages/Manager.jsx";
import SupervisorPage from "./pages/Supervisor.jsx";
import ForbiddenPage from "./pages/Forbidden.jsx";
import Layout from "./components/Layout.jsx";

function PrivateRoute() {
  if (!isAuthenticated()) {
    const redirect = encodeURIComponent(
      window.location.pathname + window.location.search,
    );
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }
  return <Outlet />;
}

function HomePage() {
  const user = getUser();
  const role = user?.role;
  if (role === "admin") return <Navigate to="/admin" replace />;
  if (role === "manager") return <Navigate to="/manager" replace />;
  if (role === "supervisor") return <Navigate to="/supervisor" replace />;
  return (
    <div style={{ padding: 24 }}>
      <h2>Home</h2>
      <p>You're logged in.</p>
    </div>
  );
}

function RoleRoute({ allowed }) {
  const user = getUser();
  const role = user?.role;
  if (!role || !allowed.includes(role)) {
    return <Navigate to="/forbidden" replace />;
  }
  return <Outlet />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/forbidden"
          element={
            <Layout>
              <ForbiddenPage />
            </Layout>
          }
        />
        <Route element={<PrivateRoute />}>
          <Route
            path="/"
            element={
              <Layout>
                <HomePage />
              </Layout>
            }
          />
          <Route element={<RoleRoute allowed={["admin"]} />}>
            <Route
              path="/admin"
              element={
                <Layout>
                  <AdminPage />
                </Layout>
              }
            />
          </Route>
          <Route element={<RoleRoute allowed={["manager"]} />}>
            <Route
              path="/manager"
              element={
                <Layout>
                  <ManagerPage />
                </Layout>
              }
            />
          </Route>
          <Route element={<RoleRoute allowed={["supervisor"]} />}>
            <Route
              path="/supervisor"
              element={
                <Layout>
                  <SupervisorPage />
                </Layout>
              }
            />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
