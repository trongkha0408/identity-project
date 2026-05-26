import { useState, useEffect } from "react";
import AuthService from "../../services/auth.service";
import { Alert, Field, Input, Button } from "../../components/ui";

export default function PermissionsTab() {
  const [perms, setPerms]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [err, setErr]           = useState("");
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true); setErr("");
    try { setPerms(await AuthService.getPermissions()); }
    catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const doDelete = async (name) => {
    if (!confirm(`Xóa permission "${name}"?`)) return;
    try { await AuthService.deletePermission(name); load(); }
    catch (e) { setErr(e.message); }
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 14, color: "#7070a0" }}>
          <strong style={{ color: "#8080c0" }}>{perms.length}</strong> permissions trong hệ thống
        </div>
        <button onClick={() => setShowForm(v => !v)} style={addBtn}>{showForm ? "✕ Đóng" : "+ Tạo Permission"}</button>
      </div>

      {err && <Alert type="err">⚠ {err}</Alert>}
      {showForm && <CreatePermForm onCreated={() => { setShowForm(false); load(); }} />}

      {loading ? <div style={{ color: "#5050a0", padding: "2rem" }}>Đang tải...</div> : (
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>{["#","Tên Permission","Mô tả","Thao tác"].map(h => <th key={h} style={th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {perms.length === 0
                ? <tr><td colSpan={4} style={{ textAlign: "center", padding: "3rem", color: "#4040a0", fontSize: 14 }}>Chưa có permissions</td></tr>
                : perms.map((p, i) => (
                  <tr key={p.name}>
                    <td style={{ ...td, color: "#3a3a70", width: 36 }}>{i + 1}</td>
                    <td style={td}><span style={permTag}>{p.name}</span></td>
                    <td style={{ ...td, color: "#5050a0" }}>{p.description || <span style={{ color: "#3a3a70" }}>—</span>}</td>
                    <td style={td}><button onClick={() => doDelete(p.name)} style={delBtn}>Xóa</button></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function CreatePermForm({ onCreated }) {
  const [form, setForm]     = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr]       = useState("");
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setErr("");
    if (!form.name.trim()) return setErr("Tên permission không được trống");
    setLoading(true);
    try { await AuthService.createPermission(form.name.toUpperCase(), form.description); onCreated(); }
    catch (e) { setErr(e.message); setLoading(false); }
  };

  return (
    <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "1.25rem", marginBottom: 16 }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: "#d0cdee", marginBottom: 14 }}>Tạo Permission mới</div>
      {err && <Alert type="err">⚠ {err}</Alert>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 4 }}>
        <Field label="Tên Permission *"><Input value={form.name} onChange={set("name")} placeholder="READ_REPORT" /></Field>
        <Field label="Mô tả"><Input value={form.description} onChange={set("description")} placeholder="Mô tả..." /></Field>
      </div>
      <Button loading={loading} onClick={submit}>{loading ? "Đang tạo..." : "Tạo Permission"}</Button>
    </div>
  );
}

const addBtn = { padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "1px solid rgba(192,132,252,0.4)", background: "rgba(192,132,252,0.1)", color: "#c084fc", cursor: "pointer", fontFamily: "inherit" };
const th     = { textAlign: "left", fontSize: 11, color: "#4040a0", fontWeight: 600, padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", textTransform: "uppercase", letterSpacing: ".5px" };
const td     = { padding: "11px 14px", fontSize: 13, color: "#c0bee0", borderBottom: "1px solid rgba(255,255,255,0.03)" };
const permTag= { fontSize: 12, padding: "3px 10px", borderRadius: 6, background: "rgba(59,130,246,0.1)", color: "#93c5fd", border: "1px solid rgba(59,130,246,0.2)", fontWeight: 500 };
const delBtn = { padding: "4px 12px", borderRadius: 6, fontSize: 12, border: "1px solid rgba(248,113,113,0.3)", background: "rgba(248,113,113,0.08)", color: "#f87171", cursor: "pointer", fontFamily: "inherit" };
