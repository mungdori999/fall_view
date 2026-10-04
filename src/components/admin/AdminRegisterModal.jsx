import { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../../config/api";

export default function AdminRegisterModal({ onClose, onRegistered, token }) {
  const dialog = useRef(null);
  const request = useRef(null);
  const [name, setName] = useState("");
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement;
    const overflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      request.current?.abort();
      element.close();
      document.body.style.overflow = overflow;
      previousFocus?.focus();
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (
      pending ||
      !name.trim() ||
      !loginId.trim() ||
      !password.trim() ||
      !code.trim()
    )
      return;
    setPending(true);
    setError("");
    const controller = new AbortController();
    request.current = controller;
    const timeout = setTimeout(() => controller.abort("timeout"), 15000);
    try {
      const response = await fetch(`${API_BASE_URL}/admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: name.trim(),
          loginId: loginId.trim(),
          password,
          code: code.trim(),
        }),
        signal: controller.signal,
      });
      if (!response.ok) {
        const messages = {
          400: "입력 정보를 확인해주세요.",
          401: "인증코드를 확인해주세요.",
          403: "가입 권한 또는 인증코드를 확인해주세요.",
          409: "이미 사용 중인 아이디입니다.",
        };
        setError(
          messages[response.status] ||
            "회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.",
        );
        return;
      }
      onRegistered(loginId.trim());
    } catch {
      if (
        !controller.signal.aborted ||
        controller.signal.reason === "timeout"
      ) {
        setError(
          "서버에 연결하지 못했습니다. 연결 상태를 확인하고 다시 시도해주세요.",
        );
      }
    } finally {
      clearTimeout(timeout);
      if (!controller.signal.aborted || controller.signal.reason === "timeout")
        setPending(false);
    }
  };

  return (
    <dialog
      ref={dialog}
      className="admin-register-modal"
      aria-labelledby="register-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!pending) onClose();
      }}
    >
      <button
        className="admin-modal-close"
        type="button"
        onClick={onClose}
        disabled={pending}
        aria-label="회원가입 닫기"
      >
        ×
      </button>
      <p className="admin-eyebrow">RETURN TO FALL · ADMIN</p>
      <h2 id="register-title">관리자 회원가입</h2>
      <p className="admin-description">
        계정 정보와 전달받은 인증코드를 입력해주세요.
      </p>
      <form className="admin-form" onSubmit={handleSubmit} aria-busy={pending}>
        <label htmlFor="register-name">이름</label>
        <input
          id="register-name"
          autoComplete="name"
          placeholder="본인 이름"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
          required
          disabled={pending}
          autoFocus
        />
        <label htmlFor="register-id">아이디</label>
        <input
          id="register-id"
          autoComplete="username"
          placeholder="사용할 아이디"
          value={loginId}
          onChange={(e) => {
            setLoginId(e.target.value);
            setError("");
          }}
          required
          disabled={pending}
        />
        <label htmlFor="register-password">비밀번호</label>
        <input
          id="register-password"
          type="password"
          autoComplete="new-password"
          placeholder="비밀번호 입력"
          maxLength={72}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
          required
          disabled={pending}
        />
        <label htmlFor="register-code">인증코드</label>
        <input
          id="register-code"
          autoComplete="one-time-code"
          placeholder="전달받은 인증코드"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setError("");
          }}
          required
          disabled={pending}
        />
        <div className="admin-feedback">
          <p role="alert" className={error ? "admin-error" : ""}>
            {error}
          </p>
        </div>
        <button
          className="admin-submit"
          type="submit"
          disabled={
            pending ||
            !name.trim() ||
            !loginId.trim() ||
            !password.trim() ||
            !code.trim()
          }
        >
          {pending ? "가입 중…" : "회원가입"}
        </button>
      </form>
    </dialog>
  );
}
