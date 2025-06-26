// src/components/Pokedex.jsx

import React, { useState } from 'react'; // useState 추가
import '../style/Pokedex.css';
// --- 아이콘 import ---
import { FaFishFins } from 'react-icons/fa6';
import { FiMenu } from 'react-icons/fi';
import { GoLocation } from 'react-icons/go';
import { BsPlusSquare, BsPlusLg } from 'react-icons/bs'; // + 아이콘 추가
import { IoPersonCircleOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

// --- ✨ 1. 헤더 컴포넌트 (완벽히 복구) ---
const CommunityHeader = () => (
    <header className="community-header-final">
      <div className="header-left-section">
        <h1 className="header-title-final">See Sea</h1>
        <div className="profile-main-final">
          <IoPersonCircleOutline className="profile-pic-final" />
          <div className="profile-details-final">
            <button className="nickname-btn-final">닉네임</button>
            <div className="profile-stats-final">
              <span>등급</span><span>레벨</span><span>팔로워</span><span>팔로잉</span>
            </div>
          </div>
        </div>
      </div>
      <button className="menu-btn-final"><FiMenu /></button>
    </header>
);

// --- ✨ 2. 하단 네비 컴포넌트 (완벽히 복구) ---
const BottomNav = () => {
    const nav = useNavigate();
    return (
      <nav className="bottom-nav-final">
        <button onClick={() => nav('/pokedex')}>
          <FaFishFins />
          <span className="nav-label">도감</span>
        </button>
        <button onClick={() => nav('/new')}>
          <BsPlusSquare />
          <span className="nav-label">생성</span>
        </button>
        <button onClick={() => nav('/map')}>
          <GoLocation />
          <span className="nav-label">지도</span>
        </button>
      </nav>
    );
};

// --- ✨ 3. 물고기 카드와 + 버튼 컴포넌트 (새로운 기능) ---
const FishCard = ({ fish }) => (
  <div className="fish-card">
    <img src={fish.imageUrl} alt="물고기" className="fish-image" />
  </div>
);

const AddImageCard = ({ onClick }) => (
    <button className="add-image-card" onClick={onClick}>
        <BsPlusLg />
    </button>
);

// --- ✨ 4. 임시 데이터 (초기값) ---
const initialImages = [
    { id: 1, imageUrl: '/src/assets/fishing-post-woman.jpg' },
    { id: 2, imageUrl: '/src/assets/fishing-post.jpg' },
    { id: 3, imageUrl: '/src/assets/fishing-post-esul.jpg' },
    { id: 4, imageUrl: '/src/assets/fishing-post-woman.jpg' },
    { id: 5, imageUrl: '/src/assets/fishing-post.jpg' },
];

// --- ✨ 5. 최종 Pokedex 컴포넌트 (기능 추가) ---
const Pokedex = () => {
    const [images, setImages] = useState(initialImages);

    const handleAddImage = () => {
        const newImage = {
            id: Date.now(),
            imageUrl: '/src/assets/fishing-post-esul.jpg' // 새 이미지는 esul 사진으로 임시 지정
        };
        setImages([newImage, ...images]);
        alert('새로운 이미지가 추가되었습니다!');
    };

    return (
      // 기존 틀 className은 그대로 유지
      <div className="screen-container community-page">
        <CommunityHeader />
        <main className="feed-container-final">
          <div className="fish-grid">
            {/* 맨 앞에 + 버튼을 먼저 렌더링 */}
            <AddImageCard onClick={handleAddImage} />
            {/* 그 다음에 이미지 목록을 렌더링 */}
            {images.map(image => (
              <FishCard key={image.id} fish={image} />
            ))}
          </div>
        </main>
        <BottomNav />
      </div>
    );
};

export default Pokedex;