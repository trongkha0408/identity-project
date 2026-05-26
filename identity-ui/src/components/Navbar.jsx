import { useAuth } from "../context/AuthContext";

export default function Navbar({ page, onNavigate }) {
  const { user, logout } = useAuth();

  const isAdmin = user?.roles?.some(r => (r.name ?? r) === "ADMIN");

  const guestLinks = [
    { id: "login",    label: "Đăng nhập" },
    { id: "register", label: "Đăng ký" },
    { id: "verify",   label: "Xác thực email" },
  ];

  const userLinks = [
    { id: "dashboard", label: "Dashboard" },
    ...(isAdmin ? [{ id: "admin", label: "⚙ Quản trị" }] : []),
  ];

  const links = user ? userLinks : guestLinks;

  return (
    <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 2rem", height: 60, background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.08)", position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ fontWeight: 700, fontSize: 18, color: "#c084fc", letterSpacing: "-0.5px", cursor: "pointer" }}
        onClick={() => onNavigate(user ? "dashboard" : "login")}>
        ⚡ Identity
      </div>
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        {links.map(({ id, label }) => (
          <button key={id} onClick={() => onNavigate(id)} style={{
            padding: "6px 14px", borderRadius: 8, fontSize: 14, fontWeight: 500,
            border: "none", cursor: "pointer", fontFamily: "inherit",
            background: page === id ? "rgba(192,132,252,0.15)" : "transparent",
            color: page === id ? "#c084fc" : "#a0a0b8",
          }}>{label}</button>
        ))}
        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 8, paddingLeft: 8, borderLeft: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ fontSize: 13, color: "#5050a0" }}>{user.username}</div>
            <button onClick={logout} style={{ padding: "6px 14px", borderRadius: 8, fontSize: 14, fontWeight: 500, border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", background: "transparent", color: "#a0a0b8", fontFamily: "inherit" }}>
              Đăng xuất
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
