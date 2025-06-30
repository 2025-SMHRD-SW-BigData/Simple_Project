// File: src/components/Header.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../style/Header.css';

import { FiMenu } from 'react-icons/fi';
import { IoPersonCircleOutline } from 'react-icons/io5';
import fishLevel2 from '../assets/fish_level2.png';

const Header = ({ userId }) => {
  const [showMenu, setShowMenu] = useState(false);

  // ★ 동적 값 상태들
  const [nickname, setNickname] = useState('닉네임');
  const [level, setLevel]       = useState(1);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) return;

    // 1) 닉네임
    axios.get(`http://localhost:3001/community/member/${userId}`)
      .then(res => setNickname(res.data.name))
      .catch(() => { /* 그대로 둠 */ });

    // 2) 팔로우 카운트
    axios.get(`http://localhost:3001/follow/count?user_id=${userId}`)
      .then(res => {
        setFollowers(res.data.followers);
        setFollowing(res.data.following);
      })
      .catch(() => { /* 그대로 둠 */ });

    // 3) 레벨
    axios.get(`http://localhost:3001/profile/level?user_id=${userId}`)
      .then(res => setLevel(res.data.level))
      .catch(() => { /* 그대로 둠 */ });
  }, [userId]);

  const handleMenuToggle = () => setShowMenu(v => !v);
  const handleRankingClick = () => { navigate('/ranking'); setShowMenu(false); };
  const handleLogoutClick  = () => { navigate('/'); setShowMenu(false); };

  return (
    <header className="common-header">
      <div className="header-left-section">
        <h1 className="header-title">See Sea</h1>
        <div className="profile-main">
          <IoPersonCircleOutline className="profile-pic" />
          <div className="profile-details">
            <div className="nickname-and-level">
              <img src={fishLevel2} alt="Level Fish" className="level-fish-icon" />
              {/* 하드코딩된 텍스트 대신 state */}
              <span className="nickname-text">{nickname}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 이 블록 위치와 클래스는 그대로 유지 */}
      <div className="profile-stats-new">
        <div className="stat-item">
          <span className="stat-label">레벨</span>
          {/* 하드코딩된 '2' → state */}
          <span className="stat-value">{level}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">팔로워</span>
          {/* '52' → state */}
          <span className="stat-value">{followers}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">팔로잉</span>
          {/* '66' → state */}
          <span className="stat-value">{following}</span>
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
