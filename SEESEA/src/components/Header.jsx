import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/Header.css';

import { FiMenu }                from 'react-icons/fi';
import { IoPersonCircleOutline } from 'react-icons/io5';
import fishLevel2                from '../assets/fish_level2.png';

const Header = ({ userId, nickname, level, followers, following }) => {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="common-header">
      <div className="header-left-section">
        <h1 className="header-title">See Sea</h1>
        <div className="profile-main">
          <IoPersonCircleOutline className="profile-pic" />
          <div className="profile-details">
            <div className="nickname-and-level">
              <img src={fishLevel2} alt={`Level ${level}`} className="level-fish-icon" />
              <span className="nickname-text">{nickname}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-stats-new">
        <div className="stat-item">
          <span className="stat-label">레벨</span>
          <span className="stat-value">{level}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">팔로워</span>
          <span className="stat-value">{followers}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">팔로잉</span>
          <span className="stat-value">{following}</span>
        </div>
      </div>

      <button className="menu-btn" onClick={() => setShowMenu(v => !v)}>
        <FiMenu />
      </button>

      {showMenu && (
        <div className="menu-popup">
          <button onClick={() => { navigate('/ranking'); setShowMenu(false); }}>
            랭킹
          </button>
          <button onClick={() => {
            localStorage.removeItem('seeSeaUserId');
            navigate('/login');
            setShowMenu(false);
          }}>
            로그아웃
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
