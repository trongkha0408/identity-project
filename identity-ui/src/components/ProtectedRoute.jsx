import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, role, fallback = null }) {
  const { user } = useAuth();
  if (!user) return fallback;
  if (role) {
    const hasRole = user.roles?.some(r => (r.name ?? r) === role);
    if (!hasRole) return (
      <div style={{ textAlign: "center", paddingTop: "6rem" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🔒</div>
        <div style={{ fontSize: 20, fontWeight: 600, color: "#f0eeff", marginBottom: 8 }}>Truy cập bị từ chối</div>
        <div style={{ color: "#7070a0" }}>Bạn cần quyền <strong style={{ color: "#c084fc" }}>{role}</strong> để xem trang này</div>
      </div>
    );
  }
  return children;
}
