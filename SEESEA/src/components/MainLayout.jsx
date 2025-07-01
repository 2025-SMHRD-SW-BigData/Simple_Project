// File: src/components/MainLayout.jsx
import React from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import Header    from './Header';
import BottomNav from './BottomNav';

export default function MainLayout(props) {
  // App.jsx 에서 넘겨준 props 그대로 내려줍니다
  return (
    <div className="screen-container community-page">
      <Header {...props} />
      <main className="feed-container-final">
        <Outlet context={props} />
      </main>
      <BottomNav />
    </div>
  );
}
