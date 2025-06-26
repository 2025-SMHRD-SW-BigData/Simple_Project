import React from 'react';
import '../style/Pokedex.css'; // CSS 파일 경로를 Pokedex.css로 변경!
import { FaHeart, FaRegHeart, FaRegComment, FaStar } from 'react-icons/fa'; // FaStar 추가
import { FaFishFins }     from 'react-icons/fa6';
import { FiMenu }         from 'react-icons/fi';
import { GoLocation }     from 'react-icons/go';
import { BsPlusSquare }   from 'react-icons/bs';
import { IoPersonCircleOutline } from 'react-icons/io5';
import { useNavigate }    from 'react-router-dom';

// 이미지는 일단 필요 없으니 주석 처리하거나 삭제합니다.
// import postImage1 from '../assets/fishing-post-woman.jpg';

// --- 2. CommunityHeader, BottomNav는 그대로 사용합니다 ---
// (이름은 그대로 두어도 동작에 문제없습니다)
// --- 상단 헤더 컴포넌트 ---
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

// --- 게시물(피드) 컴포넌트 ---
const Post = ({ author, image, caption, tags, initialLikes, comments }) => {
  const [liked, setLiked]        = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikes);
  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
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

// 물고기 카드 컴포넌트
const FishCard = ({ fish }) => (
  <div className="fish-card">
    {/* ⚠️ 카드 위의 별점 표시 div를 완전히 삭제했습니다. */}
    <img src={fish.imageUrl} alt="물고기" className="fish-image" />
  </div>
);

// --- 임시 데이터 (stars 속성은 이제 사용되지 않지만, 일단 둡니다) ---
const mockFishData = [
    { id: 1, imageUrl: '/src/assets/fishing-post-woman.jpg' },
    { id: 2, imageUrl: '/src/assets/fishing-post.jpg' },
    { id: 3, imageUrl: '/src/assets/fishing-post-esul.jpg' },
    { id: 4, imageUrl: '/src/assets/fishing-post-woman.jpg' },
    { id: 5, imageUrl: '/src/assets/fishing-post.jpg' },
    { id: 6, imageUrl: '/src/assets/fishing-post-esul.jpg' },
    { id: 7, imageUrl: '/src/assets/fishing-post-woman.jpg' },
    { id: 8, imageUrl: '/src/assets/fishing-post.jpg' },
    { id: 9, imageUrl: '/src/assets/fishing-post-esul.jpg' },
    { id: 10, imageUrl: '/src/assets/fishing-post-woman.jpg' },
    { id: 11, imageUrl: '/src/assets/fishing-post.jpg' },
    { id: 12, imageUrl: '/src/assets/fishing-post-esul.jpg' },
    { id: 13, imageUrl: '/src/assets/fishing-post-woman.jpg' },
    { id: 14, imageUrl: '/src/assets/fishing-post.jpg' },
    { id: 15, imageUrl: '/src/assets/fishing-post-esul.jpg' },
    { id: 16, imageUrl: '/src/assets/fishing-post-woman.jpg' },
    { id: 17, imageUrl: '/src/assets/fishing-post.jpg' },
    { id: 18, imageUrl: '/src/assets/fishing-post-esul.jpg' },
    { id: 19, imageUrl: '/src/assets/fishing-post-woman.jpg' },
    { id: 20, imageUrl: '/src/assets/fishing-post.jpg' },
    { id: 21, imageUrl: '/src/assets/fishing-post-esul.jpg' },
    { id: 22, imageUrl: '/src/assets/fishing-post-woman.jpg' },
    { id: 23, imageUrl: '/src/assets/fishing-post.jpg' },
    { id: 24, imageUrl: '/src/assets/fishing-post-esul.jpg' },
    { id: 25, imageUrl: '/src/assets/fishing-post-woman.jpg' },
    { id: 26, imageUrl: '/src/assets/fishing-post.jpg' },
    { id: 27, imageUrl: '/src/assets/fishing-post-esul.jpg' },
];

// --- 최종 Pokedex 컴포넌트 ---
const Pokedex = () => (
  <div className="screen-container community-page">
    <CommunityHeader />
    <main className="feed-container-final">
      <div className="fish-grid">
        {/* mockFishData가 늘어났으므로, 화면에 더 많은 카드가 그려집니다. */}
        {mockFishData.map(fish => (
          <FishCard key={fish.id} fish={fish} />
        ))}
        {/* 
          이제 데이터가 많아서 플레이스홀더는 굳이 필요 없습니다.
          데이터가 없을 때만 보여주는 로직을 나중에 추가할 수 있습니다.
          일단은 주석 처리하거나 삭제해도 좋습니다.
        */}
        {/*
        <div className="fish-card-placeholder"></div>
        <div className="fish-card-placeholder"></div>
        <div className="fish-card-placeholder"></div>
        */}
      </div>
    </main>
    <BottomNav />
  </div>
);

export default Pokedex;
