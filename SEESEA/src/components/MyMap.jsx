// src/components/MyMap.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate }                from 'react-router-dom';
import { Map, MapMarker }             from 'react-kakao-maps-sdk';
import { IoArrowBack }                from 'react-icons/io5';
import { FiSearch }                   from 'react-icons/fi';
import { FaFishFins }                 from 'react-icons/fa6';
import { BsPlusSquare }               from 'react-icons/bs';
import { GoLocation }                 from 'react-icons/go';
import '../style/map.css';

// OpenWeatherMap API 키
const OWM_KEY = '1e9f27d719ce96ae1b72780b550e057f';

// 날씨 설명 한글 매핑
const descriptionMap = {
  'clear sky': '맑은 하늘',
  'few clouds': '구름 약간',
  'scattered clouds': '흩어진 구름',
  'broken clouds': '구름 많음',
  'overcast clouds': '흐림',
  'shower rain': '소나기',
  'rain': '비',
  'light rain': '약한 비',
  'moderate rain': '보통 비',
  'heavy intensity rain': '강한 비',
  'light intensity drizzle': '이슬비',
  'drizzle': '이슬비',
  'thunderstorm': '뇌우',
  'snow': '눈',
  'light snow': '약한 눈',
  'heavy snow': '강한 눈',
  'sleet': '진눈깨비',
  'mist': '안개',
  'smoke': '연기',
  'haze': '실안개',
  'fog': '짙은 안개',
  'sand': '모래',
  'dust': '먼지',
  'volcanic ash': '화산재',
  'squalls': '돌풍',
  'tornado': '토네이도',
};

export default function MyMap() {
  const navigate = useNavigate();

  // 상태 정의
  const [points, setPoints]             = useState([]);
  const [filteredPoints, setFilteredPoints] = useState([]);
  const [searchTerm, setSearchTerm]     = useState('');
  const [selected, setSelected]         = useState(null);
  const [weatherInfo, setWeather]       = useState(null);
  const [loading, setLoading]           = useState(true); // 로딩 플래그

  // 1) 서버에서 낚시터 정보(fetch) → state 세팅
  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch('http://localhost:3001/fishPoint/fishpoints');
        const data = await res.json();
        setPoints(data);
        setFilteredPoints(data);
      } catch (e) {
        console.error('API 오류:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 2) 검색어 입력에 따라 points 필터링
  useEffect(() => {
    if (!searchTerm) {
      setFilteredPoints(points);
    } else {
      const term = searchTerm.trim().toLowerCase();
      setFilteredPoints(
        points.filter(p => p.name.toLowerCase().includes(term))
      );
    }
  }, [searchTerm, points]);

  // 3) 마커 클릭 시 날씨 API 호출
  const handleMarkerClick = async pt => {
    setSelected(pt);
    setWeather(null);
    try {
      const resp = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${pt.lat}&lon=${pt.lng}&appid=${OWM_KEY}&units=metric`
      );
      if (!resp.ok) throw new Error(resp.statusText);
      const data = await resp.json();
      const raw = data.weather[0].description.toLowerCase();
      const desc = descriptionMap[raw] ||
                   raw.charAt(0).toUpperCase() + raw.slice(1);
      setWeather({
        temp: Number(data.main.temp),
        wind: Number(data.wind.speed),
        desc,
        icon: data.weather[0].icon,
      });
    } catch (e) {
      console.error('날씨 API 오류:', e);
      setWeather({ error: '날씨 정보를 불러올 수 없습니다.' });
    }
  };

  return (
    <div className="map-screen-container">
      {/* 로딩 중 오버레이 */}
      {loading && (
        <div className="loading-overlay">로딩 중…</div>
      )}

      {/* 헤더 */}
      <header className="map-header">
        <button className="back-icon" onClick={() => navigate(-1)}>
          <IoArrowBack />
        </button>
        <h2 className="map-title">지도</h2>
      </header>

      {/* 지도 + 검색창 */}
      <div className="map-wrapper">
        <div className="search-bar">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="낚시터명 검색하기"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <Map
          center={{ lat: 36.5, lng: 127.8 }}
          level={7}
          style={{ width: '100%', height: '100%' }}
          className="map-container"
        >
          {filteredPoints.map(pt => (
            <MapMarker
              key={pt.id}
              position={{ lat: pt.lat, lng: pt.lng }}
              onClick={() => handleMarkerClick(pt)}
            />
          ))}
        </Map>
      </div>

      {/* 정보 패널 */}
      {selected && (
        <div className="info-panel">
          <br></br>
          <br></br>
          <br></br>
          <br></br>
          <br></br>
          <h3 className="location-name">{selected.name}</h3>
          {selected.species ? (
            <p className="species-list">주요 어종: {selected.species}</p>
          ) : (
            <p className="species-list">등록된 어종 정보가 없습니다.</p>
          )}
          {weatherInfo && !weatherInfo.error && (
            <>
              <p className="weather-temp">{weatherInfo.temp.toFixed(1)}°C</p>
              <img
                className="weather-icon"
                src={`https://openweathermap.org/img/wn/${weatherInfo.icon}@2x.png`}
                alt="weather icon"
              />
              <p className="weather-desc">{weatherInfo.desc}</p>
              <p className="weather-wind-text">
                바람 {weatherInfo.wind.toFixed(1)} m/s
              </p>
            </>
          )}
          <button className="close-btn" onClick={() => setSelected(null)}>
            닫기
          </button>
        </div>
      )}

      {/* 하단 네비게이션 */}
      <nav className="bottom-nav-final">
        <button onClick={() => navigate('/pokedex')}>
          <FaFishFins /><span className="nav-label">도감</span>
        </button>
        <button onClick={() => navigate('/new')}>
          <BsPlusSquare /><span className="nav-label">생성</span>
        </button>
        <button onClick={() => navigate('/map')}>
          <GoLocation /><span className="nav-label">지도</span>
        </button>
      </nav>
    </div>
  );
}
