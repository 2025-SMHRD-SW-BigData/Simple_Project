// File: src/components/Community.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaRegComment } from 'react-icons/fa';
import '../style/Community.css';

export default function Community() {
  // MainLayout에서 내려준 context
  const { userId, setFollowers, setFollowing } = useOutletContext();

  const [posts, setPosts]       = useState([]);
  const [showComments, setShow] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!userId) {
      setErrorMsg('⚠️ 로그인 후 이용해 주세요.');
      return;
    }
    // 피드 + 좋아요·팔로우 상태 포함해서 불러오기
    axios
      .get(
        `http://localhost:3001/community/posts?user_id=${encodeURIComponent(userId)}`,
        { withCredentials: true }
      )
      .then(res => setPosts(res.data))
      .catch(() => setErrorMsg('피드 로드에 실패했습니다.'));
  }, [userId]);

  // 좋아요 토글
  const handleLikeToggle = (feedId, liked, idx) => {
    const url = `http://localhost:3001/community/${feedId}/like`;
    const method = liked ? 'delete' : 'post';
    axios({
      method,
      url,
      data: { user_id: userId },
      withCredentials: true
    })
      .then(() => {
        setPosts(ps => {
          const copy = [...ps];
          copy[idx].liked = !liked;
          copy[idx].likeCount += liked ? -1 : 1;
          return copy;
        });
      })
      .catch(err => {
        if (err.response?.status === 409) {
          // 이미 누른 좋아요 취소
          handleLikeToggle(feedId, true, idx);
        } else {
          console.error('좋아요 토글 실패:', err);
        }
      });
  };

  // 팔로우 토글
  const handleFollowToggle = (authorId, following, idx) => {
    const url    = `http://localhost:3001/community/${encodeURIComponent(authorId)}/follow`;
    const method = following ? 'delete' : 'post';
    axios({ method, url, data: { user_id: userId }, withCredentials: true })
      .then(() => {
        setPosts(ps => {
          const copy = [...ps];
          copy[idx].following = !following;
          return copy;
        });
        setFollowing(f => f + (following ? -1 : 1));
      })
      .catch(err => console.error('팔로우 토글 실패:', err));
  };

  // 댓글 토글 (열기 시 서버에서 기존 댓글 다시 가져오기)
  const toggleComments = feedId => {
    setShow(sc => ({ ...sc, [feedId]: !sc[feedId] }));
    if (!showComments[feedId]) {
      axios
        .get(`http://localhost:3001/community/${feedId}/comments`, { withCredentials: true })
        .then(res => {
          setPosts(ps =>
            ps.map(p =>
              p.feedId === feedId
                ? { ...p, comments: res.data }
                : p
            )
          );
        })
        .catch(err => console.error('댓글 로드 실패:', err));
    }
  };

  // 댓글 등록
  const submitComment = feedId => {
    const text = (commentInputs[feedId] || '').trim();
    if (!text) return;
    axios
      .post(
        `http://localhost:3001/community/${feedId}/comment`,
        { user_id: userId, text },
        { withCredentials: true }
      )
      .then(res => {
        setPosts(ps =>
          ps.map(p => {
            if (p.feedId === feedId) {
              return {
                ...p,
                commentCount: p.commentCount + 1,
                comments: [...(p.comments || []), res.data]
              };
            }
            return p;
          })
        );
        setCommentInputs(ci => ({ ...ci, [feedId]: '' }));
      })
      .catch(err => console.error('댓글 등록 실패:', err));
  };

  if (errorMsg) return <div className="error-msg">{errorMsg}</div>;

  return (
    <>
      {posts.map((p, idx) => (
        <article key={p.feedId} className="post-final">
          {/* 작성자/팔로우 */}
          <div className="post-author-section">
            <p className="author-nickname">{p.author}</p>
            {!p.isMine && (
              <button
                className={p.following ? 'follow-btn following' : 'follow-btn'}
                onClick={() =>
                  handleFollowToggle(p.authorId, p.following, idx)
                }
              >
                {p.following ? '팔로잉' : '팔로우'}
              </button>
            )}
          </div>

          {/* 이미지 캐러셀 */}
          <div className="post-image-container">
            <div className="image-carousel">
              {p.images.map((url, i) => (
                <img
                  key={i}
                  src={`http://localhost:3001${url}`}
                  alt="post"
                  className="post-image-final"
                />
              ))}
            </div>
            <div className="post-caption-overlay-final">
              <p>{p.caption}</p>
            </div>
          </div>

          {/* 좋아요 / 댓글 */}
          <div className="post-actions-final">
            <button
              onClick={() => handleLikeToggle(p.feedId, p.liked, idx)}
              className="action-btn-final"
            >
              {p.liked ? <FaHeart style={{ color: 'red' }} /> : <FaRegHeart />} 
              <span>{p.likeCount}</span>
            </button>
            <button
              onClick={() => toggleComments(p.feedId)}
              className="action-btn-final"
            >
              <FaRegComment /> <span>{p.commentCount}</span>
            </button>
          </div>

          {/* 댓글창 */}
          {showComments[p.feedId] && (
            <div className="comments-section">
              {(p.comments || []).map(c => (
                <div key={c.commentId} className="comment-item">
                  <div className="comment-content">
                    <span className="comment-author">{c.author}:</span> {c.text}
                  </div>
                </div>
              ))}
              <div className="comment-input-area">
                <input
                  type="text"
                  placeholder="댓글을 입력하세요..."
                  value={commentInputs[p.feedId] || ''}
                  onChange={e =>
                    setCommentInputs(ci => ({
                      ...ci,
                      [p.feedId]: e.target.value
                    }))
                  }
                />
                <button onClick={() => submitComment(p.feedId)}>
                  등록
                </button>
              </div>
            </div>
          )}
        </article>
      ))}
    </>
  );
}
