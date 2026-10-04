import { useRef, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { adminRequest } from "./adminApi";

function MemberBulkRegistration() {
  const { token } = useOutletContext();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef(null);

  const selectFile = (nextFile) => {
    if (nextFile && !nextFile.name.toLowerCase().endsWith(".xlsx")) {
      setFile(null);
      setError(".xlsx 형식의 엑셀 파일만 업로드할 수 있습니다.");
      return;
    }
    setFile(nextFile);
    setError("");
    setSuccess("");
  };

  const handleFileChange = (event) => selectFile(event.target.files?.[0] || null);

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    if (!pending) selectFile(event.dataTransfer.files?.[0] || null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file || pending) return;

    setPending(true);
    setError("");
    setSuccess("");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await adminRequest("/admin/member/bulk", token, {
        method: "POST",
        body: formData,
      });
      const { registeredCount } = await response.json();
      setSuccess(`${registeredCount}명의 참가자를 등록했습니다.`);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setPending(false);
    }
  };

  const handleDownloadTemplate = async () => {
    setError("");
    try {
      const response = await adminRequest("/admin/member/template", token, { method: "GET" });
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = "member-import-template.xlsx";
      link.click();
      URL.revokeObjectURL(url);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="management-register-grid">
      <section className="management-panel">
        <h2>엑셀 파일 업로드</h2>
        <p className="management-muted">첫 번째 시트의 첫 행은 헤더여야 합니다.</p>
        <form className="management-form" onSubmit={handleSubmit} aria-busy={pending}>
          <label>참가자 목록 파일</label>
          <input ref={fileInputRef} id="member-excel-file" className="bulk-file-input" type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={handleFileChange} disabled={pending} />
          <div
            className={`bulk-dropzone${isDragging ? " bulk-dropzone--dragging" : ""}${file ? " bulk-dropzone--selected" : ""}`}
            role="button"
            tabIndex={pending ? -1 : 0}
            onClick={() => !pending && fileInputRef.current?.click()}
            onKeyDown={(event) => {
              if ((event.key === "Enter" || event.key === " ") && !pending) fileInputRef.current?.click();
            }}
            onDragEnter={(event) => { event.preventDefault(); if (!pending) setIsDragging(true); }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            aria-label="엑셀 파일 업로드"
          >
            {file ? <>
              <span className="bulk-file-icon" aria-hidden="true">✓</span>
              <div><strong>{file.name}</strong><small>{Math.ceil(file.size / 1024).toLocaleString()} KB · 업로드 준비 완료</small></div>
              <button type="button" className="bulk-file-remove" onClick={(event) => { event.stopPropagation(); selectFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} disabled={pending}>제거</button>
            </> : <>
              <span className="bulk-upload-icon" aria-hidden="true">↑</span>
              <div><strong>엑셀 파일을 끌어다 놓으세요</strong><small>또는 클릭해서 파일 선택</small></div>
              <span className="bulk-file-format">.XLSX</span>
            </>}
          </div>
          <div className="bulk-format-guide">
            <strong>필수 컬럼</strong>
            <p>이름 · 성별 · 코드</p>
            <small>성별: 남성 또는 여성 / 코드: 숫자 6자리</small>
            <button type="button" className="bulk-template-download" onClick={handleDownloadTemplate}>예시 엑셀 다운로드 ↓</button>
          </div>
          {error && <p className="admin-error" role="alert">{error}</p>}
          {success && <div className="admin-register-success" role="status">{success} <button type="button" onClick={() => navigate("/admin/members")}>목록에서 확인 →</button></div>}
          <div className="management-actions">
            <button type="button" onClick={() => navigate("/admin/members")} disabled={pending}>목록으로</button>
            <button className="management-primary" disabled={!file || pending}>{pending ? "등록 중…" : "일괄 등록"}</button>
          </div>
        </form>
      </section>
      <aside className="management-note">
        <span>엑셀 작성 안내</span>
        <h2>한 행에 한 명씩</h2>
        <p>첫 행에는 이름, 성별, 코드 헤더를 넣으세요.</p>
        <p>코드는 앞자리 0을 포함해 숫자 6자리로 입력하세요.</p>
        <p>파일에 중복된 코드 또는 이미 등록된 코드는 등록되지 않습니다.</p>
      </aside>
    </div>
  );
}

export default MemberBulkRegistration;
