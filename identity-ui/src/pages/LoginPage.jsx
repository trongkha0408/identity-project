import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { AuthCard, Field, Input, Button, Alert, SwitchRow, TextLink } from "../components/ui";

export default function LoginPage({ onNavigate }) {
  const { login, loading } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!username || !password) return setError("Vui lòng nhập username và mật khẩu");
    const res = await login(username, password);
    if (!res.ok) setError(res.error);
  };

  return (
    <AuthCard title="Chào mừng trở lại 👋" subtitle="Đăng nhập để tiếp tục">
      {error && <Alert type="err">⚠ {error}</Alert>}
      <Field label="Username">
        <Input value={username} onChange={e => setUsername(e.target.value)}
          placeholder="admin" onKeyDown={e => e.key === "Enter" && handleSubmit()} autoFocus />
      </Field>
      <Field label="Mật khẩu">
        <Input type="password" value={password} onChange={e => setPassword(e.target.value)}
          placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handleSubmit()} />
      </Field>
      <Button loading={loading} onClick={handleSubmit}>
        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
      </Button>
      <SwitchRow>
        Chưa có tài khoản?{" "}
        <TextLink onClick={() => onNavigate("register")}>Đăng ký ngay</TextLink>
      </SwitchRow>
      <SwitchRow>
        Quên mật khẩu?{" "}
        <TextLink onClick={() => onNavigate("forgot")}>Lấy lại mật khẩu</TextLink>
      </SwitchRow>
    </AuthCard>
  );
}
