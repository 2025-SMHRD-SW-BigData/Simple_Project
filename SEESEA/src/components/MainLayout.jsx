import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header    from './Header';
import BottomNav from './BottomNav';

export default function MainLayout({ userId, nickname }) {
  const [level, setLevel]         = useState(1);
  const [exp,   setExp]           = useState(0);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [error, setError]         = useState('');
  const location = useLocation();

  useEffect(() => {
    if (!userId) return;

    // 레벨·EXP 조회
    axios
      .get(
        `http://localhost:3001/community/profile/level?user_id=${encodeURIComponent(userId)}`,
        { withCredentials: true }
      )
      .then(res => {
        setLevel(res.data.level);
        setExp(res.data.exp);
      })
      .catch(() => setError('레벨 조회 실패'));

    // 팔로워·팔로잉 조회
    axios
      .get(
        `http://localhost:3001/community/follow/count?user_id=${encodeURIComponent(userId)}`,
        { withCredentials: true }
      )
      .then(res => {
        setFollowers(res.data.followers);
        setFollowing(res.data.following);
      })
      .catch(() => setError(prev => prev ? prev + ' / 팔로우 조회 실패' : '팔로우 조회 실패'));
  }, [userId]);

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

      <motion.main
        className="feed-container-final"
        key={location.pathname} // Outlet이 바뀔 때마다 애니메이션을 재실행하기 위한 key
        initial={{ x: 30, opacity: 0 }} // 오른쪽에서
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -30, opacity: 0 }}    // 왼쪽으로
        transition={{ duration: 1 }}
      >
        <Outlet context={{
          userId,
          setFollowers,
          setFollowing
        }} />
      </motion.main>

      <BottomNav />
    </div>
  );
}
