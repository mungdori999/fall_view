import { useEffect, useState } from "react";
import AdminLogin from "./components/admin/AdminLogin";
import HomeScreen from "./components/HomeScreen";
import MemberLogin from "./components/MemberLogin";
import { clearAccessToken, getAccessToken, saveAccessToken } from "./utils/authStorage";
import LoginRequiredModal from "./components/LoginRequiredModal";
import {
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import AdminDashboard from "./components/admin/AdminDashboard";
import MemberRegistration from "./components/admin/MemberRegistration";
import MemberBulkRegistration from "./components/admin/MemberBulkRegistration";
import MemberList from "./components/admin/MemberList";
import {
  getAdminToken,
  saveAdminToken,
  clearAdminToken,
  isAdminToken,
} from "./utils/adminAuthStorage";
import "./App.css";

function App() {
  const [accessToken, setAccessToken] = useState(getAccessToken);
  const [loginRequired, setLoginRequired] = useState(false);

  useEffect(() => {
    const showLoginRequired = () => setLoginRequired(true);
    window.addEventListener("member-auth-required", showLoginRequired);
    return () => window.removeEventListener("member-auth-required", showLoginRequired);
  }, []);

  const handleAuthenticated = (token) => {
    saveAccessToken(token);
    setAccessToken(token);
  };

  return (
    <>
    <Routes>
      <Route
        path="/"
        element={
          accessToken ? (
            <HomeScreen />
          ) : (
            <MemberLogin onAuthenticated={handleAuthenticated} />
          )
        }
      />
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    {loginRequired && <LoginRequiredModal onConfirm={() => {
      clearAccessToken();
      setAccessToken(null);
      setLoginRequired(false);
    }} />}
    </>
  );
}

function AdminRoutes() {
  const [token, setToken] = useState(getAdminToken);
  const [loginRequired, setLoginRequired] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const authenticated = isAdminToken(token);
  useEffect(() => {
    const showLoginRequired = () => setLoginRequired(true);
    window.addEventListener("admin-auth-required", showLoginRequired);
    return () => window.removeEventListener("admin-auth-required", showLoginRequired);
  }, []);
  const login = (value) => {
    saveAdminToken(value);
    setToken(value);
    const from = location.state?.from;
    navigate(
      ["/admin/members", "/admin/members/new", "/admin/members/bulk"].includes(from)
        ? from
        : "/admin/members",
      { replace: true },
    );
  };
  const logout = () => {
    clearAdminToken();
    setToken(null);
    navigate("/admin", { replace: true });
  };
  return (
    <>
    <Routes>
      <Route
        index
        element={
          authenticated ? (
            <Navigate to="members" replace />
          ) : (
            <AdminLogin onAuthenticated={login} />
          )
        }
      />
      <Route
        element={
          authenticated ? (
            <Outlet />
          ) : (
            <Navigate to="/admin" state={{ from: location.pathname }} replace />
          )
        }
      >
        <Route
          path="members"
          element={<AdminDashboard token={token} onLogout={logout} />}
        >
          <Route index element={<MemberList />} />
          <Route path="new" element={<MemberRegistration />} />
          <Route path="bulk" element={<MemberBulkRegistration />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
    {loginRequired && <LoginRequiredModal admin onConfirm={() => {
      clearAdminToken();
      setToken(null);
      setLoginRequired(false);
      navigate("/admin", { replace: true });
    }} />}
    </>
  );
}

export default App;
