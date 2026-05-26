import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import AuthService from "../services/auth.service";
import TokenService from "../services/token.service";
import { RoleBadge, Alert, Field, Input, Button } from "../components/ui";

export default function DashboardPage() {
  const { user, refreshUser } = useAuth();
  const [tab, setTab] = useState("info");

  useEffect(() => { refreshUser(); }, []);

  const accessToken = TokenService.getAccess();
  const displayName = user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.username : "";
  const roles = user?.roles?.map(r => r.name).join(", ") || "—";
  const isAdmin = user?.roles?.some(r => r.name === "ADMIN");

  return (
    <div style={{ padding: "2.5rem", maxWidth: 860 }}>
      <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 6, color: "#f0eeff" }}>Dashboard</div>
      <div style={{ fontSize: 15, color: "#7070a0", marginBottom: 24 }}>
        Xin chào, <strong style={{ color: "#c084fc" }}>{displayName || user?.username}</strong> 👋
        {isAdmin && <span style={{ marginLeft: 10, fontSize: 12, padding: "2px 8px", borderRadius: 6, background: "rgba(192,132,252,0.15)", color: "#c084fc" }}>ADMIN</span>}
      </div>

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Trạng thái", value: "Active ✅" },
          { label: "Username", value: user?.username || "—" },
          { label: "Roles", value: <RoleBadge role={roles} /> },
        ].map(({ label, value }) => (
          <div key={label} style={metricCard}>
            <div style={metricLabel}>{label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#f0eeff" }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: 4, width: "fit-content" }}>
        {[["info","📋 Thông tin"],["edit","✏️ Sửa hồ sơ"],["password","🔒 Đổi mật khẩu"],["token","🔑 JWT Token"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            padding: "6px 16px", borderRadius: 7, fontSize: 13, fontWeight: 500,
            border: "none", cursor: "pointer", fontFamily: "inherit",
            background: tab === id ? "rgba(192,132,252,0.2)" : "transparent",
            color: tab === id ? "#c084fc" : "#7070a0",
          }}>{label}</button>
        ))}
      </div>

      {tab === "info"     && <InfoTab user={user} roles={roles} />}
      {tab === "edit"     && <EditTab user={user} refreshUser={refreshUser} />}
      {tab === "password" && <PasswordTab />}
      {tab === "token"    && <TokenTab accessToken={accessToken} />}
    </div>
  );
}

function InfoTab({ user, roles }) {
  const rows = [
    ["User ID",   user?.id || "—"],
    ["Username",  user?.username || "—"],
    ["Họ",        user?.firstName || "—"],
    ["Tên",       user?.lastName || "—"],
    ["Ngày sinh", user?.dob || "—"],
    ["Roles",     <RoleBadge role={roles} />],
  ];
  return (
    <div style={cardStyle}>
      <div style={cardTitleStyle}>Thông tin tài khoản</div>
      {rows.map(([k, v], i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < rows.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
          <span style={{ fontSize: 13, color: "#7070a0", fontWeight: 500 }}>{k}</span>
          <span style={{ fontSize: 13, color: "#e0ddf5" }}>{v}</span>
        </div>
      ))}
    </div>
  );
}

function EditTab({ user, refreshUser }) {
  const [form, setForm] = useState({ firstName: user?.firstName || "", lastName: user?.lastName || "", dob: user?.dob || "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk]   = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setErr(""); setOk(false); setLoading(true);
    try { await AuthService.updateMyProfile(form); await refreshUser(); setOk(true); }
    catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ ...cardStyle, maxWidth: 460 }}>
      <div style={cardTitleStyle}>Sửa hồ sơ</div>
      {err && <Alert type="err">⚠ {err}</Alert>}
      {ok  && <Alert type="ok">✅ Cập nhật thành công!</Alert>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Họ"><Input value={form.firstName} onChange={set("firstName")} /></Field>
        <Field label="Tên"><Input value={form.lastName} onChange={set("lastName")} /></Field>
      </div>
      <Field label="Ngày sinh"><Input type="date" value={form.dob} onChange={set("dob")} /></Field>
      <Button loading={loading} onClick={submit}>{loading ? "Đang lưu..." : "Lưu thay đổi"}</Button>
    </div>
  );
}

function PasswordTab() {
  const [form, setForm] = useState({ old: "", new1: "", new2: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk]   = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setErr(""); setOk(false);
    if (!form.old || !form.new1) return setErr("Vui lòng điền đầy đủ");
    if (form.new1 !== form.new2)  return setErr("Mật khẩu mới không khớp");
    if (form.new1.length < 6)     return setErr("Mật khẩu tối thiểu 6 ký tự");
    setLoading(true);
    try { await AuthService.changePassword(form.old, form.new1); setOk(true); setForm({ old: "", new1: "", new2: "" }); }
    catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ ...cardStyle, maxWidth: 460 }}>
      <div style={cardTitleStyle}>Đổi mật khẩu</div>
      {err && <Alert type="err">⚠ {err}</Alert>}
      {ok  && <Alert type="ok">✅ Đổi mật khẩu thành công!</Alert>}
      <Field label="Mật khẩu hiện tại"><Input type="password" value={form.old}  onChange={set("old")}  placeholder="••••••••" /></Field>
      <Field label="Mật khẩu mới">      <Input type="password" value={form.new1} onChange={set("new1")} placeholder="••••••••" /></Field>
      <Field label="Xác nhận mật khẩu mới"><Input type="password" value={form.new2} onChange={set("new2")} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && submit()} /></Field>
      <Button loading={loading} onClick={submit}>{loading ? "Đang đổi..." : "Đổi mật khẩu"}</Button>
    </div>
  );
}

function TokenTab({ accessToken }) {
  const [show, setShow] = useState(false);
  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={cardTitleStyle}>JWT Access Token</div>
        <button onClick={() => setShow(v => !v)} style={{ padding: "3px 10px", borderRadius: 6, fontSize: 12, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#a0a0b8", cursor: "pointer", fontFamily: "inherit" }}>
          {show ? "Ẩn" : "Hiện"}
        </button>
      </div>
      <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 8, padding: 12, fontFamily: "monospace", fontSize: 11, color: "#818cf8", wordBreak: "break-all", border: "1px solid rgba(129,140,248,0.15)" }}>
        {show ? accessToken || "—" : (accessToken?.substring(0, 80) + "…" || "—")}
      </div>
      <div style={{ fontSize: 12, color: "#3a3a70", marginTop: 8 }}>
        Auto-attached vào mọi request. Tự refresh khi 401 (refresh token rotation).
      </div>
    </div>
  );
}

const metricCard    = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "1rem" };
const metricLabel   = { fontSize: 11, color: "#7070a0", marginBottom: 6, fontWeight: 500, textTransform: "uppercase", letterSpacing: ".5px" };
const cardStyle     = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "1.5rem", marginBottom: 16 };
const cardTitleStyle = { fontSize: 15, fontWeight: 600, color: "#d0cdee", marginBottom: 14 };
