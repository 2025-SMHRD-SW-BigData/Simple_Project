// File: src/components/FeedUpload.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate }   from 'react-router-dom';
import axios             from 'axios';
import '../style/FeedUpload.css';
import { IoPersonCircleOutline } from 'react-icons/io5';

export default function FeedUpload({ userId }) {
  const navigate     = useNavigate();
  const fileInputRef = useRef(null);

  const [caption, setCaption]       = useState('');
  const [imageFiles, setImageFiles] = useState([]);    // 여러 파일 저장
  const [errorMsg, setErrorMsg]     = useState('');
  const [userName, setUserName]     = useState('');

  // 마운트 시 회원 이름 조회
  useEffect(() => {
    if (!userId) return;
    axios
      .get(`http://localhost:3001/community/member/${encodeURIComponent(userId)}`, {
        withCredentials: true
      })
      .then(res => setUserName(res.data.name))
      .catch(() => setUserName(userId));
  }, [userId]);

  // 파일 선택 처리: 기존 목록에 추가
  const handleFileChange = e => {
    const newFiles = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...newFiles]);
    // 같은 파일 재선택 이벤트 발생시키기 위해 value 초기화
    e.target.value = null;
  };

  const handleSubmit = async () => {
    if (!userId) {
      setErrorMsg('⚠️ 로그인 후 업로드 가능합니다.');
      return;
    }
    if (!caption.trim() || imageFiles.length === 0) {
      setErrorMsg('글과 최소 한 개의 이미지를 입력해주세요.');
      return;
    }
    setErrorMsg('');

    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('contents', caption);
    imageFiles.forEach(file => formData.append('images', file));

    try {
      await axios.post(
        'http://localhost:3001/community/upload',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        }
      );
      navigate('/community');
    } catch (err) {
      console.error('업로드 실패:', err.response?.data || err);
      setErrorMsg(err.response?.data?.error || '업로드 실패');
    }
  };

  const removeFile = index => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="feed-upload-page">
      {errorMsg && <div className="error-msg">{errorMsg}</div>}

      <h2 className="upload-page-title">피드 업로드</h2>

      <main className="upload-content-area">
        <div className="upload-form-container">
          <div className="upload-author-info">
            <IoPersonCircleOutline className="upload-author-icon" />
            <span className="upload-author-nickname">{userName}</span>
          </div>

          <textarea
            className="upload-textarea"
            placeholder="글을 작성해주세요."
            rows={10}
            value={caption}
            onChange={e => setCaption(e.target.value)}
          />

          <div className="upload-file-section">
            <ul className="file-list">
              {imageFiles.map((file, idx) => (
                <li key={idx}>
                  {file.name}
                  <button
                    type="button"
                    className="remove-file-btn"
                    onClick={() => removeFile(idx)}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
            <label
              htmlFor="file-upload"
              className="upload-file-btn"
            >
              파일 선택
            </label>
            <input
              id="file-upload"
              type="file"
              name="images"
              accept="image/*"
              multiple
              ref={fileInputRef}
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
