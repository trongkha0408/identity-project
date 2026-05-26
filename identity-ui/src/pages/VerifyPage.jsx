import { useState } from "react";
import AuthService from "../services/auth.service";
import { AuthCard, Field, Input, Button, Alert, SwitchRow, TextLink } from "../components/ui";

export default function VerifyPage({ onNavigate }) {
  const [email, setEmail] = useState("");
  const [code, setCode]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!email || !code) return setError("Vui lòng nhập email và mã xác thực");
    setLoading(true);
    try { await AuthService.verifyEmail(email, code); setSuccess(true); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  if (success) return (
    <AuthCard>
      <div style={{ textAlign: "center", padding: "1rem 0" }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: "#f0eeff", marginBottom: 8 }}>Xác thực thành công!</div>
        <div style={{ fontSize: 14, color: "#7070a0", marginBottom: 24 }}>Email đã được xác thực. Bạn có thể đăng nhập.</div>
        <TextLink onClick={() => onNavigate("login")}>Đăng nhập ngay →</TextLink>
      </div>
    </AuthCard>
  );

  return (
    <AuthCard title="Xác thực email ✉️" subtitle="Nhập mã 6 số được gửi đến email của bạn">
      {error && <Alert type="err">⚠ {error}</Alert>}
      <Field label="Email"><Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></Field>
      <Field label="Mã xác thực (6 số)">
        <Input value={code} onChange={e => setCode(e.target.value)} placeholder="123456" maxLength={6}
          onKeyDown={e => e.key === "Enter" && handleSubmit()} />
      </Field>
      <Button loading={loading} onClick={handleSubmit}>{loading ? "Đang xác thực..." : "Xác thực email"}</Button>
      <SwitchRow><TextLink onClick={() => onNavigate("login")}>← Quay lại đăng nhập</TextLink></SwitchRow>
    </AuthCard>
  );
}
