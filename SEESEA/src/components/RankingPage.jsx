// File: src/components/RankingPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import '../style/RankingPage.css';
import { IoPersonCircleOutline } from 'react-icons/io5';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';

// 등급별 물고기 아이콘
import fishLevel1 from '../assets/fish_level1.png';
import fishLevel2 from '../assets/fish_level2.png';
import fishLevel3 from '../assets/fish_level3.png';
import fishLevel4 from '../assets/fish_level4.png';
import fishLevel5 from '../assets/fish_level5.png';

export default function RankingPage() {
  // MainLayout에서 내려주는 userId, nickname
  const { userId, nickname } = useOutletContext();

  // 내 카드 개수, 레벨, 경험치
  const [cardCount, setCardCount] = useState(0);
  const [myLevel, setMyLevel]     = useState(1);
  const [myExp, setMyExp]         = useState(0);

  // 전체 회원 랭킹 데이터
  const [rankingData, setRankingData] = useState([]);

  // 등급 아이콘 배열 (1~5레벨)
  const icons = [
    fishLevel1,
    fishLevel2,
    fishLevel3,
    fishLevel4,
    fishLevel5
  ];

  useEffect(() => {
    if (!userId) return;

    // 1) 내 카드 개수 불러와서 레벨/경험치 계산
    axios.get('http://localhost:3001/pokedex/cards', {
      params: { user_id: userId },
      withCredentials: true
    })
    .then(res => {
      const count = Array.isArray(res.data) ? res.data.length : 0;
      setCardCount(count);

      // 카드 2장마다 레벨 1업
      const lvl = Math.floor(count / 2) + 1;
      setMyLevel(lvl);

      // 카드 1장당 경험치 50%
      const expPct = (count % 2) * 50;
      setMyExp(expPct);
    })
    .catch(err => {
      console.error('내 카드 로드 실패:', err);
    });

    // 2) 전체 회원 랭킹 불러오기
    axios.get('http://localhost:3001/ranking/users', {
      withCredentials: true
    })
    .then(res => {
      setRankingData(res.data);
    })
    .catch(err => {
      console.error('랭킹 로드 실패:', err);
    });
  }, [userId]);

  // 같은 레벨은 동일 순위, 건너뛴 순위를 적용한 데이터 생성
  const dataWithRank = useMemo(() => {
    // 레벨 내림차순 정렬
    const sorted = [...rankingData].sort((a, b) => b.level - a.level);
    const result = [];
    let prevLevel = null;
    let prevRank  = 0;

    sorted.forEach((user, idx) => {
      // 이전 레벨과 다르면 현재 인덱스+1을 순위로, 같으면 이전 순위 유지
      const rank = user.level !== prevLevel ? idx + 1 : prevRank;
      result.push({ ...user, rank });
      prevLevel = user.level;
      prevRank  = rank;
    });

    return result;
  }, [rankingData]);

  // 내 아이콘: 레벨 1~5 범위로 클램핑
  const myIconIndex = Math.min(5, Math.max(1, myLevel)) - 1;
  const myIcon      = icons[myIconIndex];

  return (
    <div className="ranking-page">
      <div className="ranking-content">

        {/* ─── 내 프로필 & 진행도 ─────────────────────────── */}
        <div className="my-ranking-info">
          <div className="my-nickname">{nickname}</div>

          <div className="level-display">
            <img src={myIcon} alt={`Lv ${myLevel}`} className="fish-icon" />
            <span className="level-text">Lv {myLevel}</span>
            <div className="progress-bar-container">
              <div
                className="progress-bar"
                style={{ width: `${myExp}%` }}
              />
            </div>
            <span className="progress-percent">{myExp} %</span>
          </div>

          <div className="level-progression">
            {icons.map((ic, idx) => (
              <React.Fragment key={idx}>
                <img src={ic} alt={`Lv ${idx+1}`} />
                {idx < icons.length - 1 && <span>→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ─── 전체 랭킹 테이블 ─────────────────────────────── */}
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
            {dataWithRank.map((user) => {
              const lvl = Math.min(5, Math.max(1, user.level));
              return (
                <tr key={user.id}>
                  <td>
                    <span className="rank-number">{user.rank}</span>
                    <img
                      src={icons[lvl - 1]}
                      alt={`Lv ${user.level}`}
                      className="table-fish-img"
                    />
                  </td>
                  <td>
                    <IoPersonCircleOutline className="table-profile-icon" />
                  </td>
                  <td>{user.nickname}</td>
                  <td>Lv {user.level}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

      </div>
    </div>
  );
}
