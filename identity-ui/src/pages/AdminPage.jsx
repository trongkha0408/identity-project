import { useState } from "react";
import UsersTab from "./admin/UsersTab";
import RolesTab from "./admin/RolesTab";
import PermissionsTab from "./admin/PermissionsTab";

const TABS = [["users","👥 Users"],["roles","🛡 Roles"],["permissions","🔑 Permissions"]];

export default function AdminPage() {
  const [tab, setTab] = useState("users");
  return (
    <div style={{ padding: "2.5rem" }}>
      <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 6, color: "#f0eeff" }}>Quản trị hệ thống</div>
      <div style={{ fontSize: 15, color: "#7070a0", marginBottom: 24 }}>Quản lý users, roles và permissions</div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: 4, width: "fit-content" }}>
        {TABS.map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            padding: "7px 20px", borderRadius: 7, fontSize: 14, fontWeight: 500,
            border: "none", cursor: "pointer", fontFamily: "inherit",
            background: tab === id ? "rgba(192,132,252,0.2)" : "transparent",
            color: tab === id ? "#c084fc" : "#7070a0",
          }}>{label}</button>
        ))}
      </div>

      {tab === "users"       && <UsersTab />}
      {tab === "roles"       && <RolesTab />}
      {tab === "permissions" && <PermissionsTab />}
    </div>
  );
}
