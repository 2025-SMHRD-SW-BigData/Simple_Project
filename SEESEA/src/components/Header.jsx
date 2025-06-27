// src/components/Header.jsx (새 파일)

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/Header.css';

import { FiMenu } from 'react-icons/fi';
import { IoPersonCircleOutline } from 'react-icons/io5';
import fishLevel2 from '../assets/fish_level2.png'; // fish_level2 이미지 import

const Header = () => {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const handleMenuToggle = () => {
    setShowMenu(!showMenu);
  };

  const handleRankingClick = () => {
    navigate('/ranking');
    setShowMenu(false);
  };

  const handleLogoutClick = () => {
    console.log('로그아웃');
    setShowMenu(false);
  };

  return (
    <header className="common-header">
      <div className="header-left-section">
        <h1 className="header-title">See Sea</h1>
        <div className="profile-main">
          <IoPersonCircleOutline className="profile-pic" />
          <div className="profile-details">
            <div className="nickname-and-level">
              <img src={fishLevel2} alt="Level Fish" className="level-fish-icon" /> {/* 물고기 등급 이미지 */}
              <span className="nickname-text">닉네임</span> {/* 닉네임 텍스트 */}
            </div>
          </div>
        </div>
      </div>
      <div className="profile-stats-new"> {/* 이 블록을 밖으로 이동 */}
        <div className="stat-item">
          <span className="stat-label">레벨</span>
          <span className="stat-value">2</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">팔로워</span>
          <span className="stat-value">52</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">팔로잉</span>
          <span className="stat-value">66</span>
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