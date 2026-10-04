import { API_BASE_URL } from "../../config/api";
function requestAdminLogin() {
  window.dispatchEvent(new Event("admin-auth-required"));
}

export async function adminRequest(path, token, options = {}) {
  const isFormData = options.body instanceof FormData;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(!isFormData && { "Content-Type": "application/json" }),
      ...options.headers,
    },
    signal: options.signal || AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    if (response.status === 401) {
      requestAdminLogin();
      throw new Error("로그인이 만료되었습니다. 로그아웃 후 다시 로그인해주세요.");
    }

    let errorDetail;
    try {
      errorDetail = (await response.json()).detail;
    } catch {
      // ProblemDetail 형식이 아닌 응답은 상태 코드별 기본 메시지를 사용한다.
    }
    const messages = {
      400: errorDetail || "입력값 또는 업로드 파일 형식을 확인해주세요.",
      403: "관리자 권한을 확인해주세요.",
      404: "회원을 찾을 수 없습니다.",
      409: errorDetail || (options.method === "DELETE" ? "연결된 정보로 인해 삭제할 수 없습니다." : "이미 등록된 회원 또는 코드입니다."),
    };
    throw new Error(
      messages[response.status] ||
        (options.method === "POST"
          ? "등록에 실패했습니다. 입력 정보를 확인하고 다시 시도해주세요."
          : options.method === "PUT"
          ? "수정에 실패했습니다. 입력 정보를 확인해주세요."
          : options.method === "DELETE"
          ? "회원 삭제에 실패했습니다. 잠시 후 다시 시도해주세요."
          : "회원 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요."),
    );
  }
  return response;
}
