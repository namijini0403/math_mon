import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import '@fontsource/jua/index.css';
import './index.css';
import App from './App';
import { initAnalytics } from './analytics';
import { ensureFreshToken } from './api';

initAnalytics(); // noop 기본 어댑터로 세션 시작
// 기존 로그인 학생: refresh 토큰이 있으면 갱신 후 서버 전송 어댑터로 자동 전환
void ensureFreshToken();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
