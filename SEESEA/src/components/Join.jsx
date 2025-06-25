import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../style/join.css';  // 별도로 만들어 주세요

import axios from 'axios'

  const tryJoin =()=>{
    axios.get('http://localhost:3001/join')
    .then((res)=>{
      console.log(res)
    })
    .catch((err) => {
      console.error('에러 발생:', err);
    });
  }

// 뒤로가기 화살표 SVG (Login과 동일)
const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <path
      d="M15 18l-6-6 6-6"
      stroke="#34B3EB"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Join = () => {
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleBack = () => navigate(-1);
  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: 회원가입 처리
    console.log({ name, email, password, confirmPassword });
  };

  return (
    <div className="join-screen-container">
      {/* 뒤로가기 버튼 */}
      <br />
      <div className="back-icon" onClick={handleBack}>
        <BackIcon />
      </div>

      <div className="join-inner">
        {/* 타이틀 */}
        <h2 className="join-title">회원가입</h2>
        <p className="join-subtitle">
          계정 생성을 위한 세부사항을 입력해주세요.
        </p>
        <br />
        <br />
        <br />
        {/* 폼 */}
        <form onSubmit={handleSubmit} className="join-form">
          <div className="input-group">
            <label>이름</label>
            <input
              type="text"
              placeholder="이름을 입력하세요"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>이메일</label>
            <input
              type="email"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>비밀번호</label>
            <input
              type="password"
              placeholder="**********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>비밀번호 재확인</label>
            <input
              type="password"
              placeholder="다시 한 번 입력해주세요"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <br />
          <br />
          <br />

          <button type="submit" className="join-btn">
            계정생성
          </button>
        </form>

        {/* 로그인 링크 */}
        <Link to="/login" className="login-link" onClick={tryJoin}>
          이미 회원이신가요? <span>로그인</span>
        </Link>
      </div>
    </div>
  );
};

export default Join;
