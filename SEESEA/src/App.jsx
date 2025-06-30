// src/App.jsx
import React, { useState }                 from 'react';
import { Routes, Route, Navigate }         from 'react-router-dom';

import MainLayout    from './components/MainLayout';
import Main          from './components/Main';
import Login         from './components/Login';
import Join          from './components/Join';
import MyMap         from './components/MyMap';
import Community     from './components/Community';
import FeedUpload    from './components/FeedUpload';
import Pokedex       from './components/Pokedex';
import RankingPage   from './components/RankingPage';

import './App.css';

export default function App() {
  // 로그인된 사용자 ID 상태
  const [userId, setUserId] = useState('');

  // 로그인 성공 시 호출
  const handleLoginSuccess = (loggedInId) => {
    setUserId(loggedInId);
  };

  return (
    <div className="App">
      <Routes>
        {/* 헤더/네비 없는 페이지 */}
        <Route path="/"    element={<Main />} />
        <Route path="/login"
               element={
                 <Login onLoginSuccess={handleLoginSuccess} />
               }
        />
        <Route path="/join" element={<Join />} />

        {/* 헤더/네비 공통 레이아웃 */}
        <Route element={<MainLayout />}>
          <Route path="/community" element={<Community />} />
          <Route path="/map"       element={<MyMap />} />
          <Route path="/pokedex"
                 element={
                   userId
                     ? <Pokedex userId={userId} />
                     : <Navigate to="/login" replace />
                 }
          />
          <Route path="/new"     element={<FeedUpload />} />
          <Route path="/ranking" element={<RankingPage />} />
        </Route>
      </Routes>
    </div>
  );
}
