import React, { useState } from 'react';
import '../style/Community.css';

import { FaHeart, FaRegHeart, FaRegComment } from 'react-icons/fa';
import postImage1 from '../assets/fishing-post-woman.jpg';
import postImage2 from '../assets/fishing-post.jpg';
import postImage3 from '../assets/fishing-post-esul.jpg';

// --- 헤더와 하단 네비 관련 import와 컴포넌트 정의는 모두 삭제되었습니다. ---

// --- 게시물(피드) 컴포넌트 (이 부분은 그대로 유지) ---
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


// --- ✨ Community 메인 컴포넌트 ---
// 이제 레이아웃을 감싸는 div나 <main> 태그 없이, 내용물만 반환합니다.
const Community = () => (
  <>
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
  </>
);

export default Community;