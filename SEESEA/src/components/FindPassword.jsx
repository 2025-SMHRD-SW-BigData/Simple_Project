// File: src/components/FindPassword.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../style/findPassword.css';

export default function FindPassword() {
  const [userId, setUserId] = useState('');
  const [msg,    setMsg]    = useState('');
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      // USER_ID로 비밀번호 조회 요청
      const res = await axios.post(
        'http://localhost:3001/userLogin/find-password',
        { USER_ID: userId },
        { withCredentials: true }
      );
      setMsg(`귀하의 비밀번호는: ${res.data.password}`);
    } catch (err) {
      setMsg(err.response?.data?.error || '요청 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="findpw-container">
      <h2>비밀번호 찾기</h2>

      {/* 로컬 계정 비밀번호 찾기 */}
      <div className="section">
        <p>가입하신 아이디를 입력하시면<br/>비밀번호를 알려드립니다.</p>
        <form onSubmit={handleSubmit} className="findpw-form">
          <label>아이디 (SEESEA)</label>
          <input
            type="text"
            placeholder="아이디를 입력하세요"
            value={userId}
            onChange={e => setUserId(e.target.value)}
            required
          />
          <button type="submit">확인하기</button>
        </form>
        {msg && <div className="findpw-msg">{msg}</div>}
      </div>

      {/* SNS 계정 비밀번호 찾기 안내 */}
      <div className="section social-reset">
        <p>SNS 계정 비밀번호를 잊으셨나요? 아래에서 이용 중인 서비스를 선택해주세요.</p>
        <div className="sns-links">
          <a href="https://accounts.google.com/signin/recovery" target="_blank" rel="noopener noreferrer">
            Google 비밀번호 찾기
          </a>
          <a href="https://accounts.kakao.com/weblogin/find_password?continue=https%3A%2F%2Faccounts.kakao.com%2Fweblogin%2Faccount%2Finfo" target="_blank" rel="noopener noreferrer">
            Kakao 비밀번호 찾기
          </a>
          <a href="https://nid.naver.com/user2/help/pwInquiry?lang=ko_KR" target="_blank" rel="noopener noreferrer">
            Naver 비밀번호 찾기
          </a>
        </div>
      </div>

      {/* 뒤로가기 */}
      <button className="back-login" onClick={() => navigate('/login')}>
        로그인 화면으로 돌아가기
      </button>
    </div>
  );
}
