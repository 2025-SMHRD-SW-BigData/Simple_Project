// File: src/components/Community.jsx
import React, { useState, useEffect } from 'react';
import axios                              from 'axios';
import '../style/Community.css';
import { FaHeart, FaRegHeart, FaRegComment } from 'react-icons/fa';
import { IoPersonCircleOutline }          from 'react-icons/io5';

export default function Community({ userId }) {
  if (!userId) {
    return (
      <div className="community-container">
        <p className="login-prompt">⚠️ 로그인 후 이용해 주세요.</p>
      </div>
    );
  }

  const [posts, setPosts]     = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    axios.get('http://localhost:3001/community/posts', {
      params: { user_id: userId }
    })
    .then(res => {
      setPosts(res.data);
      setErrorMsg('');
    })
    .catch(err => {
      console.error('피드 로드 실패:', err);
      setErrorMsg('피드를 불러오지 못했습니다.');
    });
  }, [userId]);

  const toggleLike = feedId => { /* TODO: 좋아요 API 연동 */ };
  const toggleComments = feedId => { /* TODO: 댓글 토글 */ };

  return (
    <div className="community-container">
      {errorMsg && <div className="error-msg">{errorMsg}</div>}
      {posts.map(post => (
        <article key={post.feed_id} className="post-final">
          <div className="post-author-section">
            <IoPersonCircleOutline className="profile-icon" />
            <p className="author-nickname">{post.author}</p>
            {!post.isMine && <button className="follow-btn">팔로우</button>}
          </div>
          <div className="post-image-container">
            <img src={post.imageUrl} alt="피드 이미지" className="post-image-final" />
          </div>
          <div className="post-actions-final">
            <button className="action-btn-final" onClick={() => toggleLike(post.feed_id)}>
              {post.liked ? <FaHeart /> : <FaRegHeart />}
              <span>{post.likeCount}</span>
            </button>
            <button className="action-btn-final" onClick={() => toggleComments(post.feed_id)}>
              <FaRegComment /><span>{post.commentCount}</span>
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
