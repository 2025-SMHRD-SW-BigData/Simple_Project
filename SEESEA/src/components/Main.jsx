import React from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import img from '../assets/Rogo.png'
import '../style/Main.css'

const Main = () => {
  const nav = useNavigate();
  return (
    <div className="screen-container">
      {/* 상단 로고 */}
        <div
        className="logo-circle"
        style={{ backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      ></div>

      {/* 앱 제목 */}
      <h1 className="title">See Sea</h1>

      {/* 버튼 그룹 */}
      <div className="button-group">
        <button className="btn login-btn" onClick={() => {nav('/login')}}>로그인</button>
        <button className="btn signup-btn">회원가입</button>
      </div>
    </div>
  )
}

export default Main