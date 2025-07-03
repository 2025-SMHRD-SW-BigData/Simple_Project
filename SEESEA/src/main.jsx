// File: src/main.jsx

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

// ↓ SPA 라우팅시 새로고침 404 방지를 위해 BrowserRouter 사용 전,
//    Vite 설정에 historyApiFallback: true 가 필요합니다.
//    (또는 아래 HashRouter 대체도 가능)


createRoot(document.getElementById('root')).render(
    <App />
);
