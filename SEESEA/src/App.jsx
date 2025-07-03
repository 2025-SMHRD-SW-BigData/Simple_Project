// src/App.jsx (최종 합본)

// 1. 필요한 모든 모듈을 한 곳에서 import 합니다.
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import axios from 'axios';

// 2. 모든 컴포넌트를 import 합니다.
import MainLayout from './components/MainLayout';
import Main from './components/Main';
import Login from './components/Login';
import Join from './components/Join';
import MyMap from './components/MyMap';
import Community from './components/Community';
import FeedUpload from './components/FeedUpload';
import Pokedex from './components/Pokedex';
import RankingPage from './components/RankingPage';

import './App.css';

// 3. App 컴포넌트는 가장 바깥에서 BrowserRouter를 렌더링합니다.
export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

// 4. 기존 App의 모든 로직은 AppContent라는 새로운 컴포넌트로 옮깁니다.
function AppContent() {
  const location = useLocation(); // 애니메이션을 위해 현재 경로를 가져옵니다.

  // --- 여기부터는 팀원의 코드를 그대로 가져옵니다. ---
  const [userId, setUserId] = useState(() => {
    return localStorage.getItem('seeSeaUserId') || '';
  });

  const [nickname, setNickname] = useState('닉네임');
  const [level, setLevel] = useState(1);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);

  const handleLoginSuccess = (loggedInId) => {
    setUserId(loggedInId);
    localStorage.setItem('seeSeaUserId', loggedInId);
  };

  useEffect(() => {
    if (!userId) return;
    axios.get(`http://localhost:3001/community/member/${encodeURIComponent(userId)}`).then(res => res.data.name && setNickname(res.data.name)).catch(() => {});
    axios.get(`http://localhost:3001/community/follow/count?user_id=${encodeURIComponent(userId)}`).then(res => { setFollowers(res.data.followers); setFollowing(res.data.following); }).catch(() => {});
    axios.get(`http://localhost:3001/community/profile/level?user_id=${encodeURIComponent(userId)}`).then(res => typeof res.data.level === 'number' && setLevel(res.data.level)).catch(() => {});
  }, [userId]);
  // --- 여기까지 팀원 코드 ---

  return (
    <div className="App">
      {/* 5. 나의 AnimatePresence 코드로 팀원의 Routes 코드를 감싸줍니다. */}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          
          {/* --- 여기부터는 팀원의 라우팅 구조를 그대로 사용합니다. --- */}
          <Route path="/" element={<Main />} />
          <Route
            path="/login"
            element={<Login onLoginSuccess={handleLoginSuccess} />}
          />
          <Route path="/join" element={<Join />} />

          <Route
            element={
              <MainLayout
                userId={userId}
                nickname={nickname}
                level={level}
                followers={followers}
                following={following}
              />
            }
          >
            <Route
              path="/community"
              element={
                userId ? <Community userId={userId} /> : <Navigate to="/login" replace />
              }
            />
            <Route path="/map" element={<MyMap />} />
            <Route
              path="/pokedex"
              element={
                userId ? <Pokedex userId={userId} /> : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/new"
              element={
                userId ? <FeedUpload userId={userId} /> : <Navigate to="/login" replace />
              }
            />
            <Route path="/ranking" element={<RankingPage />} />
          </Route>
          {/* --- 여기까지 팀원 라우팅 구조 --- */}

        </Routes>
      </AnimatePresence>
    </div>
  );
}