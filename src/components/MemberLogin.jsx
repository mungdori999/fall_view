import { useState } from "react";
import { API_BASE_URL } from "../config/api";

function MemberLogin({ onAuthenticated }) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isLoginInvalid, setIsLoginInvalid] = useState(false);

  const handleCodeChange = (event) => {
    const numbers = event.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(numbers);

    setError("");
    setIsLoginInvalid(false);
  };

  const canSubmit = name.trim().length > 0 && /^\d{1,6}$/.test(code);

  const handleNameChange = (event) => {
    setName(event.target.value);
    setError("");
    setIsLoginInvalid(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit || isSubmitting) return;
    setIsSubmitting(true);
    setError("");
    setIsLoginInvalid(false);

    try {
      const response = await fetch(`${API_BASE_URL}/login/member`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), code }),
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) {
        setIsLoginInvalid(response.status === 401);
        setError(
          response.status === 401
            ? "이름 또는 코드가 올바르지 않아요. 다시 확인해주세요."
            : "입장하지 못했어요. 잠시 후 다시 시도해주세요.",
        );
        return;
      }
      const data = await response.json();
      if (typeof data.accessToken !== "string" || !data.accessToken.trim()) {
        throw new Error("Missing access token");
      }
      onAuthenticated(data.accessToken);
    } catch {
      setError(
        "입장하지 못했어요. 네트워크 연결과 브라우저 저장 설정을 확인하고 다시 시도해주세요.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="welcome-shell">
      <div className="welcome-leaves" aria-hidden="true"></div>
      <section className="welcome-content">
        <p className="eyebrow">우리들교회 BRANDNEW</p>

        <p className="welcome-small">다시 만나게 된, 우리들의 계절</p>
        <h1>
          <span>다시,</span> 가을
        </h1>
        <p className="welcome-copy">
          본인 이름과 부여받은 참가 번호를 입력해주세요.
        </p>
        <form onSubmit={handleSubmit} aria-busy={isSubmitting}>
          <label className="code-label" htmlFor="participant-name">
            이름
          </label>
          <div
            className={`code-input-wrap name-input-wrap${isLoginInvalid ? " code-input-wrap--error" : ""}`}
          >
            <input
              id="participant-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={handleNameChange}
              placeholder="본인 이름"
              required
              disabled={isSubmitting}
              aria-describedby="login-error"
              aria-invalid={isLoginInvalid}
              autoFocus
            />
            <span className="code-line" aria-hidden="true" />
          </div>
          <label
            className="code-label participant-code-label"
            htmlFor="participant-code"
          >
            코드
          </label>
          <div
            className={`code-input-wrap${isLoginInvalid ? " code-input-wrap--error" : ""}`}
          >
            <input
              id="participant-code"
              type="tel"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={handleCodeChange}
              placeholder="000000"
              maxLength={6}
              pattern="[0-9]{1,6}"
              required
              disabled={isSubmitting}
              aria-describedby="code-hint login-error"
              aria-invalid={isLoginInvalid}
            />
            <span className="code-line" aria-hidden="true" />
          </div>
          <p className="code-hint" id="code-hint">
            부여받은 6자리 코드를 입력해주세요.
          </p>
          <div className="login-feedback">
            <p
              className={`login-error${error ? " login-error--visible" : ""}`}
              id="login-error"
              role="alert"
              aria-atomic="true"
            >
              {error && (
                <>
                  <span className="login-error-icon" aria-hidden="true">
                    !
                  </span>
                  <span>{error}</span>
                </>
              )}
            </p>
          </div>
          <button
            className={`enter-button${isSubmitting ? " enter-button--loading" : ""}`}
            type="submit"
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? "확인 중…" : "입장하기"}
            {isSubmitting ? (
              <span className="login-spinner" aria-hidden="true" />
            ) : (
              <span aria-hidden="true">→</span>
            )}
          </button>
        </form>
      </section>
      <footer className="welcome-footer">RETURN TO FALL </footer>
    </main>
  );
}

export default MemberLogin;
