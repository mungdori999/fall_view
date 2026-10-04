import { useState } from "react";
import { API_BASE_URL } from "../../config/api";
import { Link } from "react-router-dom";
import "./AdminLogin.css";
import AdminRegisterModal from "./AdminRegisterModal";

export default function AdminLogin({ onAuthenticated }) {
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState("");
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [invalid, setInvalid] = useState(false);

  const clearError = () => {
    setError("");
    setInvalid(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!loginId.trim() || !password.trim() || isSubmitting) return;
    clearError();
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/login/admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginId: loginId.trim(), password }),
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) {
        setInvalid(response.status === 401);
        setError(
          response.status === 401
            ? "아이디 또는 비밀번호가 올바르지 않습니다."
            : "로그인하지 못했습니다. 잠시 후 다시 시도해주세요.",
        );
        return;
      }
      const data = await response.json();
      onAuthenticated(data.accessToken);
      setPassword("");
    } catch {
      setError(
        "로그인하지 못했습니다. 네트워크 연결과 브라우저 저장 설정을 확인해주세요.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <Link className="admin-brand" to="/">
          <span>다시,</span> 가을
        </Link>
        <span className="admin-header-label">관리자 전용</span>
      </header>
      <section className="admin-card" aria-labelledby="admin-title">
        <div className="admin-emblem" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <rect x="5" y="10" width="14" height="11" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
          </svg>
        </div>
        <p className="admin-eyebrow">RETURN TO FALL · ADMIN</p>
        <h1 id="admin-title">관리자 로그인</h1>
        <p className="admin-description">
          운영을 위해 발급받은 계정으로 로그인해주세요.
        </p>
        <form
          className="admin-form"
          onSubmit={handleSubmit}
          aria-busy={isSubmitting}
        >
          <label htmlFor="admin-login-id">아이디</label>
          <input
            id="admin-login-id"
            name="username"
            autoComplete="username"
            placeholder="관리자 아이디"
            value={loginId}
            onChange={(event) => {
              setLoginId(event.target.value);
              clearError();
            }}
            required
            disabled={isSubmitting}
            aria-invalid={invalid}
            aria-describedby="admin-error"
            autoFocus
          />
          <label htmlFor="admin-password">비밀번호</label>
          <div className="admin-password-wrap">
            <input
              id="admin-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="비밀번호 입력"
              maxLength={72}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                clearError();
              }}
              required
              disabled={isSubmitting}
              aria-invalid={invalid}
              aria-describedby="admin-error"
            />
            <button
              className="admin-password-toggle"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
              aria-pressed={showPassword}
            >
              {showPassword ? "숨기기" : "보기"}
            </button>
          </div>
          <div className="admin-feedback">
            <p
              id="admin-error"
              className={error ? "admin-error" : ""}
              role="alert"
              aria-atomic="true"
            >
              {error}
            </p>
          </div>
          <button
            className="admin-submit"
            type="submit"
            disabled={!loginId.trim() || !password.trim() || isSubmitting}
          >
            {isSubmitting ? "로그인 중…" : "로그인"}
            <span aria-hidden="true">→</span>
          </button>
        </form>
        {registerSuccess && <p className="admin-register-success" role="status">{registerSuccess}</p>}
        <button type="button" className="admin-register-button" disabled={isSubmitting}
          onClick={() => {setRegisterSuccess(""); setRegisterOpen(true);}}>관리자 회원가입</button>
        <Link className="admin-back" to="/">
          ← 참가자 입장 화면으로
        </Link>
      </section>
      {registerOpen && <AdminRegisterModal onClose={() => setRegisterOpen(false)} onRegistered={id => {
        setRegisterOpen(false); setLoginId(id); setPassword(""); clearError();
        setRegisterSuccess("회원가입이 완료되었습니다. 로그인해주세요.");
      }} />}
      <footer className="admin-footer">우리들교회 BRANDNEW · 다시, 가을</footer>
    </main>
  );
}
