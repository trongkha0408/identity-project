import { useState, useEffect, useCallback } from "react";
import AuthService from "../../services/auth.service";
import { Alert, RoleBadge, Field, Input, Button } from "../../components/ui";

const COLORS = ["#c084fc","#818cf8","#38bdf8","#34d399","#fb923c"];

export default function UsersTab() {
  const [pageData, setPageData] = useState({ data: [], currentPage: 0, totalPages: 0, totalElements: 0 });
  const [loading, setLoading]   = useState(true);
  const [err, setErr]           = useState("");
  const [page, setPage]         = useState(0);
  const [keyword, setKeyword]   = useState("");
  const [search, setSearch]     = useState("");
  const [modal, setModal]       = useState(null); // { type: "roles"|"detail"|"delete", user }

  const load = useCallback(async (p, kw) => {
    setLoading(true); setErr("");
    try { setPageData(await AuthService.getUsers(p, 10, kw)); }
    catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(page, search); }, [page, search]);

  const doSearch = () => { setPage(0); setSearch(keyword); };
  const doDelete = async (userId) => {
    try { await AuthService.deleteUser(userId); load(page, search); }
    catch (e) { setErr(e.message); }
    finally { setModal(null); }
  };

  const users = pageData.data ?? [];

  return (
    <>
      {/* Search */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input value={keyword} onChange={e => setKeyword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && doSearch()}
          placeholder="🔍  Tìm theo username, họ, tên..."
          style={{ flex: 1, padding: "9px 14px", borderRadius: 9, fontSize: 14, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "#e8e6f0", outline: "none", fontFamily: "inherit" }} />
        <button onClick={doSearch} style={searchBtn}>Tìm kiếm</button>
        {search && <button onClick={() => { setKeyword(""); setSearch(""); setPage(0); }} style={{ ...searchBtn, background: "rgba(255,255,255,0.06)", color: "#a0a0b8" }}>✕ Xóa</button>}
      </div>

      {err && <Alert type="err">⚠ {err}</Alert>}

      {/* Table */}
      <div style={tableCard}>
        {loading ? <Loading /> : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>{["#","Username","Họ tên","Ngày sinh","Roles","Thao tác"].map(h => <th key={h} style={th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {users.length === 0
                ? <tr><td colSpan={6} style={{ textAlign: "center", padding: "3rem", color: "#4040a0", fontSize: 14 }}>Không có dữ liệu{search ? ` cho "${search}"` : ""}</td></tr>
                : users.map((u, i) => {
                  const roles = u.roles?.map(r => r.name).join(", ") || "—";
                  const color = COLORS[(page * 10 + i) % COLORS.length];
                  return (
                    <tr key={u.id} style={{ transition: "background .1s" }}>
                      <td style={{ ...td, color: "#3a3a70", width: 36 }}>{page * 10 + i + 1}</td>
                      <td style={td}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <div style={{ width: 30, height: 30, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, marginRight: 10, background: color + "22", color, border: `1px solid ${color}44`, flexShrink: 0 }}>
                            {(u.username || "?")[0].toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500 }}>{u.username}</div>
                            <div style={{ fontSize: 11, color: "#4040a0" }}>{u.id?.substring(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td style={td}>{`${u.firstName || ""} ${u.lastName || ""}`.trim() || <span style={{ color: "#3a3a70" }}>—</span>}</td>
                      <td style={{ ...td, color: "#5050a0" }}>{u.dob || "—"}</td>
                      <td style={td}><RoleBadge role={roles} /></td>
                      <td style={td}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <ABtn color="#818cf8" onClick={() => setModal({ type: "detail", user: u })}>Chi tiết</ABtn>
                          <ABtn color="#34d399" onClick={() => setModal({ type: "roles", user: u })}>Roles</ABtn>
                          <ABtn color="#f87171" onClick={() => setModal({ type: "delete", user: u })}>Xóa</ABtn>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
        <div style={{ fontSize: 13, color: "#4040a0" }}>
          Tổng <strong style={{ color: "#8080c0" }}>{pageData.totalElements}</strong> users
          {search && <span style={{ color: "#5050a0" }}> — tìm: "{search}"</span>}
        </div>
        {pageData.totalPages > 1 && (
          <div style={{ display: "flex", gap: 5 }}>
            <PBtn disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Trước</PBtn>
            {Array.from({ length: Math.min(pageData.totalPages, 7) }, (_, i) => (
              <PBtn key={i} active={i === page} onClick={() => setPage(i)}>{i + 1}</PBtn>
            ))}
            <PBtn disabled={page >= pageData.totalPages - 1} onClick={() => setPage(p => p + 1)}>Sau →</PBtn>
          </div>
        )}
      </div>

      {/* Modals */}
      {modal?.type === "detail" && <DetailModal user={modal.user} onClose={() => setModal(null)} />}
      {modal?.type === "roles"  && <RolesModal  user={modal.user} onClose={() => setModal(null)} onSaved={() => { setModal(null); load(page, search); }} />}
      {modal?.type === "delete" && (
        <ConfirmModal
          title="Xóa người dùng"
          message={<>Xóa <strong style={{ color: "#c084fc" }}>{modal.user.username}</strong>? Hành động không thể hoàn tác.</>}
          onCancel={() => setModal(null)}
          onConfirm={() => doDelete(modal.user.id)}
        />
      )}
    </>
  );
}

// ── Detail Modal ──────────────────────────────────────────────────────────────
function DetailModal({ user, onClose }) {
  const rows = [
    ["ID",        user.id],
    ["Username",  user.username],
    ["Họ",        user.firstName || "—"],
    ["Tên",       user.lastName  || "—"],
    ["Ngày sinh", user.dob       || "—"],
    ["Roles",     user.roles?.map(r => r.name).join(", ") || "—"],
  ];
  return (
    <Modal title={`Chi tiết: ${user.username}`} onClose={onClose}>
      {rows.map(([k, v]) => (
        <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 13 }}>
          <span style={{ color: "#7070a0" }}>{k}</span>
          <span style={{ color: "#e0ddf5", wordBreak: "break-all", maxWidth: 220, textAlign: "right" }}>{v}</span>
        </div>
      ))}
      {user.roles?.length > 0 && (
        <>
          <div style={{ fontSize: 12, color: "#5050a0", marginTop: 14, marginBottom: 8, textTransform: "uppercase", letterSpacing: ".5px" }}>Permissions</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {user.roles.flatMap(r => r.permissions ?? []).map(p => (
              <span key={p.name} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 5, background: "rgba(59,130,246,0.12)", color: "#93c5fd", border: "1px solid rgba(59,130,246,0.2)" }}>{p.name}</span>
            ))}
            {user.roles.flatMap(r => r.permissions ?? []).length === 0 && <span style={{ fontSize: 12, color: "#3a3a70" }}>Không có</span>}
          </div>
        </>
      )}
      <div style={{ marginTop: 20, textAlign: "right" }}>
        <button onClick={onClose} style={cancelBtn}>Đóng</button>
      </div>
    </Modal>
  );
}

// ── Roles Modal ───────────────────────────────────────────────────────────────
function RolesModal({ user, onClose, onSaved }) {
  const [allRoles, setAllRoles] = useState([]);
  const [selected, setSelected] = useState(new Set(user.roles?.map(r => r.name) ?? []));
  const [loading, setLoading]   = useState(false);
  const [err, setErr]           = useState("");

  useEffect(() => { AuthService.getRoles().then(setAllRoles).catch(e => setErr(e.message)); }, []);

  const toggle = name => setSelected(s => { const n = new Set(s); n.has(name) ? n.delete(name) : n.add(name); return n; });

  const save = async () => {
    setLoading(true); setErr("");
    try { await AuthService.updateUserRoles(user.id, [...selected]); onSaved(); }
    catch (e) { setErr(e.message); setLoading(false); }
  };

  return (
    <Modal title={`Gán Roles: ${user.username}`} onClose={onClose}>
      {err && <Alert type="err">⚠ {err}</Alert>}
      <div style={{ marginBottom: 16 }}>
        {allRoles.length === 0 && !err && <div style={{ color: "#5050a0", fontSize: 13 }}>Đang tải roles...</div>}
        {allRoles.map(r => (
          <label key={r.name} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", cursor: "pointer" }}>
            <input type="checkbox" checked={selected.has(r.name)} onChange={() => toggle(r.name)}
              style={{ width: 15, height: 15, accentColor: "#c084fc", marginTop: 2, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 14, color: "#e0ddf5", fontWeight: 600 }}>{r.name}</div>
              {r.description && <div style={{ fontSize: 12, color: "#5050a0" }}>{r.description}</div>}
              {r.permissions?.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
                  {[...r.permissions].map(p => <span key={p.name} style={{ fontSize: 10, padding: "1px 6px", borderRadius: 4, background: "rgba(59,130,246,0.1)", color: "#93c5fd" }}>{p.name}</span>)}
                </div>
              )}
            </div>
          </label>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button onClick={onClose} style={cancelBtn}>Hủy</button>
        <button onClick={save} disabled={loading} style={saveBtn}>{loading ? "Đang lưu..." : "Lưu"}</button>
      </div>
    </Modal>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "1rem" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#17171f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "1.75rem", width: "100%", maxWidth: 440, maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#f0eeff" }}>{title}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#5050a0", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ConfirmModal({ title, message, onCancel, onConfirm }) {
  return (
    <Modal title={title} onClose={onCancel}>
      <div style={{ fontSize: 14, color: "#a0a0c0", marginBottom: 24, lineHeight: 1.7 }}>{message}</div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button onClick={onCancel} style={cancelBtn}>Hủy</button>
        <button onClick={onConfirm} style={{ ...saveBtn, background: "rgba(248,113,113,0.8)" }}>Xóa</button>
      </div>
    </Modal>
  );
}

function Loading() { return <div style={{ padding: "3rem", textAlign: "center", color: "#5050a0" }}>Đang tải...</div>; }
function ABtn({ children, onClick, color }) {
  return <button onClick={onClick} style={{ padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 500, border: `1px solid ${color}33`, background: color + "12", color, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>{children}</button>;
}
function PBtn({ children, onClick, disabled, active }) {
  return <button onClick={onClick} disabled={disabled} style={{ padding: "5px 10px", borderRadius: 6, fontSize: 13, border: "1px solid rgba(255,255,255,0.08)", fontFamily: "inherit", background: active ? "rgba(192,132,252,0.2)" : "transparent", color: active ? "#c084fc" : disabled ? "#2a2a60" : "#a0a0b8", cursor: disabled ? "not-allowed" : "pointer" }}>{children}</button>;
}

const tableCard = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, overflow: "hidden", marginBottom: 10 };
const searchBtn = { padding: "9px 18px", borderRadius: 9, fontSize: 14, fontWeight: 600, background: "rgba(192,132,252,0.8)", color: "#fff", border: "none", cursor: "pointer", fontFamily: "inherit" };
const th = { textAlign: "left", fontSize: 11, color: "#4040a0", fontWeight: 600, padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", textTransform: "uppercase", letterSpacing: ".5px" };
const td = { padding: "12px 14px", fontSize: 13, color: "#c0bee0", borderBottom: "1px solid rgba(255,255,255,0.03)" };
const cancelBtn = { padding: "8px 18px", borderRadius: 8, fontSize: 14, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#a0a0b8", cursor: "pointer", fontFamily: "inherit" };
const saveBtn   = { padding: "8px 18px", borderRadius: 8, fontSize: 14, fontWeight: 600, border: "none", background: "rgba(192,132,252,0.8)", color: "#fff", cursor: "pointer", fontFamily: "inherit" };
