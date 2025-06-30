// File: src/components/Community.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../style/Community.css';
import { FaHeart, FaRegHeart, FaRegComment } from 'react-icons/fa';

const Community = ({ userId }) => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (!userId) return;
    axios
      .get(`http://localhost:3001/community/posts?user_id=${encodeURIComponent(userId)}`)
      .then(res => {
        // res.data 는 [{ feed_id, author, caption, imageUrl, likeCount, commentCount, isMine, liked }]
        // 백엔드에서 author는 NAME이었으니, 원한다면 authorId 필드를 추가로 보내도록 백엔드도 약간 수정이 필요합니다.
        // 우선 여기서 authorId를 author 대신 쓰겠습니다.
        const withId = res.data.map(item => ({
          ...item,
          authorId: item.author,    // 백엔드에서 author에 USER_ID를 넣도록 수정하셨다면 이 줄은 필요 없습니다.
          // author: item.author,   // NAME을 쓰려면 이대로 두세요.
        }));
        setPosts(withId);
      })
      .catch(err => console.error('피드 불러오기 실패:', err));
  }, [userId]);

  return (
    <div className="community-container">
      {posts.length === 0 && <p className="no-posts">등록된 피드가 없습니다.</p>}
      {posts.map(post => (
        <article className="post-final" key={post.feed_id}>
          <div className="post-author-section">
            {/* USER_ID를 앞에 보여줍니다 */}
            <p className="author-nickname">{post.authorId}</p>
            {/* 내 피드가 아니면 팔로우 버튼 */}
            {!post.isMine && (
              <button className="follow-btn" onClick={() => {/* 팔로우 로직 */}}>
                팔로우
              </button>
            )}
          </div>

          <div className="post-image-container">
            {/* 백엔드가 제공하는 상대경로 앞에 호스트 붙이기 */}
            <img
              src={`http://localhost:3001${post.imageUrl}`}
              alt="피드 이미지"
              className="post-image-final"
            />
            <div className="post-caption-overlay-final">
              <p>
                {post.caption}
                <span className="tags"> {post.tags ?? ''}</span>
              </p>
            </div>
          </div>

          <div className="post-actions-final">
            <button className="action-btn-final">
              {post.liked ? <FaHeart style={{ color: 'red' }} /> : <FaRegHeart />} 
              <span>{post.likeCount}</span>
            </button>
            <button className="action-btn-final">
              <FaRegComment /> <span>{post.commentCount}</span>
            </button>
          </div>
        </article>
      ))}
    </div>
  );
};

export default Community;
