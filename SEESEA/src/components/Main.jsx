// src/components/Main.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/main.css';

const Main = () => {
  const navigate = useNavigate();
  return (
    <div className="screen-container">
      <div
        className="logo-circle"
        style={{
          backgroundImage: `url(/src/assets/Rogo.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      <h1 className="main-title">See Sea</h1>

      <div className="button-group">
        <button
          className="btn login-btn"
          onClick={() => navigate('/login', { state: { from: '/' } })}
        >
          로그인
        </button>
        <button
          className="btn signup-btn"
          onClick={() => navigate('/join', { state: { from: '/' } })}
        >
          회원가입
        </button>
      </div>
    </div>
  );
};

export default Main;
