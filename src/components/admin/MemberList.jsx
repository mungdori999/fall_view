import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { adminRequest } from "./adminApi";
import MemberDetailModal from "./MemberDetailModal";
export default function MemberList() {
  const { token } = useOutletContext();
  const navigate = useNavigate();
  const onRegister = () => navigate("/admin/members/new");
  const [selectedId, setSelectedId] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [gender, setGender] = useState("");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timeout = setTimeout(() => controller.abort(), 15000);
    async function load() {
      try {
        const response = await adminRequest("/admin/member/list", token, {
          method: "GET",
          signal: controller.signal,
        });
        const data = await response.json();
        if (!Array.isArray(data))
          throw new Error("회원 목록 응답 형식을 확인해주세요.");
        if (active) setMembers(data);
      } catch (e) {
        if (active)
          setError(
            e instanceof TypeError || e.name === "AbortError"
              ? "서버에 연결하지 못했습니다. 다시 시도해주세요."
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
  }, [token, revision]);
  const retry = () => {
    setLoading(true);
    setError("");
    setRevision((value) => value + 1);
  };
  const filtered = members.filter(
    (member) =>
      (!gender || member.gender === gender) &&
      `${member.name ?? ""} ${member.code ?? ""}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  return (
    <section className="management-panel management-list">
      <div className="management-list-header">
        <h2>
          등록 회원 {!loading && !error && <span>{members.length}명</span>}
        </h2>
      </div>
      <div className="management-filters">
        <input
          aria-label="이름 또는 코드 검색"
          placeholder="이름 또는 코드 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          aria-label="성별 필터"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
        >
          <option value="">전체</option>
          <option value="MALE">남성</option>
          <option value="FEMALE">여성</option>
        </select>
      </div>
      {loading ? (
        <div className="management-empty" role="status">
          회원 목록을 불러오는 중입니다…
        </div>
      ) : error ? (
        <div className="management-empty">
          <p role="alert">{error}</p>
          <button onClick={retry}>다시 시도</button>
        </div>
      ) : members.length === 0 ? (
        <div className="management-empty">
          <h3>등록된 회원이 없습니다</h3>
          <p>첫 참가자를 등록해보세요.</p>
          <button className="management-primary" onClick={onRegister}>
            회원 등록
          </button>
        </div>
      ) : (
        <>
          <div className="management-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>회원 번호</th>
                  <th>이름</th>
                  <th>성별</th>
                  <th>참가 코드</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((member, index) => (
                  <tr
                    key={member.memberId ?? member.id ?? index}
                    className="member-clickable-row"
                    onClick={() =>
                      setSelectedId(member.memberId ?? member.id ?? null)
                    }
                  >
                    <td>{member.memberId ?? member.id ?? "—"}</td>
                    <td className="management-member-name">
                      <button
                        className="member-detail-link"
                        type="button"
                        disabled={(member.memberId ?? member.id) == null}
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedId(member.memberId ?? member.id);
                        }}
                        aria-label={`${member.name ?? "회원"} 상세 보기`}
                      >
                        {member.name ?? "—"}
                      </button>
                    </td>
                    <td>
                      {{ MALE: "남성", FEMALE: "여성" }[member.gender] ?? "—"}
                    </td>
                    <td>
                      <code>{member.code ?? "—"}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="management-empty">
              검색 조건에 맞는 회원이 없습니다.
            </div>
          )}
          <p className="management-count">
            전체 {members.length}명 중 {filtered.length}명 표시
          </p>
        </>
      )}
      {selectedId != null && (
        <MemberDetailModal
          key={selectedId}
          id={selectedId}
          token={token}
          onDeleted={(id) => {
            setMembers((items) =>
              items.filter((member) => (member.memberId ?? member.id) !== id),
            );
            setSelectedId(null);
          }}
          onClose={() => setSelectedId(null)}
          onSaved={(id, values) =>
            setMembers((items) =>
              items.map((member) =>
                (member.memberId ?? member.id) === id
                  ? { ...member, ...values }
                  : member,
              ),
            )
          }
        />
      )}
    </section>
  );
}
