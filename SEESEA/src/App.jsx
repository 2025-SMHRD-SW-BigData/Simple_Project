// File: src/App.jsx

import React, { useState, useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import axios from 'axios';

import MainLayout  from './components/MainLayout';
import Main        from './components/Main';
import Login       from './components/Login';
import Join        from './components/Join';
import MyMap       from './components/MyMap';
import Community   from './components/Community';
import FeedUpload  from './components/FeedUpload';
import Pokedex     from './components/Pokedex';
import RankingPage from './components/RankingPage';

import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

function AppContent() {
  const location = useLocation();

  const [loading, setLoading]   = useState(true);
  const [userId, setUserId]     = useState(null);
  const [nickname, setNickname] = useState('');

  // 로그인 성공 시 호출
  const handleLoginSuccess = (loggedInId) => {
    setUserId(loggedInId);
    // 즉시 닉네임도 조회
    axios
      .get(`http://localhost:3001/community/member/${encodeURIComponent(loggedInId)}`, { withCredentials: true })
      .then(r => setNickname(r.data.name))
      .catch(() => setNickname(''));
  };

  // 로그아웃 처리
  const handleLogout = () => {
    axios
      .get('http://localhost:3001/userLogin/logout', { withCredentials: true })
      .then(() => {
        setUserId(null);
        setNickname('');
      })
      .catch(console.error);
  };

  // 1) 컴포넌트 마운트 시 세션 확인
  useEffect(() => {
    axios
      .get('http://localhost:3001/userLogin/session', { withCredentials: true })
      .then(res => {
        const id = res.data.userId;
        setUserId(id);
        if (id) {
          // 세션이 있으면 닉네임도 조회
          return axios.get(
            `http://localhost:3001/community/member/${encodeURIComponent(id)}`,
            { withCredentials: true }
          );
        } else {
          // 세션 없으면 닉네임 초기화
          setNickname('');
          // 이 Promise.reject는 finally 이전 then을 건너뛰게 함
          return Promise.reject({ noSession: true });
        }
      })
      .then(r => setNickname(r.data.name))
      .catch(err => {
        if (!err.noSession) console.error('세션/닉네임 조회 에러:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  // 로딩 중에는 아무 것도 렌더링하지 않음
  if (loading) return null;

  return (
    <div className="App">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>

          <Route path="/" element={<Main />} />

          <Route
            path="/login"
            element={<Login onLoginSuccess={handleLoginSuccess} />}
          />

          <Route path="/join" element={<Join />} />

          {/* 보호된 라우트: 세션 로드가 완료된 뒤에만 판단 */}
          <Route
            element={
              <MainLayout
                userId={userId}
                nickname={nickname}
                onLogout={handleLogout}
              />
            }
          >
            <Route
              path="/community"
              element={
                userId
                  ? <Community userId={userId} />
                  : <Navigate to="/login" replace />
              }
            />
            <Route path="/map" element={<MyMap />} />
            <Route
              path="/pokedex"
              element={
                userId
                  ? <Pokedex userId={userId} />
                  : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/new"
              element={
                userId
                  ? <FeedUpload userId={userId} />
                  : <Navigate to="/login" replace />
              }
            />
            <Route path="/ranking" element={<RankingPage />} />
          </Route>

        </Routes>
      </AnimatePresence>
    </div>
  );
}
