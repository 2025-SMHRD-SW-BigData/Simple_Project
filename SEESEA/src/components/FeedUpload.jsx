// File: src/components/FeedUpload.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate }   from 'react-router-dom';
import axios             from 'axios';
import '../style/FeedUpload.css';
import { IoPersonCircleOutline } from 'react-icons/io5';

export default function FeedUpload({ userId }) {
  const navigate = useNavigate();
  const [caption, setCaption]     = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [errorMsg, setErrorMsg]   = useState('');
  const [userName, setUserName]   = useState('');  // 여기에 이름 저장

  // 1) 마운트 시 userId로 한 번만 이름 조회 (경로 수정)
  useEffect(() => {
    if (!userId) return;
    axios
      .get(`http://localhost:3001/community/member/${encodeURIComponent(userId)}`)
      .then(res => {
        setUserName(res.data.name);             // { name: "홍길동" } 형태 응답 가정
      })
      .catch(err => {
        console.error('회원 이름 조회 실패:', err);
        setUserName(userId);                    // 실패 시 fallback
      });
  }, [userId]);

  const handleFileChange = e => setImageFile(e.target.files[0] || null);

  const handleSubmit = async () => {
    if (!userId) {
      setErrorMsg('⚠️ 로그인 후 업로드 가능합니다.');
      return;
    }
    if (!caption || !imageFile) {
      setErrorMsg('글과 이미지를 모두 입력해주세요.');
      return;
    }
    setErrorMsg('');

    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('contents', caption);
    formData.append('image', imageFile);

    try {
      await axios.post('http://localhost:3001/community/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate('/community');
    } catch (err) {
      console.error('업로드 실패:', err);
      const msg = err.response?.data?.error || '업로드에 실패했습니다. 다시 시도해주세요.';
      setErrorMsg(msg);
    }
  };

  return (
    <div className="feed-upload-page">
      {errorMsg && <div className="error-msg">{errorMsg}</div>}

      <h2 className="upload-page-title">피드 업로드</h2>

      <main className="upload-content-area">
        <div className="upload-form-container">
          <div className="upload-author-info">
            <IoPersonCircleOutline className="upload-author-icon" />
            {/* userId 대신 userName을 보여줍니다 */}
            <span className="upload-author-nickname">@{userName}</span>
          </div>

          <textarea
            className="upload-textarea"
            placeholder="글을 작성해주세요."
            rows={10}
            value={caption}
            onChange={e => setCaption(e.target.value)}
          />

          <div className="upload-file-section">
            <span className="upload-file-placeholder">
              {imageFile ? imageFile.name : '파일을 선택해주세요.'}
            </span>
            <label htmlFor="file-upload" className="upload-file-btn">
              파일 선택
            </label>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>
        </div>
      </main>

      <footer className="upload-footer-buttons">
        <button
          className="upload-action-btn upload-complete-btn"
          onClick={handleSubmit}
        >
          완료
        </button>
        <button
          className="upload-action-btn upload-cancel-btn"
          onClick={() => navigate(-1)}
        >
          취소
        </button>
      </footer>
    </div>
  );
}
