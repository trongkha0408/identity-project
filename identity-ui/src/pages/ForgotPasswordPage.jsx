import { useState } from "react";
import AuthService from "../services/auth.service";
import { AuthCard, Field, Input, Button, Alert, SwitchRow, TextLink } from "../components/ui";

// Step 1: nhập email → gửi code
// Step 2: nhập email + code + newPassword → reset
export default function ForgotPasswordPage({ onNavigate }) {
  const [step, setStep]     = useState(1);
  const [email, setEmail]   = useState("");
  const [code, setCode]     = useState("");
  const [newPw, setNewPw]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const [done, setDone]     = useState(false);

  const sendCode = async () => {
    setError("");
    if (!email) return setError("Vui lòng nhập email");
    setLoading(true);
    try { await AuthService.forgotPassword(email); setStep(2); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const resetPw = async () => {
    setError("");
    if (!code || !newPw) return setError("Vui lòng điền đầy đủ");
    if (newPw.length < 6) return setError("Mật khẩu tối thiểu 6 ký tự");
    setLoading(true);
    try { await AuthService.resetPassword(email, code, newPw); setDone(true); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  if (done) return (
    <AuthCard>
      <div style={{ textAlign: "center", padding: "1rem 0" }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🔓</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: "#f0eeff", marginBottom: 8 }}>Đặt lại thành công!</div>
        <div style={{ fontSize: 14, color: "#7070a0", marginBottom: 24 }}>Mật khẩu của bạn đã được cập nhật.</div>
        <TextLink onClick={() => onNavigate("login")}>Đăng nhập ngay →</TextLink>
      </div>
    </AuthCard>
  );

  return (
    <AuthCard
      title={step === 1 ? "Quên mật khẩu 🔑" : "Đặt lại mật khẩu"}
      subtitle={step === 1 ? "Nhập email để nhận mã xác thực" : `Mã đã gửi đến ${email}`}
    >
      {error && <Alert type="err">⚠ {error}</Alert>}

      {step === 1 ? (
        <>
          <Field label="Email">
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" onKeyDown={e => e.key === "Enter" && sendCode()} />
          </Field>
          <Button loading={loading} onClick={sendCode}>{loading ? "Đang gửi..." : "Gửi mã xác thực"}</Button>
        </>
      ) : (
        <>
          <Field label="Mã xác thực (6 số)">
            <Input value={code} onChange={e => setCode(e.target.value)} placeholder="123456" maxLength={6} />
          </Field>
          <Field label="Mật khẩu mới">
            <Input type="password" value={newPw} onChange={e => setNewPw(e.target.value)}
              placeholder="•••••• (≥ 6 ký tự)" onKeyDown={e => e.key === "Enter" && resetPw()} />
          </Field>
          <Button loading={loading} onClick={resetPw}>{loading ? "Đang đặt lại..." : "Đặt lại mật khẩu"}</Button>
          <div style={{ marginTop: 10 }}>
            <TextLink onClick={() => { setStep(1); setError(""); }}>← Nhập lại email</TextLink>
          </div>
        </>
      )}
      <SwitchRow><TextLink onClick={() => onNavigate("login")}>← Quay lại đăng nhập</TextLink></SwitchRow>
    </AuthCard>
  );
}
