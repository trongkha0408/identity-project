// ─── Primitive UI pieces shared across pages ─────────────────────────────────

export function Alert({ type = "err", children }) {
  const styles = {
    err: {
      background: "rgba(248,113,113,0.12)",
      border: "1px solid rgba(248,113,113,0.25)",
      color: "#fca5a5",
    },
    ok: {
      background: "rgba(52,211,153,0.10)",
      border: "1px solid rgba(52,211,153,0.25)",
      color: "#6ee7b7",
    },
  };
  return (
    <div
      style={{
        padding: "10px 14px",
        borderRadius: 10,
        marginBottom: 16,
        fontSize: 14,
        ...styles[type],
      }}
    >
      {children}
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label
        style={{
          display: "block",
          fontSize: 12,
          color: "#9090b8",
          marginBottom: 6,
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: ".5px",
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export function Input({ ...props }) {
  return (
    <input
      style={{
        width: "100%",
        padding: "10px 14px",
        borderRadius: 10,
        fontSize: 15,
        background: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "#e8e6f0",
        outline: "none",
        boxSizing: "border-box",
        fontFamily: "inherit",
      }}
      {...props}
    />
  );
}

export function Button({ loading, children, ...props }) {
  return (
    <button
      style={{
        width: "100%",
        padding: "12px",
        borderRadius: 10,
        fontSize: 15,
        fontWeight: 600,
        background: loading ? "rgba(192,132,252,0.3)" : "rgba(192,132,252,0.85)",
        color: "#fff",
        border: "none",
        cursor: loading ? "not-allowed" : "pointer",
        marginTop: 8,
        letterSpacing: "-0.2px",
        fontFamily: "inherit",
      }}
      disabled={loading}
      {...props}
    >
      {children}
    </button>
  );
}

export function RoleBadge({ role }) {
  const isAdmin = role === "admin";
  return (
    <span
      style={{
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        background: isAdmin ? "rgba(192,132,252,0.2)" : "rgba(59,130,246,0.15)",
        color: isAdmin ? "#c084fc" : "#93c5fd",
        border: `1px solid ${isAdmin ? "rgba(192,132,252,0.35)" : "rgba(59,130,246,0.25)"}`,
      }}
    >
      {role || "user"}
    </span>
  );
}

export function VerifiedBadge({ verified }) {
  return (
    <span
      style={{
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        background: verified ? "rgba(52,211,153,0.12)" : "rgba(251,191,36,0.12)",
        color: verified ? "#6ee7b7" : "#fcd34d",
        border: `1px solid ${verified ? "rgba(52,211,153,0.3)" : "rgba(251,191,36,0.3)"}`,
      }}
    >
      {verified ? "✓ Đã xác thực" : "⚠ Chưa xác thực"}
    </span>
  );
}

export function AuthCard({ title, subtitle, children }) {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "calc(100vh - 60px)",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 20,
          padding: "2.5rem",
          width: "100%",
          maxWidth: 420,
        }}
      >
        {title && (
          <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 6, color: "#f0eeff" }}>
            {title}
          </div>
        )}
        {subtitle && (
          <div style={{ fontSize: 14, color: "#7070a0", marginBottom: 28 }}>{subtitle}</div>
        )}
        {children}
      </div>
    </div>
  );
}

export function SwitchRow({ children }) {
  return (
    <div style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "#7070a0" }}>
      {children}
    </div>
  );
}

export function TextLink({ onClick, children }) {
  return (
    <span
      onClick={onClick}
      style={{ color: "#c084fc", cursor: "pointer", textDecoration: "underline" }}
    >
      {children}
    </span>
  );
}
