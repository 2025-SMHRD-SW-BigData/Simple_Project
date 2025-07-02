// File: src/App.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import axios                         from 'axios';

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
  // 1) 로그인된 userId
  const [userId, setUserId] = useState(() => localStorage.getItem('seeSeaUserId') || '');

  // 2) 프로필 정보
  const [nickname, setNickname]   = useState('닉네임');
  const [level, setLevel]         = useState(1);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);

  // 로그인 성공 시
  const handleLoginSuccess = (loggedInId) => {
    setUserId(loggedInId);
    localStorage.setItem('seeSeaUserId', loggedInId);
  };

  // **프로필(이름, 팔로우, 레벨)을 서버에서 불러와 state 갱신**
  const refreshProfile = useCallback(() => {
    if (!userId) return;

    // 닉네임
    axios
      .get(`http://localhost:3001/community/member/${encodeURIComponent(userId)}`, { withCredentials: true })
      .then(res => res.data.name && setNickname(res.data.name))
      .catch(() => {});

    // 팔로워·팔로잉
    axios
      .get(`http://localhost:3001/community/follow/count?user_id=${encodeURIComponent(userId)}`, { withCredentials: true })
      .then(res => {
        setFollowers(res.data.followers);
        setFollowing(res.data.following);
      })
      .catch(() => {});

    // 레벨·EXP
    axios
      .get(`http://localhost:3001/community/profile/level?user_id=${encodeURIComponent(userId)}`, { withCredentials: true })
      .then(res => {
        if (typeof res.data.level === 'number') setLevel(res.data.level);
      })
      .catch(() => {});
  }, [userId]);

  // userId가 바뀔 때 한 번 로드
  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  return (
    <div className="App">
      <Routes>
        {/* 공개 페이지 */}
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/join"  element={<Join />} />

        {/* 공통 레이아웃 */}
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
                ? <Pokedex userId={userId} refreshProfile={refreshProfile} />
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
    </div>
  );
}
