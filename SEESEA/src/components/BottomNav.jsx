import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/BottomNav.css'; // 이 CSS 파일도 곧 만들 겁니다.

// 필요한 아이콘들을 모두 가져옵니다.
import { IoHomeOutline } from 'react-icons/io5';
import { FaFishFins } from 'react-icons/fa6';
import { BsPlusSquare } from 'react-icons/bs';
import { GoLocation } from 'react-icons/go';

const BottomNav = () => {
    const navigate = useNavigate();

    return (
        <nav className="common-bottom-nav">
            {/* 1. 홈 버튼 (새로 추가) */}
            <button onClick={() => navigate('/community')}>
                <IoHomeOutline />
                <span className="nav-label">홈</span>
            </button>

            {/* 2. 도감 버튼 */}
            <button onClick={() => navigate('/pokedex')}>
                <FaFishFins />
                <span className="nav-label">도감</span>
            </button>

            {/* 3. 생성 버튼 */}
            <button onClick={() => navigate('/new')}>
                <BsPlusSquare />
                <span className="nav-label">생성</span>
            </button>

            {/* 4. 지도 버튼 */}
            <button onClick={() => navigate('/map')}>
                <GoLocation />
                <span className="nav-label">지도</span>
            </button>
        </nav>
    );
};

export default BottomNav;