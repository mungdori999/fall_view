import { useEffect, useRef, useState } from "react";
import { adminRequest } from "./adminApi";

export default function MemberDetailModal({
  id,
  token,
  onClose,
  onSaved,
  onDeleted,
}) {
  const dialog = useRef(null);
  const [member, setMember] = useState(null);
  const [draft, setDraft] = useState({ name: "", gender: "", code: "" });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const element = dialog.current;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      element.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timeout = setTimeout(() => controller.abort(), 15000);
    async function load() {
      try {
        const response = await adminRequest(
          `/member/${encodeURIComponent(id)}`,
          token,
          { signal: controller.signal },
        );
        const data = await response.json();
        if (
          !data ||
          typeof data.name !== "string" ||
          typeof data.code !== "string" ||
          !["MALE", "FEMALE"].includes(data.gender)
        )
          throw new Error("회원 상세 응답 형식을 확인해주세요.");
        if (active) {
          setMember(data);
          setDraft({ name: data.name, gender: data.gender, code: data.code });
        }
      } catch (e) {
        if (active)
          setError(
            e.name === "AbortError" || e instanceof TypeError
              ? "회원 정보를 불러오지 못했습니다. 연결 상태를 확인해주세요."
              : e.message,
          );
      } finally {
        clearTimeout(timeout);
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [id, token, revision]);
  const save = async (event) => {
    event.preventDefault();
    if (saving || !draft.name.trim() || !/^\d{1,6}$/.test(draft.code)) return;
    setSaving(true);
    setError("");
    setSuccess("");
    const values = { ...draft, name: draft.name.trim() };
    try {
      await adminRequest(`/admin/member/${encodeURIComponent(id)}`, token, {
        method: "PUT",
        body: JSON.stringify(values),
      });
      setMember({ ...member, ...values });
      setDraft(values);
      setEditing(false);
      setSuccess("회원 정보가 수정되었습니다.");
      onSaved(id, values);
    } catch (e) {
      setError(
        e instanceof TypeError || e.name === "TimeoutError"
          ? "수정하지 못했습니다. 연결 상태를 확인하고 다시 시도해주세요."
          : e.message,
      );
    } finally {
      setSaving(false);
    }
  };
  const deleteMember = async () => {
    if (deleting || saving) return;
    setDeleting(true);
    setError("");
    setSuccess("");
    try {
      await adminRequest(`/admin/member/${encodeURIComponent(id)}`, token, {
        method: "DELETE",
      });
      onDeleted(id);
    } catch (e) {
      setError(
        e instanceof TypeError || e.name === "TimeoutError"
          ? "삭제 결과를 확인하지 못했습니다. 연결 상태를 확인해주세요."
          : e.message,
      );
    } finally {
      setDeleting(false);
    }
  };
  return (
    <dialog
      ref={dialog}
      className="admin-register-modal member-detail-modal"
      aria-labelledby="member-detail-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!saving && !deleting) onClose();
      }}
    >
      <button
        className="admin-modal-close"
        aria-label="회원 상세 닫기"
        onClick={onClose}
        disabled={saving || deleting}
      >
        ×
      </button>
      <p className="admin-eyebrow">MEMBER INFORMATION</p>
      <h2 id="member-detail-title">
        {editing ? "회원 정보 수정" : "회원 상세"}
      </h2>
      <p className="admin-description">회원 번호 {id}</p>
      {loading ? (
        <p className="member-detail-status" role="status">
          회원 정보를 불러오는 중입니다…
        </p>
      ) : member ? (
        editing ? (
          <form className="admin-form" onSubmit={save} aria-busy={saving}>
            <label htmlFor="detail-name">이름</label>
            <input
              id="detail-name"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              required
              disabled={saving}
            />
            <label htmlFor="detail-gender">성별</label>
            <select
              id="detail-gender"
              value={draft.gender}
              onChange={(e) => setDraft({ ...draft, gender: e.target.value })}
              disabled={saving}
            >
              <option value="MALE">남성</option>
              <option value="FEMALE">여성</option>
            </select>
            <label htmlFor="detail-code">참가 코드</label>
            <input
              id="detail-code"
              value={draft.code}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  code: e.target.value.replace(/\D/g, "").slice(0, 6),
                })
              }
              inputMode="numeric"
              pattern="[0-9]{1,6}"
              maxLength={6}
              required
              disabled={saving}
            />
            <div className="member-detail-actions">
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  setEditing(false);
                  setError("");
                }}
              >
                취소
              </button>
              <button
                className="admin-submit"
                disabled={
                  saving || !draft.name.trim() || !/^\d{1,6}$/.test(draft.code)
                }
              >
                {saving ? "저장 중…" : "저장하기"}
              </button>
            </div>
          </form>
        ) : (
          <>
            <dl className="member-detail-values">
              <div>
                <dt>이름</dt>
                <dd>{member.name}</dd>
              </div>
              <div>
                <dt>성별</dt>
                <dd>{member.gender === "MALE" ? "남성" : "여성"}</dd>
              </div>
              <div>
                <dt>참가 코드</dt>
                <dd>
                  <code>{member.code}</code>
                </dd>
              </div>
            </dl>
            <button
              className="admin-submit"
              disabled={deleting || confirmDelete}
              onClick={() => {
                setDraft({
                  name: member.name,
                  gender: member.gender,
                  code: member.code,
                });
                setEditing(true);
                setError("");
                setSuccess("");
              }}
            >
              수정하기
            </button>
          </>
        )
      ) : (
        <button
          className="admin-register-button"
          onClick={() => {
            setLoading(true);
            setError("");
            setRevision((v) => v + 1);
          }}
        >
          다시 시도
        </button>
      )}
      {member &&
        !editing &&
        !loading &&
        (confirmDelete ? (
          <div className="member-delete-confirm" aria-busy={deleting}>
            <p>
              <strong>{member.name}</strong> 회원을 삭제할까요?
            </p>
            <p>삭제한 회원 정보는 되돌릴 수 없습니다.</p>
            <div className="member-delete-actions">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setConfirmDelete(false)}
              >
                취소
              </button>
              <button
                type="button"
                className="member-delete-button"
                disabled={deleting}
                onClick={deleteMember}
              >
                {deleting ? "삭제 중…" : "삭제 확인"}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="member-delete-button"
            onClick={() => {
              setConfirmDelete(true);
              setError("");
              setSuccess("");
            }}
          >
            삭제하기
          </button>
        ))}
      {error && (
        <p className="admin-error" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="admin-register-success" role="status">
          {success}
        </p>
      )}
    </dialog>
  );
}
