// src/components/Header.jsx (새 파일)

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/Header.css'; // 헤더 전용 CSS 파일을 만들어서 스타일도 분리

import { FiMenu } from 'react-icons/fi';
import { IoPersonCircleOutline } from 'react-icons/io5';

const Header = () => {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const handleMenuToggle = () => {
    setShowMenu(!showMenu);
  };

  const handleRankingClick = () => {
    navigate('/ranking');
    setShowMenu(false); // 메뉴 닫기
  };

  const handleLogoutClick = () => {
    // 로그아웃 로직 추가 (예: 토큰 삭제, 로그인 페이지로 리다이렉트)
    console.log('로그아웃');
    setShowMenu(false); // 메뉴 닫기
  };

  return (
    <header className="common-header">
      <div className="header-left-section">
        <h1 className="header-title">See Sea</h1>
        <div className="profile-main">
          <IoPersonCircleOutline className="profile-pic" />
          <div className="profile-details">
            <button className="nickname-btn">닉네임</button>
            <div className="profile-stats">
              <span>등급</span><span>레벨</span><span>팔로워</span><span>팔로잉</span>
            </div>
          </div>
        </div>
      </div>
      <button className="menu-btn" onClick={handleMenuToggle}><FiMenu /></button>

      {showMenu && (
        <div className="menu-popup">
          <button onClick={handleRankingClick}>랭킹</button>
          <button onClick={handleLogoutClick}>로그아웃</button>
        </div>
      )}
    </header>
  );
};

export default Header;