import React, { useState } from 'react';
import '../style/Community.css';

import { FaHeart, FaRegHeart, FaRegComment } from 'react-icons/fa';
import postImage1 from '../assets/fishing-post-woman.jpg';
import postImage2 from '../assets/fishing-post.jpg';
import postImage3 from '../assets/fishing-post-esul.jpg';

// --- 헤더와 하단 네비 관련 import와 컴포넌트 정의는 모두 삭제되었습니다. ---

// --- 게시물(피드) 컴포넌트 (이 부분은 그대로 유지) ---
const Post = ({ author, image, caption, tags, initialLikes, initialCommentsCount }) => {
  const [liked, setLiked]        = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikes);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showComments, setShowComments] = useState(false); // 댓글창 표시 여부
  const [comments, setComments] = useState([]); // 댓글 목록
  const [newCommentText, setNewCommentText] = useState(''); // 새 댓글 입력 텍스트
  const [editingCommentId, setEditingCommentId] = useState(null); // 수정 중인 댓글 ID
  const [displayCommentsCount, setDisplayCommentsCount] = useState(initialCommentsCount); // 동적 댓글 수
  const [showFullCaption, setShowFullCaption] = useState(false); // 전체 글 보기 상태

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };
   const handleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  const handleCommentToggle = () => {
    setShowComments(!showComments);
  };

  const handleAddComment = () => {
    if (newCommentText.trim() === '') return;

    const newComment = {
      id: Date.now(), // 고유 ID 생성
      author: '현재 사용자', // 실제로는 로그인된 사용자 닉네임
      text: newCommentText,
    };
    setComments([...comments, newComment]);
    setNewCommentText('');
    setDisplayCommentsCount(prevCount => prevCount + 1); // 댓글 수 증가
  };

  const handleEditComment = (id, newText) => {
    setComments(comments.map(comment => 
      comment.id === id ? { ...comment, text: newText, editingText: undefined } : comment
    ));
    setEditingCommentId(null);
  };

  const handleDeleteComment = (id) => {
    setComments(comments.filter(comment => comment.id !== id));
    setDisplayCommentsCount(prevCount => prevCount - 1); // 댓글 수 감소
  };

  // 글 내용이 25자를 초과하는지 확인
  const isLongCaption = caption.length > 25;
  // 표시할 글 내용 (전체 또는 줄인 글)
  const displayCaption = showFullCaption || !isLongCaption
    ? caption
    : caption.substring(0, 25) + '...';

  const handleToggleCaption = (e) => {
    e.preventDefault(); // 링크 기본 동작 방지
    setShowFullCaption(!showFullCaption);
  };

  return (
    <article className="post-final">
      <div className="post-author-section">
        <p className="author-nickname">{author}</p>
        <button
          className={isFollowing ? 'follow-btn following' : 'follow-btn'}
          onClick={handleFollow}
        >
          {isFollowing ? '팔로잉' : '팔로우'}
        </button>
      </div>
      <div className="post-image-container">
        <img src={image} alt="낚시 조과" className="post-image-final" />
        <div className={`post-caption-overlay-final ${showFullCaption ? 'full-overlay' : ''}`}> {/* 클래스 동적 추가 */}
          <p>
            {displayCaption}
            {isLongCaption && !showFullCaption && (
              <a href="#" className="more-link" onClick={handleToggleCaption}>자세히보기</a>
            )}
            <span className="tags"> {tags}</span>
            {showFullCaption && isLongCaption && (
              <span className="collapse-caption-link" onClick={handleToggleCaption}> 접기</span>
            )}
          </p>
        </div>
      </div>
      <div className="post-actions-final">
        <button className="action-btn-final" onClick={handleLike}>
          {liked ? <FaHeart style={{ color: 'red' }} /> : <FaRegHeart />}
          <span>{likeCount}</span>
        </button>
        <button className="action-btn-final" onClick={handleCommentToggle}> {/* 댓글 버튼에 토글 함수 연결 */}
          <FaRegComment /> <span>{displayCommentsCount}</span>
        </button>
      </div>

      {showComments && (
        <div className="comments-section">
          <div className="comment-input-area">
            <input
              type="text"
              placeholder="댓글을 입력하세요..."
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
            />
            <button onClick={handleAddComment}>등록</button>
          </div>
          <div className="comments-list">
            {comments.map(comment => (
              <div key={comment.id} className="comment-item">
                <div className="comment-content">
                  <span className="comment-author">{comment.author}:</span>
                  {editingCommentId === comment.id ? (
                    <input
                      type="text"
                      value={comment.editingText !== undefined ? comment.editingText : comment.text}
                      onChange={(e) => setComments(comments.map(c => c.id === comment.id ? { ...c, editingText: e.target.value } : c))}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') handleEditComment(comment.id, e.target.value);
                      }}
                    />
                  ) : (
                    <span className="comment-text">{comment.text}</span>
                  )}
                </div>
                <div className="comment-actions">
                  {editingCommentId === comment.id && (
                    <button onClick={() => handleEditComment(comment.id, comment.editingText !== undefined ? comment.editingText : comment.text)}>등록</button>
                  )}
                  <button onClick={() => setEditingCommentId(comment.id)}>수정</button>
                  <button onClick={() => handleDeleteComment(comment.id)}>삭제</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
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
      caption="대어잡았땅~ 야호!!! 오랜만에 손맛 제대로 봤어요ㅎㅎ 햇살은 뜨겁지만 마음은 시원~~ 낚시는 진짜 힐링 그 자체❤️ 다음엔 더 큰 거 노려봅니다~! "
      tags="#바다 #낚시 #선크림 #맞팔 #모자"
      initialLikes={15386}
      initialCommentsCount={57126} // 숫자 그대로 전달
    />
    <Post
      author="동대문호랑이"
      image={postImage2}
      caption="좋은 날씨^^ 햇님들 덕분에 오늘 큰~놈 하나 잡았네요^^ 마누라가 소주 먹지 말랬는데 오늘은 못참고 마셔브러야겠네요 청춘은 바로 지금!!! 아따 날도 좋고 기분도 좋고 사나이 인생 참 재밌다 으하하하!!!"
      tags="#소주 #청춘"
      initialLikes={325}
      initialCommentsCount={68} // 숫자 그대로 전달
    />
    <Post
      author="참esul"
      image={postImage3}
      caption="배스 낚시 성공적"
      tags="#배스 #루어낚시"
      initialLikes={1024}
      initialCommentsCount={128} // 숫자 그대로 전달
    />
  </>
);

export default Community;