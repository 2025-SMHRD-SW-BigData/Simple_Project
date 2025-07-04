// File: src/components/Join.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../style/join.css';
import axios from 'axios';

// 뒤로가기 화살표 SVG
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
  const [name, setName]               = useState('');
  const [userId, setUserId]           = useState('');
  const [password, setPassword]       = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [age, setAge]                 = useState('');
  const [nameError, setNameError]     = useState('');
  const navigate = useNavigate();

  const handleBack = () => navigate(-1);

  // 닉네임 입력 시 최대 5글자 제한
  const handleNameChange = e => {
    const value = e.target.value;
    if (value.length > 5) {
      setNameError('닉네임은 5글자 이내로 입력해주세요.');
      setName(value.slice(0, 5));
    } else {
      setNameError('');
      setName(value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (name.length === 0) {
      setNameError('닉네임을 입력해주세요.');
      return;
    }

    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    tryJoin();
  };

  // 서버로 회원가입 정보 전송
  const tryJoin = () => {
    axios.post('http://localhost:3001/userJoin/join', {
      USER_ID: userId,
      PW: password,
      NAME: name,
      AGE: age
    })
    .then((res) => {
      console.log('서버 응답:', res);
      alert('회원가입 완료!');
      navigate('/login');
    })
    .catch((err) => {
      console.error('에러 발생:', err);
      if (err.response && err.response.data && err.response.data.message) {
        alert(err.response.data.message);
      } else {
        alert('회원가입 실패');
      }
    });
  };

  return (
    <div className="join-screen-container">
      <div className="back-icon" onClick={handleBack}>
        <BackIcon />
      </div>

      <div className="join-inner">
        <h2 className="join-title">회원가입</h2>
        <p className="join-subtitle">계정 생성을 위한 세부사항을 입력해주세요.</p>

        <form onSubmit={handleSubmit} className="join-form">
          <div className="input-group">
            <label>닉네임 (최대 5글자)</label>
            <input
              type="text"
              placeholder="사용하실 닉네임을 입력하세요"
              value={name}
              onChange={handleNameChange}
              required
            />
            {nameError && <div className="input-error">{nameError}</div>}
          </div>

          <div className="input-group">
            <label>아이디 (이메일)</label>
            <input
              type="email"
              placeholder="example@gmail.com"
              value={userId}
              onChange={e => setUserId(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>비밀번호</label>
            <input
              type="password"
              placeholder="**********"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>비밀번호 재확인</label>
            <input
              type="password"
              placeholder="다시 한 번 입력해주세요"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>나이</label>
            <input
              type="number"
              placeholder="나이를 입력하세요"
              value={age}
              onChange={e => setAge(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="join-btn" disabled={!!nameError}>
            계정생성
          </button>
        </form>

        <Link to="/login" className="login-link">
          이미 회원이신가요? <span>로그인</span>
        </Link>
      </div>
    </div>
  );
};

export default Join;