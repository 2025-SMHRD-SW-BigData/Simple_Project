// File: src/components/MainLayout.jsx

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Outlet } from 'react-router-dom';
import Header    from './Header';
import BottomNav from './BottomNav';

export default function MainLayout({ userId, nickname }) {
  const [level, setLevel]         = useState(1);
  const [exp,   setExp]           = useState(0);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [error, setError]         = useState('');

  // 프로필 정보(레벨·EXP·팔로우) 다시 불러오는 함수
  const refreshProfile = useCallback(() => {
    if (!userId) return;

    // 레벨·EXP 조회
    axios.get(
      `http://localhost:3001/community/profile/level?user_id=${encodeURIComponent(userId)}`,
      { withCredentials: true }
    )
    .then(res => {
      setLevel(res.data.level);
      setExp(res.data.exp);
    })
    .catch(() => setError('레벨 조회 실패'));

    // 팔로워·팔로잉 조회
    axios.get(
      `http://localhost:3001/community/follow/count?user_id=${encodeURIComponent(userId)}`,
      { withCredentials: true }
    )
    .then(res => {
      setFollowers(res.data.followers);
      setFollowing(res.data.following);
    })
    .catch(() =>
      setError(prev => prev ? prev + ' / 팔로우 조회 실패' : '팔로우 조회 실패')
    );
  }, [userId]);

  // 마운트 및 userId 변경 시 한 번만 불러오기
  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  return (
    <div className="screen-container community-page">
      <Header
        userId={userId}
        nickname={nickname}
        level={level}
        followers={followers}
        following={following}
      />

      {error && <div className="error-msg">{error}</div>}

      <main className="feed-container-final">
        {/* 자식(useOutletContext)에게 전달할 값들 */}
        <Outlet context={{
          userId,
          setFollowers,
          setFollowing,
          refreshProfile
        }} />
      </main>

      <BottomNav />
    </div>
  );
}
