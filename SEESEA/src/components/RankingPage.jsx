import React from 'react';
import '../style/RankingPage.css';
import { IoPersonCircleOutline } from 'react-icons/io5'; // 프로필 아이콘 import

// 물고기 등급 이미지 import
import fishLevel1 from '../assets/fish_level1.png';
import fishLevel2 from '../assets/fish_level2.png';
import fishLevel3 from '../assets/fish_level3.png';
import fishLevel4 from '../assets/fish_level4.png';
import fishLevel5 from '../assets/fish_level5.png';

const RankingPage = () => {
  // 임시 랭킹 데이터
  const rankingData = [
    { id: 1, nickname: '사용자1', level: 25, fishImg: fishLevel5 },
    { id: 2, nickname: '사용자2', level: 23, fishImg: fishLevel4 },
    { id: 3, nickname: '사용자3', level: 20, fishImg: fishLevel4 },
    { id: 4, nickname: '사용자4', level: 18, fishImg: fishLevel3 },
    { id: 5, nickname: '사용자5', level: 15, fishImg: fishLevel1 },
  ];

  return (
    <div className="ranking-page">
      <div className="ranking-content">
        <div className="my-ranking-info">
          <div className="level-display">
            <img src={fishLevel1} alt="Fish Icon" className="fish-icon" /> {/* 물고기 아이콘 경로 수정 */}
            <span className="level-text">Lv 2</span>
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: '70%' }}></div> {/* 임시 진행률 */}
            </div>
            <span className="progress-percent">XX.X %</span>
          </div>
          <div className="level-progression">
            <img src={fishLevel1} alt="Fish Icon 1" />
            <span>→</span>
            <img src={fishLevel2} alt="Fish Icon 2" />
            <span>→</span>
            <img src={fishLevel3} alt="Fish Icon 3" />
            <span>→</span>
            <img src={fishLevel4} alt="Fish Icon 4" />
            <span>→</span>
            <img src={fishLevel5} alt="Fish Icon 5" />
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
                <td>
                  <span className="rank-number">{user.id}</span>
                  <img src={user.fishImg} alt="Fish" className="table-fish-img" />
                </td>
                <td><IoPersonCircleOutline className="table-profile-icon" /></td>
                <td>{user.nickname}</td>
                <td>Lv {user.level}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      </div>
  );
};

export default RankingPage;
