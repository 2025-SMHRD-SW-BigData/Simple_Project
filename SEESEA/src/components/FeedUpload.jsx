// src/components/FeedUpload.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/FeedUpload.css'; 

import { IoPersonCircleOutline } from "react-icons/io5";

const FeedUpload = ({ onUpload }) => { // 2. onUpload 함수를 props로 받음
    const navigate = useNavigate();
    const [caption, setCaption] = useState('');
    const [imageFile, setImageFile] = useState(null);

    const handleCancel = () => navigate(-1);

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };
    
    // 3. 완료 버튼 클릭 시 실행될 함수
    const handleSubmit = () => {
        if (!caption || !imageFile) {
            alert('글과 이미지를 모두 입력해주세요.');
            return;
        }
        // 부모에게 새로운 게시물 데이터를 전달
        onUpload({
            author: '닉네임', // 실제로는 로그인된 사용자 정보
            image: URL.createObjectURL(imageFile), // 임시 이미지 URL 생성
            caption: caption,
            tags: '#새글 #React',
            initialLikes: 0,
            comments: 0
        });
        navigate('/community'); // 업로드 후 커뮤니티 페이지로 이동
    };

    return (
        <div className="feed-upload-page">
            <h2 className="upload-page-title">피드업로드</h2>
                <main className="upload-content-area">
                                
                <div className="upload-form-container">
                    <div className="upload-author-info">
                        <IoPersonCircleOutline className="upload-author-icon" />
                        <span className="upload-author-nickname">@닉네임</span>
                    </div>

                    {/* 4. textarea 높이 조정을 위해 rows 속성 추가 */}
                    <textarea 
                        className="upload-textarea" 
                        placeholder="글을 작성해주세요."
                        rows="10" 
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                    ></textarea>

                    <div className="upload-file-section">
                        <span className="upload-file-placeholder">
                            {imageFile ? imageFile.name : '...'}
                        </span>
                        <label htmlFor="file-upload" className="upload-file-btn">
                            파일 선택
                        </label>
                        <input type="file" id="file-upload" onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />
                    </div>
                </div>
            </main>

            <footer className="upload-footer-buttons">
                <button className="upload-action-btn upload-complete-btn" onClick={handleSubmit}>완료</button>
                <button className="upload-action-btn upload-cancel-btn" onClick={handleCancel}>취소</button>
            </footer>
        </div>
    );
};


export default FeedUpload;