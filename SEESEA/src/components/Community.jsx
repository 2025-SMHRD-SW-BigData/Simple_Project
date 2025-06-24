// src/components/Community.jsx

import React, { useState } from 'react'; // useState import
import '../style/Community.css';

// 1. 필요한 아이콘들을 다시 가져옵니다.
import { FaUserCircle, FaHeart, FaRegHeart, FaRegComment } from 'react-icons/fa';
import { FaFishFins } from "react-icons/fa6";
import { FiMenu } from 'react-icons/fi';
import { GoLocation } from 'react-icons/go';
import { BsPlusSquare } from 'react-icons/bs';
import { IoPersonCircleOutline } from "react-icons/io5"; // 새로운 도감 아이콘


// 2. 임시 데이터
import postImage1 from '../assets/fishing-post-woman.jpg';
import postImage2 from '../assets/fishing-post.jpg';
import postImage3 from '../assets/fishing-post-esul.jpg'; // 참esul님 이미지 예시


// --- 상단 헤더 컴포넌트 ---
const CommunityHeader = () => {
    return (
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
};

// --- 게시물(피드) 컴포넌트 ---
const Post = ({ author, image, caption, tags, initialLikes, comments }) => {
    // 3. 좋아요 상태를 관리하기 위한 useState
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(initialLikes);

    const handleLike = () => {
        setLiked(!liked); // 현재 상태의 반대로 변경 (true -> false, false -> true)
        setLikeCount(liked ? likeCount - 1 : likeCount + 1); // 좋아요 누르면 1 증가, 취소하면 1 감소
    };

    return (
        <article className="post-final">
            <div className="post-author-section">
                <p className="author-nickname">{author}</p>
                <button className="follow-btn">팔로우</button>
            </div>
            <div className="post-image-container">
                <img src={image} alt="낚시 조과" className="post-image-final" />
                <div className="post-caption-overlay-final">
                    <p>
                        {caption}
                        <a href="#" className="more-link"> ...자세히보기</a>
                        <span className="tags"> {tags}</span>
                    </p>
                </div>
            </div>
            <div className="post-actions-final">
                <button className="action-btn-final" onClick={handleLike}>
                    {/* 4. liked 상태에 따라 다른 아이콘을 보여줌 */}
                    {liked ? <FaHeart style={{ color: 'red' }} /> : <FaRegHeart />}
                    <span>{likeCount}</span>
                </button>
                <button className="action-btn-final">
                    <FaRegComment /> <span>{comments}</span>
                </button>
            </div>
        </article>
    );
};

// --- 하단 내비게이션 컴포넌트 ---
const BottomNav = () => {
    return (
        <nav className="bottom-nav-final">
            {/* 5. 새로운 아이콘으로 교체 */}
            <button title="도감"><FaFishFins /></button>
            <button title="게시글 작성"><BsPlusSquare /></button>
            <button title="지도"><GoLocation /></button>
        </nav>
    );
};

// --- 최종 조립: 커뮤니티 메인 페이지 ---
const Community = () => {
    return (
        <div className="screen-container community-page">
            <CommunityHeader />
            <main className="feed-container-final">
                <Post 
                    author="바다여신"
                    image={postImage1}
                    caption="대어잡았땅~ 아호"
                    tags="#바다 #낚시 #펀크릴 #맞팔 #오자"
                    initialLikes={15386}
                    comments="57126"
                />
                <Post 
                    author="동대문호랑이"
                    image={postImage2}
                    caption="좋은 날씨^^ 햇님들 덕분에 오늘 큰~놈 하나 잡았네요^^ 마누라가 소주 먹지 말랬는데 오늘은 못참..."
                    tags="#소주 #청춘"
                    initialLikes={325}
                    comments="68"
                />
                <Post 
                    author="참esul"
                    image={postImage3}
                    caption="배스 낚시 성공적"
                    tags="#배스 #루어낚시"
                    initialLikes={1024}
                    comments="128"
                />
            </main>
            <BottomNav />
        </div>
    );
};

export default Community;