// 공통 백엔드 주소는 프로젝트 루트의 .env에서 설정합니다.
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api").replace(/\/+$/, "");
