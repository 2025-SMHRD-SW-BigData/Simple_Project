// src/components/Header.jsx (새 파일)

import React from 'react';
import '../style/Header.css'; // 헤더 전용 CSS 파일을 만들어서 스타일도 분리

import { FiMenu } from 'react-icons/fi';
import { IoPersonCircleOutline } from 'react-icons/io5';

const Header = () => {
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
      <button className="menu-btn"><FiMenu /></button>
    </header>
  );
};

export default Header;