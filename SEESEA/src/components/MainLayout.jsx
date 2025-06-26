import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';       
import BottomNav from './BottomNav';  

const MainLayout = () => {
  return (
    // 이 레이아웃을 사용하는 모든 페이지에 적용될 공통 컨테이너
    // Community.jsx에 있던 클래스 이름을 그대로 사용합니다.
    <div className="screen-container community-page">
        <Header />

        {/* 이 부분만 각 페이지의 내용(Community, Pokedex, MyMap 등)으로 채워집니다. */}
        <main className="feed-container-final">
            <Outlet />
        </main>

        <BottomNav />
    </div>
  );
};

export default MainLayout;