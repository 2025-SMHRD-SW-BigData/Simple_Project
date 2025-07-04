// File: src/components/Header.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/Header.css';

import { FiMenu }                from 'react-icons/fi';
import { IoPersonCircleOutline } from 'react-icons/io5';

// 등급별 물고기 아이콘 import
import fishLevel1 from '../assets/fish_level1.png';
import fishLevel2 from '../assets/fish_level2.png';
import fishLevel3 from '../assets/fish_level3.png';
import fishLevel4 from '../assets/fish_level4.png';
import fishLevel5 from '../assets/fish_level5.png';

const Header = ({ userId, nickname, level, followers, following }) => {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  // level 을 1~5 사이로 맞추기
  const clampedLevel = Math.max(1, Math.min(5, level));
  // 인덱스 0부터: level1→index0, … level5→index4
  const icons = [fishLevel1, fishLevel2, fishLevel3, fishLevel4, fishLevel5];
  const currentFishIcon = icons[clampedLevel - 1];

  return (
    <header className="common-header">
      <div className="header-left-section">
        <h1 className="header-title">See Sea</h1>
        <div className="profile-main">
          <IoPersonCircleOutline className="profile-pic" />
          <div className="profile-details">
            <div className="nickname-and-level">
              {/* 동적으로 변경된 등급 아이콘 */}
              <img
                src={currentFishIcon}
                alt={`Level ${level}`}
                className="level-fish-icon"
              />
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
          <button
            onClick={() => {
              navigate('/ranking');
              setShowMenu(false);
            }}
          >
            랭킹
          </button>
          <button
            onClick={() => {
              localStorage.removeItem('seeSeaUserId');
              navigate('/login');
              setShowMenu(false);
            }}
          >
            로그아웃
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;