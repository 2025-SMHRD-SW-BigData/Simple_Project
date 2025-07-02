// File: src/components/Community.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaRegComment } from 'react-icons/fa';
import '../style/Community.css';

export default function Community() {
  const { userId, setFollowers, setFollowing } = useOutletContext();

  const [posts, setPosts]               = useState([]);
  const [showComments, setShowComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [editingComment, setEditingComment] = useState({});
  const [errorMsg, setErrorMsg]         = useState('');
  const [showFullCaption, setShowFullCaption] = useState({});

  // 1) 피드 + 상태 로드
  useEffect(() => {
    if (!userId) {
      setErrorMsg('⚠️ 로그인 후 이용해 주세요.');
      return;
    }
    axios
      .get(
        `http://localhost:3001/community/posts?user_id=${encodeURIComponent(
          userId
        )}`,
        { withCredentials: true }
      )
      .then(res => setPosts(res.data))
      .catch(() => setErrorMsg('피드 로드에 실패했습니다.'));
  }, [userId]);

  // 좋아요 토글
  const handleLikeToggle = (feedId, liked, idx) => {
    const url    = `http://localhost:3001/community/${feedId}/like`;
    const method = liked ? 'delete' : 'post';
    axios({ method, url, data: { user_id: userId }, withCredentials: true })
      .then(() => {
        setPosts(ps => {
          const copy = [...ps];
          copy[idx].liked = !liked;
          copy[idx].likeCount += liked ? -1 : 1;
          return copy;
        });
      })
      .catch(err => console.error('좋아요 토글 실패:', err));
  };

  // 팔로우 토글
  const handleFollowToggle = (authorId, following, idx) => {
    const url    = `http://localhost:3001/community/${authorId}/follow`;
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

  // 댓글 창 토글
  const toggleComments = feedId => {
    setShowComments(sc => ({ ...sc, [feedId]: !sc[feedId] }));
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
          ps.map(p =>
            p.feedId === feedId
              ? {
                  ...p,
                  commentCount: p.commentCount + 1,
                  comments: [...p.comments, res.data]
                }
              : p
          )
        );
        setCommentInputs(ci => ({ ...ci, [feedId]: '' }));
      })
      .catch(err => console.error('댓글 등록 실패:', err));
  };

  // 댓글 수정
  const startEditing = commentId => {
    setEditingComment(ec => ({ ...ec, [commentId]: true }));
  };
  const submitEdit = (feedId, commentId) => {
    const text = commentInputs[commentId]?.trim();
    if (!text) {
      setEditingComment(ec => ({ ...ec, [commentId]: false }));
      return;
    }
    axios
      .put(
        `http://localhost:3001/community/${feedId}/comment/${commentId}`,
        { user_id: userId, text },
        { withCredentials: true }
      )
      .then(res => {
        setPosts(ps =>
          ps.map(p => {
            if (p.feedId === feedId) {
              p.comments = p.comments.map(c =>
                c.commentId === commentId ? res.data : c
              );
            }
            return p;
          })
        );
        setEditingComment(ec => ({ ...ec, [commentId]: false }));
      })
      .catch(err => console.error('댓글 수정 실패:', err));
  };

  // 댓글 삭제
  const deleteComment = (feedId, commentId) => {
    axios
      .delete(`http://localhost:3001/community/${feedId}/comment/${commentId}`, {
        data: { user_id: userId },
        withCredentials: true
      })
      .then(() => {
        setPosts(ps =>
          ps.map(p => {
            if (p.feedId === feedId) {
              p.comments = p.comments.filter(c => c.commentId !== commentId);
              p.commentCount--;
            }
            return p;
          })
        );
      })
      .catch(err => console.error('댓글 삭제 실패:', err));
  };

  if (errorMsg) return <div className="error-msg">{errorMsg}</div>;

  return (
    <>
      {posts.map((p, idx) => {
        // ★ 캡션 확장/축소 토글 상태
        const THRESHOLD = 80;
        const isLong = p.caption.length > THRESHOLD;
        const expanded = showFullCaption[p.feedId] || false;
        const displayText =
          isLong && !expanded
            ? p.caption.slice(0, THRESHOLD) + '...'
            : p.caption;

        return (
          <article key={p.feedId} className="post-final">
            {/* 작성자/팔로우 */}
            <div className="post-author-section">
              <p className="author-nickname">{p.author}</p>
              {!p.isMine && (
                <button
                  className={
                    p.following ? 'follow-btn following' : 'follow-btn'
                  }
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
              {p.images.length > 0 ? (
                p.images.map((url, i) => (
                  <img
                    key={i}
                    src={`http://localhost:3001${url}`}
                    alt="post"
                    className="post-image-final"
                  />
                ))
              ) : (
                <div className="no-image-placeholder" />
              )}
              <div className="post-caption-overlay-final">
                <p>
                  {displayText}
                  {isLong && (
                    <span
                      className="more-link"
                      onClick={() =>
                        setShowFullCaption(s => ({
                          ...s,
                          [p.feedId]: !expanded
                        }))
                      }
                    >
                      {expanded ? '생략...' : '더보기'}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* 좋아요 / 댓글 */}
            <div className="post-actions-final">
              <button
                onClick={() =>
                  handleLikeToggle(p.feedId, p.liked, idx)
                }
                className="action-btn-final"
              >
                {p.liked ? (
                  <FaHeart style={{ color: 'red' }} />
                ) : (
                  <FaRegHeart />
                )}
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
                {p.comments.map(c => (
                  <div key={c.commentId} className="comment-item">
                    <div className="comment-content">
                      <span className="comment-author">
                        {c.author}:
                      </span>
                      {editingComment[c.commentId] ? (
                        <input
                          type="text"
                          value={
                            commentInputs[c.commentId] ?? c.text
                          }
                          onChange={e =>
                            setCommentInputs(ci => ({
                              ...ci,
                              [c.commentId]: e.target.value
                            }))
                          }
                        />
                      ) : (
                        <span className="comment-text">
                          {c.text}
                        </span>
                      )}
                    </div>
                    {c.authorId === userId && (
                      <div className="comment-actions">
                        {editingComment[c.commentId] ? (
                          <button
                            onClick={() =>
                              submitEdit(
                                p.feedId,
                                c.commentId
                              )
                            }
                          >
                            등록
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              startEditing(c.commentId)
                            }
                          >
                            수정
                          </button>
                        )}
                        <button
                          onClick={() =>
                            deleteComment(
                              p.feedId,
                              c.commentId
                            )
                          }
                        >
                          삭제
                        </button>
                      </div>
                    )}
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
                  <button
                    onClick={() =>
                      submitComment(p.feedId)
                    }
                  >
                    등록
                  </button>
                </div>
              </div>
            )}
          </article>
        );
      })}
    </>
  );
}
