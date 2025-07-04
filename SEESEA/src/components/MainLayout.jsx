// File: src/components/MainLayout.jsx

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';

export default function MainLayout({ userId, nickname, onLogout }) {
  const [level, setLevel]         = useState(1);
  const [exp, setExp]             = useState(0);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [error, setError]         = useState('');

  const refreshProfile = useCallback(() => {
    if (!userId) return;

    // 1) 레벨·EXP 조회
    axios
      .get('http://localhost:3001/community/profile/level', {
        // 세션이 없을 경우를 대비해 user_id 파라미터도 항상 포함
        params: { user_id: userId },
        withCredentials: true
      })
      .then(res => {
        setLevel(res.data.level);
        setExp(res.data.exp);
      })
      .catch(err => {
        console.error('레벨 조회 실패:', err);
        setError('레벨 조회 실패');
      });

    // 2) 팔로우/팔로워 카운트
    axios
      .get('http://localhost:3001/community/follow/count', {
        params: { user_id: userId },
        withCredentials: true
      })
      .then(res => {
        setFollowers(res.data.followers);
        setFollowing(res.data.following);
      })
      .catch(err => {
        console.error('팔로우 조회 실패:', err);
        setError('팔로우 조회 실패');
      });
  }, [userId]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  return (
    <div className="screen-container community-page">
      {userId && (
        <Header
          userId={userId}
          nickname={nickname}
          level={level}
          exp={exp}
          followers={followers}
          following={following}
          onLogout={onLogout}
        />
      )}
      {error && <div className="error-msg">{error}</div>}
      <main className="feed-container-final">
        <Outlet context={{ userId, setFollowers, setFollowing, refreshProfile }} />
      </main>
      <BottomNav />
    </div>
  );
}
