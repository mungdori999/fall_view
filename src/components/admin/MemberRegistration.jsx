import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { adminRequest } from "./adminApi";
export default function MemberRegistration() {
  const { token } = useOutletContext();
  const navigate = useNavigate();
  const onList = () => navigate("/admin/members");
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const valid = name.trim() && gender && /^\d{1,6}$/.test(code);
  const submit = async (event) => {
    event.preventDefault();
    if (!valid || pending) return;
    setPending(true);
    setError("");
    setSuccess("");
    try {
      await adminRequest("/admin/member", token, {
        method: "POST",
        body: JSON.stringify({ name: name.trim(), gender, code }),
      });
      setSuccess(`${name.trim()} 회원이 등록되었습니다.`);
      setName("");
      setGender("");
      setCode("");
    } catch (e) {
      setError(
        e.name === "TimeoutError" || e instanceof TypeError
          ? "서버에 연결하지 못했습니다. 연결 상태를 확인해주세요."
          : e.message,
      );
    } finally {
      setPending(false);
    }
  };
  return (
    <div className="management-register-grid">
      <section className="management-panel">
        <h2>참가자 개별 등록</h2>
        <p className="management-muted">모든 항목을 입력해주세요.</p>
        <form className="management-form" onSubmit={submit} aria-busy={pending}>
          <label htmlFor="member-name">이름</label>
          <input
            id="member-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="참가자 이름"
            required
            disabled={pending}
          />
          <fieldset disabled={pending}>
            <legend>성별</legend>
            <div className="management-genders">
              {[
                ["MALE", "남성"],
                ["FEMALE", "여성"],
              ].map(([value, label]) => (
                <label key={value}>
                  <input
                    type="radio"
                    name="gender"
                    value={value}
                    checked={gender === value}
                    onChange={(e) => setGender(e.target.value)}
                    required
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          <label htmlFor="member-code">참가 코드</label>
          <input
            id="member-code"
            value={code}
            onChange={(e) =>
              setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            placeholder="최대 6자리 숫자"
            inputMode="numeric"
            maxLength={6}
            pattern="[0-9]{1,6}"
            required
            disabled={pending}
            aria-describedby="member-code-help"
          />
          <p id="member-code-help" className="management-muted">
            앞자리 0을 포함한 입력값 그대로 등록됩니다.
          </p>
          {error && (
            <p className="admin-error" role="alert">
              {error}
            </p>
          )}
          {success && (
            <div className="admin-register-success" role="status">
              {success}{" "}
              <button type="button" onClick={onList}>
                목록에서 확인 →
              </button>
            </div>
          )}
          <div className="management-actions">
            <button type="button" onClick={onList} disabled={pending}>
              목록으로
            </button>
            <button className="management-primary" disabled={!valid || pending}>
              {pending ? "등록 중…" : "개별 등록"}
            </button>
          </div>
        </form>
      </section>
      <aside className="management-note">
        <span>안내</span>
        <h2>입장에 필요한 정보</h2>
        <p>참가자는 등록된 이름과 참가 코드로 로그인합니다.</p>
        <p>등록을 마친 뒤 해당 참가자에게 이름과 코드를 전달해주세요.</p>
      </aside>
    </div>
  );
}
