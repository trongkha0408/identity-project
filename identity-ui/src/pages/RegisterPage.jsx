import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { AuthCard, Field, Input, Button, Alert, SwitchRow, TextLink } from "../components/ui";

export default function RegisterPage({ onNavigate }) {
  const { register, loading } = useAuth();
  const [form, setForm] = useState({ username: "", password: "", firstName: "", lastName: "", email: "", dob: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    setError("");
    if (!form.username || !form.password || !form.firstName || !form.lastName || !form.email)
      return setError("Vui lòng điền đầy đủ thông tin bắt buộc (*)");
    if (form.username.length < 4) return setError("Username tối thiểu 4 ký tự");
    if (form.password.length < 6) return setError("Mật khẩu tối thiểu 6 ký tự");
    const payload = { ...form };
    if (!payload.dob) delete payload.dob; // dob optional
    const res = await register(payload);
    if (res.ok) setSuccess(true);
    else setError(res.error);
  };

  if (success) return (
    <AuthCard>
      <div style={{ textAlign: "center", padding: "1rem 0" }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>📬</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: "#f0eeff", marginBottom: 8 }}>Đăng ký thành công!</div>
        <div style={{ fontSize: 14, color: "#7070a0", marginBottom: 24, lineHeight: 1.7 }}>
          Tài khoản <strong style={{ color: "#c084fc" }}>{form.username}</strong> đã được tạo.<br />
          Kiểm tra <strong style={{ color: "#c084fc" }}>{form.email}</strong> để lấy mã xác thực.
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <TextLink onClick={() => onNavigate("verify")}>Xác thực email →</TextLink>
        </div>
      </div>
    </AuthCard>
  );

  return (
    <AuthCard title="Tạo tài khoản" subtitle="Điền thông tin để đăng ký">
      {error && <Alert type="err">⚠ {error}</Alert>}
      <Field label="Username *"><Input value={form.username} onChange={set("username")} placeholder="john_doe (≥ 4 ký tự)" /></Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Họ *"><Input value={form.firstName} onChange={set("firstName")} placeholder="Nguyễn" /></Field>
        <Field label="Tên *"><Input value={form.lastName} onChange={set("lastName")} placeholder="Văn A" /></Field>
      </div>
      <Field label="Email *"><Input type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" /></Field>
      <Field label="Ngày sinh"><Input type="date" value={form.dob} onChange={set("dob")} /></Field>
      <Field label="Mật khẩu *">
        <Input type="password" value={form.password} onChange={set("password")}
          placeholder="•••••• (≥ 6 ký tự)" onKeyDown={e => e.key === "Enter" && handleSubmit()} />
      </Field>
      <Button loading={loading} onClick={handleSubmit}>{loading ? "Đang tạo..." : "Đăng ký"}</Button>
      <SwitchRow>Đã có tài khoản? <TextLink onClick={() => onNavigate("login")}>Đăng nhập</TextLink></SwitchRow>
    </AuthCard>
  );
}
