import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VerifyPage from "./pages/VerifyPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import AdminPage from "./pages/AdminPage";

const GUEST_PAGES = ["login", "register", "verify", "forgot"];

function Router() {
  const { user } = useAuth();
  const [page, setPage] = useState(() => user ? "dashboard" : "login");

  useEffect(() => {
    if (!user && !GUEST_PAGES.includes(page)) setPage("login");
    if (user  &&  GUEST_PAGES.includes(page)) setPage("dashboard");
  }, [user]);

  const navigate = (p) => setPage(p);

  // Check admin: roles là Set<RoleResponse> { name, description, permissions }
  const isAdmin = user?.roles?.some(r => (r.name ?? r) === "ADMIN");

  const renderPage = () => {
    switch (page) {
      case "login":    return <LoginPage onNavigate={navigate} />;
      case "register": return <RegisterPage onNavigate={navigate} />;
      case "verify":   return <VerifyPage onNavigate={navigate} />;
      case "forgot":   return <ForgotPasswordPage onNavigate={navigate} />;
      case "dashboard":
        return <ProtectedRoute fallback={<LoginPage onNavigate={navigate} />}><DashboardPage /></ProtectedRoute>;
      case "admin":
        return (
          <ProtectedRoute role="ADMIN" fallback={<LoginPage onNavigate={navigate} />}>
            <AdminPage />
          </ProtectedRoute>
        );
      default: return <LoginPage onNavigate={navigate} />;
    }
  };

  return (
    <div style={{ minHeight: "100vh", fontFamily: "'DM Sans', system-ui, sans-serif", background: "#0f0f13", color: "#e8e6f0" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <Navbar page={page} onNavigate={navigate} />
      <main>{renderPage()}</main>
    </div>
  );
}

export default function App() {
  return <AuthProvider><Router /></AuthProvider>;
}
