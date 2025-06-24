import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../style/login.css';

import googleIcon from '../assets/btn_google.svg';
import kakaoIcon  from '../assets/btn_kakao.svg';
import naverIcon  from '../assets/btn_naver.svg';

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

const Login = () => {
  const [email, setEmail] = useState('');
  const [pw,    setPw]    = useState('');
  const navigate = useNavigate();

  const handleBack     = () => navigate(-1);
  const handleLogin    = e => { e.preventDefault(); console.log(email, pw); };
  const handleSNSLogin = provider => console.log(`${provider} 로그인`);

  return (
    <div className="login-screen-container">
      <div className="back-icon" onClick={handleBack}>
        <BackIcon />
      </div>
      <br />
      <br />
      <div className="login-inner">
        <h2 className="login-title">로그인</h2>
        <p className="login-subtitle">
          본인의 이메일이랑 패스워드를 입력해주세요.
        </p>
        <br></br>
        <br></br>
        <br></br>
        

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

          <div className="forgot-pw">비밀번호를 잊어버렸나요?</div>
          <br></br>

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
          <br></br>

          <button type="submit" className="login-btn" onClick={() => {navigate('/commumain')}}>
            로그인
          </button>
        </form>

        <Link to="/join" className="signup-link">
          계정이 존재하지 않나요? <span>회원가입</span>
        </Link>
      </div>
    </div>
  );
};

export default Login;
