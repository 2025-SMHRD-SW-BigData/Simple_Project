import React from 'react';
import Header from './Header'; // 기존 Header 컴포넌트 import
import '../style/RankingPage.css';

const RankingPage = () => {
  // 임시 랭킹 데이터
  const rankingData = [
    { id: 1, nickname: '사용자1', level: 25, profileImg: 'https://via.placeholder.com/50' },
    { id: 2, nickname: '사용자2', level: 23, profileImg: 'https://via.placeholder.com/50' },
    { id: 3, nickname: '사용자3', level: 20, profileImg: 'https://via.placeholder.com/50' },
    { id: 4, nickname: '사용자4', level: 18, profileImg: 'https://via.placeholder.com/50' },
    { id: 5, nickname: '사용자5', level: 15, profileImg: 'https://via.placeholder.com/50' },
  ];

  return (
    <div className="ranking-page">
      <Header /> {/* 기존 Header 컴포넌트 사용 */}

      <div className="ranking-content">
        <div className="my-ranking-info">
          <div className="level-display">
            <img src="https://via.placeholder.com/50" alt="Fish Icon" className="fish-icon" /> {/* 물고기 아이콘 경로 수정 필요 */}
            <span className="level-text">Lv 2</span>
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: '70%' }}></div> {/* 임시 진행률 */}
            </div>
            <span className="progress-percent">XX.X %</span>
          </div>
          <div className="level-progression">
            <img src="https://via.placeholder.com/30" alt="Fish Icon 1" />
            <span>→</span>
            <img src="https://via.placeholder.com/30" alt="Fish Icon 2" />
            <span>→</span>
            <img src="https://via.placeholder.com/30" alt="Fish Icon 3" />
            <span>→</span>
            <img src="https://via.placeholder.com/30" alt="Fish Icon 4" />
            <span>→</span>
            <img src="https://via.placeholder.com/30" alt="Fish Icon 5" />
          </div>
        </div>

        <table className="ranking-table">
          <thead>
            <tr>
              <th>순위</th>
              <th>프로필</th>
              <th>닉네임</th>
              <th>레벨</th>
            </tr>
          </thead>
          <tbody>
            {rankingData.map((user, index) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td><img src={user.profileImg} alt="Profile" className="table-profile-img" /></td>
                <td>{user.nickname}</td>
                <td>Lv {user.level}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="footer">
        {/* 하단 네비게이션 버튼 (현재 3개) */}
        <button className="nav-button">🏠 홈</button>
        <button className="nav-button">➕ 생성</button>
        <button className="nav-button">🗺️ 지도</button>
      </footer>
    </div>
  );
};

export default RankingPage;
