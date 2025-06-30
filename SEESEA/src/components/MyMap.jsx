import React, { useEffect, useState } from 'react';
import { Map, MapMarker } from 'react-kakao-maps-sdk';
import { FiSearch }      from 'react-icons/fi';
import '../style/map.css';

// OpenWeatherMap API 키
const OWM_KEY = '1e9f27d719ce96ae1b72780b550e057f';

// 날씨 설명 한글 매핑
const descriptionMap = {
  'clear sky':             '맑은 하늘',
  'few clouds':            '구름 약간',
  'scattered clouds':      '흩어진 구름',
  'broken clouds':         '구름 많음',
  'overcast clouds':       '흐림',
  'shower rain':           '소나기',
  'rain':                  '비',
  'light rain':            '약한 비',
  'moderate rain':         '보통 비',
  'heavy intensity rain':  '강한 비',
  'drizzle':               '이슬비',
  'thunderstorm':          '뇌우',
  'snow':                  '눈',
  'mist':                  '안개',
  'fog':                   '짙은 안개',
  'sand':                  '모래',
  'dust':                  '먼지',
  'tornado':               '토네이도',
};

export default function MyMap() {
  const [points, setPoints]           = useState([]);
  const [filteredPoints, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm]   = useState('');
  const [selected, setSelected]       = useState(null);
  const [weatherInfo, setWeatherInfo] = useState(null);
  const [loading, setLoading]         = useState(true);

  // 낚시터 목록 로드
  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch('http://localhost:3001/fishPoint/fishPoints');
        const data = await res.json();
        console.log('▶▶ Map received points:', data);
        setPoints(data);
        setFiltered(data);
      } catch (e) {
        console.error('API 오류:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 검색어 필터링
  useEffect(() => {
    if (!searchTerm) {
      setFiltered(points);
    } else {
      const term = searchTerm.trim().toLowerCase();
      setFiltered(
        points.filter(p => p.name.toLowerCase().includes(term))
      );
    }
  }, [searchTerm, points]);

  // 마커 클릭 시 날씨 조회
  const handleMarkerClick = async pt => {
    setSelected(pt);
    setWeatherInfo(null);
    try {
      const resp = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${pt.lat}&lon=${pt.lng}&appid=${OWM_KEY}&units=metric`
      );
      if (!resp.ok) throw new Error(resp.statusText);
      const data = await resp.json();
      const raw  = data.weather[0].description.toLowerCase();
      const desc = descriptionMap[raw] ??
                   raw.charAt(0).toUpperCase() + raw.slice(1);
      setWeatherInfo({
        temp: Number(data.main.temp),
        wind: Number(data.wind.speed),
        desc,
        icon: data.weather[0].icon
      });
    } catch (e) {
      console.error('날씨 API 오류:', e);
      setWeatherInfo({ error: '날씨 정보를 불러올 수 없습니다.' });
    }
  };

  return (
    <>
      {loading && <div className="loading-overlay">로딩 중…</div>}

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

      {selected && (
        <div className="info-panel">
          <br></br>
          <br></br>
          <br></br>
          <br></br>
          <br></br>
          <h3 className="location-name">{selected.name}</h3>

          <p className="species-list">
            주요 어종: {selected.species?.trim() || '정보 없음'}
          </p>

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
          {weatherInfo?.error && (
            <p className="weather-error">{weatherInfo.error}</p>
          )}

          <button
            className="close-btn"
            onClick={() => setSelected(null)}
          >
            닫기
          </button>
        </div>
      )}
    </>
  );
}
