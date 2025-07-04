// File: src/components/Login.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../style/login.css';

import googleIcon from '../assets/btn_google.svg';
import kakaoIcon  from '../assets/btn_kakao.svg';
import naverIcon  from '../assets/btn_naver.svg';

import axios from 'axios';

// 실제 로그인 요청 함수
const tryLogin = async (userId, password) => {
  try {
    const res = await axios.post(
      'http://localhost:3001/userLogin/login',
      { USER_ID: userId, PW: password },
      {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    return res.data.success;  // { success: true/false } 리턴을 가정
  } catch (err) {
    console.error('로그인 오류:', err.response?.data || err.message);
    return false;
  }
};

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

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [pw,    setPw]    = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // 1) OAuth 콜백 처리: URL에 ?user_id=… 가 있으면 자동 로그인
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const u = params.get('user_id');
    if (u) {
      onLoginSuccess(u);
      navigate('/community', { replace: true });
    }
  }, [location.search, onLoginSuccess, navigate]);

  // 뒤로가기 버튼: 항상 메인('/')으로 이동
  const handleBack = () => {
    navigate('/', { replace: true });
  };

  // 로그인 폼 제출 핸들러
  const handleLogin = async (e) => {
    e.preventDefault();
    const success = await tryLogin(email, pw);
    if (success) {
      onLoginSuccess(email);   // App.jsx로 userId 전달
      navigate('/community', { replace: true });
    } else {
      alert('로그인 실패: 아이디/비밀번호를 확인하세요.');
    }
  };

  // SNS 로그인 핸들러
  const handleSNSLogin = (provider) => {
    // 절대경로에 포트 3001을 반드시 포함!
    window.location.href = `http://localhost:3001/auth/${provider}`;
  };

  return (
    <div className="login-screen-container">
      <div className="back-icon" onClick={handleBack}>
        <BackIcon />
      </div>

      <br /><br />

      <div className="login-inner">
        <h2 className="login-title">로그인</h2>
        <p className="login-subtitle">
          본인의 이메일과 패스워드를 입력해주세요.
        </p>

        <br /><br /><br />

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label>이메일</label>
            <input
              type="email"
              placeholder="example@gmail.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>비밀번호</label>
            <input
              type="password"
              placeholder="**********"
              value={pw}
              onChange={e => setPw(e.target.value)}
              required
            />
          </div>

          <div className="forgot-pw">
            <Link to="/find-password">비밀번호를 잊어버렸나요?</Link>
          </div>
          <br />

          <div className="social-login-icons">
            <button
              type="button"
              className="sns-icon-btn"
              onClick={() => handleSNSLogin('google')}
            >
              <img src={googleIcon} alt="Google 로그인" />
            </button>
            <button
              type="button"
              className="sns-icon-btn"
              onClick={() => handleSNSLogin('kakao')}
            >
              <img src={kakaoIcon} alt="카카오톡 로그인" />
            </button>
            <button
              type="button"
              className="sns-icon-btn"
              onClick={() => handleSNSLogin('naver')}
            >
              <img src={naverIcon} alt="네이버 로그인" />
            </button>
          </div>
          <br />

          <button type="submit" className="login-btn">
            로그인
          </button>
        </form>

        <Link to="/join" className="signup-link">
          계정이 존재하지 않나요? <span>회원가입</span>
        </Link>
      </div>
    </div>
  );
}