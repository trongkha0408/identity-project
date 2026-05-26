import { useState, useEffect } from "react";
import AuthService from "../../services/auth.service";
import { Alert, Field, Input, Button } from "../../components/ui";

export default function RolesTab() {
  const [roles, setRoles]     = useState([]);
  const [perms, setPerms]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr]         = useState("");
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true); setErr("");
    try { const [r, p] = await Promise.all([AuthService.getRoles(), AuthService.getPermissions()]); setRoles(r); setPerms(p); }
    catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const doDelete = async (name) => {
    if (!confirm(`Xóa role "${name}"?`)) return;
    try { await AuthService.deleteRole(name); load(); }
    catch (e) { setErr(e.message); }
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 14, color: "#7070a0" }}>
          <strong style={{ color: "#8080c0" }}>{roles.length}</strong> roles trong hệ thống
        </div>
        <button onClick={() => setShowForm(v => !v)} style={addBtn}>{showForm ? "✕ Đóng" : "+ Tạo Role"}</button>
      </div>

      {err && <Alert type="err">⚠ {err}</Alert>}
      {showForm && <CreateRoleForm perms={perms} onCreated={() => { setShowForm(false); load(); }} />}

      {loading ? <div style={{ color: "#5050a0", padding: "2rem" }}>Đang tải...</div> : (
        <div style={{ display: "grid", gap: 10 }}>
          {roles.length === 0
            ? <div style={{ color: "#4040a0", fontSize: 14, padding: "2rem", textAlign: "center" }}>Chưa có role nào</div>
            : roles.map(r => (
              <div key={r.name} style={roleCard}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={roleNameTag}>{r.name}</span>
                    {r.description && <span style={{ fontSize: 13, color: "#6060a0" }}>{r.description}</span>}
                  </div>
                  {[...(r.permissions ?? [])].length > 0 ? (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {[...r.permissions].map(p => <span key={p.name} style={permTag}>{p.name}</span>)}
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: "#3a3a70" }}>Không có permissions</div>
                  )}
                </div>
                <button onClick={() => doDelete(r.name)} style={delBtn}>Xóa</button>
              </div>
            ))}
        </div>
      )}
    </>
  );
}

function CreateRoleForm({ perms, onCreated }) {
  const [form, setForm]         = useState({ name: "", description: "" });
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading]   = useState(false);
  const [err, setErr]           = useState("");
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const toggle = n => setSelected(s => { const x = new Set(s); x.has(n) ? x.delete(n) : x.add(n); return x; });

  const submit = async () => {
    setErr("");
    if (!form.name.trim()) return setErr("Tên role không được trống");
    setLoading(true);
    try { await AuthService.createRole(form.name.toUpperCase(), form.description, [...selected]); onCreated(); }
    catch (e) { setErr(e.message); setLoading(false); }
  };

  return (
    <div style={formCard}>
      <div style={{ fontSize: 15, fontWeight: 600, color: "#d0cdee", marginBottom: 14 }}>Tạo Role mới</div>
      {err && <Alert type="err">⚠ {err}</Alert>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <Field label="Tên Role *"><Input value={form.name} onChange={set("name")} placeholder="MANAGER" /></Field>
        <Field label="Mô tả"><Input value={form.description} onChange={set("description")} placeholder="Mô tả..." /></Field>
      </div>
      {perms.length > 0 && (
        <>
          <div style={{ fontSize: 12, color: "#7070a0", fontWeight: 500, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 10 }}>Chọn Permissions</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 16 }}>
            {perms.map(p => (
              <label key={p.name} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 11px", borderRadius: 8, border: `1px solid ${selected.has(p.name) ? "rgba(192,132,252,0.5)" : "rgba(255,255,255,0.07)"}`, background: selected.has(p.name) ? "rgba(192,132,252,0.12)" : "transparent", cursor: "pointer", fontSize: 13, color: selected.has(p.name) ? "#c084fc" : "#7070a0", transition: "all .1s" }}>
                <input type="checkbox" checked={selected.has(p.name)} onChange={() => toggle(p.name)} style={{ accentColor: "#c084fc" }} />
                {p.name}
              </label>
            ))}
          </div>
        </>
      )}
      <Button loading={loading} onClick={submit}>{loading ? "Đang tạo..." : "Tạo Role"}</Button>
    </div>
  );
}

const addBtn     = { padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "1px solid rgba(192,132,252,0.4)", background: "rgba(192,132,252,0.1)", color: "#c084fc", cursor: "pointer", fontFamily: "inherit" };
const roleCard   = { display: "flex", alignItems: "flex-start", gap: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "1rem 1.25rem" };
const roleNameTag= { fontSize: 13, fontWeight: 700, padding: "3px 12px", borderRadius: 6, background: "rgba(192,132,252,0.15)", color: "#c084fc", border: "1px solid rgba(192,132,252,0.3)" };
const permTag    = { fontSize: 11, padding: "2px 8px", borderRadius: 5, background: "rgba(59,130,246,0.1)", color: "#93c5fd", border: "1px solid rgba(59,130,246,0.2)" };
const delBtn     = { padding: "4px 12px", borderRadius: 6, fontSize: 12, border: "1px solid rgba(248,113,113,0.3)", background: "rgba(248,113,113,0.08)", color: "#f87171", cursor: "pointer", fontFamily: "inherit", flexShrink: 0 };
const formCard   = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "1.25rem", marginBottom: 16 };
