// File: src/components/MainLayout.jsx

import React from 'react';
import { Outlet }    from 'react-router-dom';
import Header        from './Header';       
import BottomNav     from './BottomNav';  

const MainLayout = ({
  userId,
  nickname,
  level,
  followers,
  following
}) => {
  return (
    // Community.jsx에 사용하던 클래스 이름 그대로 유지합니다.
    <div className="screen-container community-page">
      <Header
        userId={userId}
        nickname={nickname}
        level={level}
        followers={followers}
        following={following}
      />

      {/* 각 페이지 내용이 여기에 렌더링됩니다 */}
      <main className="feed-container-final">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
};

export default MainLayout;
