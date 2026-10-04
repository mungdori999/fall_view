import { API_BASE_URL } from "../config/api";
import { getAccessToken } from "../utils/authStorage";

function requestMemberLogin() {
  window.dispatchEvent(new Event("member-auth-required"));
}

async function memberRequest(path, options = {}) {
  const token = getAccessToken();
  if (!token) {
    requestMemberLogin();
    throw new Error("로그인이 만료되었습니다.");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
    signal: options.signal || AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    if (response.status === 401) {
      requestMemberLogin();
      throw new Error("로그인이 만료되었습니다.");
    }

    let errorDetail;
    try {
      errorDetail = (await response.json()).detail;
    } catch {
      // JSON ProblemDetail 형식이 아닌 오류는 상태 코드별 기본 메시지를 사용한다.
    }

    throw new Error(
      response.status === 409
        ? errorDetail || "이미 이 참가자에게 쪽지를 보냈습니다."
        : "정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.",
    );
  }

  if (
    response.status === 204 ||
    !response.headers.get("Content-Type")?.includes("application/json")
  ) {
    return null;
  }

  return response.json();
}

export function getLetterRecipients() {
  return memberRequest("/member/list/gender");
}

export function getRemainingMessageCount() {
  return memberRequest("/member/me/message-count");
}

export function getSentMessages() {
  return memberRequest("/message/sent");
}

export function getReceivedMessages() {
  return memberRequest("/message/received");
}

export function sendMessage({ receiverMemberId, senderName, content }) {
  return memberRequest("/message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ receiverMemberId, senderName, content }),
  });
}
