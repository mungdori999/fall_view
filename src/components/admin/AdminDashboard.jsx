import { useState } from "react";
import AdminRegisterModal from "./AdminRegisterModal";
import "./AdminLogin.css";
import { Link, Outlet, useNavigate, useMatch } from "react-router-dom";
import "./AdminDashboard.css";

export default function AdminDashboard({ token, onLogout }) {
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState("");
  const navigateTo = useNavigate();
  const isBulkPage = useMatch("/admin/members/bulk");
  const isNewPage = useMatch("/admin/members/new");
  const page = isBulkPage ? "bulk" : isNewPage ? "new" : "list";
  const navigate = (next) =>
    navigateTo(
      next === "new"
        ? "/admin/members/new"
        : next === "bulk"
          ? "/admin/members/bulk"
          : "/admin/members",
    );
  return (
    <div className="management-shell">
      <aside className="management-sidebar">
        <Link to="/admin" className="management-brand">
          다시, 가을<span>ADMINISTRATION</span>
        </Link>
        <p className="management-menu-label">회원 관리</p>
        <nav aria-label="관리자 메뉴">
          <button
            className={page === "list" ? "selected" : ""}
            onClick={() => navigate("list")}
            aria-current={page === "list" ? "page" : undefined}
          >
            회원 목록 <span>→</span>
          </button>
          <button
            className={page === "new" ? "selected" : ""}
            onClick={() => navigate("new")}
            aria-current={page === "new" ? "page" : undefined}
          >
            개별 등록
            <span>＋</span>
          </button>
          <button
            className={page === "bulk" ? "selected" : ""}
            onClick={() => navigate("bulk")}
            aria-current={page === "bulk" ? "page" : undefined}
          >
            엑셀 일괄 등록
            <span>↑</span>
          </button>
        </nav>
        <div className="management-sidebar-bottom">
          <Link to="/">참가자 화면 ↗</Link>

          <button onClick={onLogout}>로그아웃</button>
        </div>
      </aside>
      <main className="management-main">
        <header className="management-topbar">
          <span>우리들교회 BRANDNEW</span>
          <span className="management-badge">관리자</span>
        </header>
        <div className="management-content">
          <div className="management-heading">
            <div>
              <p>MEMBER MANAGEMENT</p>
              <h1>
                {page === "new"
                  ? "회원 개별 등록"
                  : page === "bulk"
                    ? "엑셀 일괄 등록"
                    : "회원 목록"}
              </h1>
              <span>
                {page === "new"
                  ? "참가자 한 명의 정보와 로그인에 사용할 코드를 등록하세요."
                  : page === "bulk"
                    ? "이름, 성별, 6자리 코드가 포함된 엑셀 파일을 업로드하세요."
                    : "등록된 참가자를 확인하고 이름과 코드로 검색하세요."}
              </span>
            </div>
            {page === "list" && (
              <button
                className="management-primary"
                onClick={() => navigate("new")}
              >
                ＋ 개별 등록
              </button>
            )}
          </div>
          {registerSuccess && (
            <p className="admin-register-success" role="status">
              {registerSuccess}
            </p>
          )}
          <Outlet context={{ token }} />
        </div>
      </main>
      {registerOpen && (
        <AdminRegisterModal
          token={token}
          onClose={() => setRegisterOpen(false)}
          onRegistered={() => {
            setRegisterOpen(false);
            setRegisterSuccess("새 관리자 계정이 등록되었습니다.");
          }}
        />
      )}
    </div>
  );
}
