# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


## API 주소 설정

`.env`에서 공통 백엔드 주소를 관리합니다.

```dotenv
VITE_API_BASE_URL=http://localhost:8080/api
```

프론트는 5173 포트에서 실행하며 백엔드에 직접 요청합니다. API를 추가할 때 `src/config/api.js`의 `API_BASE_URL`을 가져와 사용하세요.

```js
fetch(`${API_BASE_URL}/member/login`, options)
```

백엔드 `application.yml`의 `app.frontend-url`은 허용할 프론트 주소입니다. 기본값은 `http://localhost:5173`이며 `FRONTEND_URL` 환경변수로 변경할 수 있습니다. 환경변수를 변경하면 개발 서버를 재시작하세요. 배포 시에는 실제 주소를 설정한 후 프론트를 다시 빌드하세요.
