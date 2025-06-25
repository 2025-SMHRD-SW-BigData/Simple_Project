import React, { useEffect, useState } from 'react';
import { useNavigate }                from 'react-router-dom';
import { Map, MapMarker }             from 'react-kakao-maps-sdk';
import * as XLSX                      from 'xlsx';
import { IoArrowBack }                from 'react-icons/io5';
import { FiSearch }                   from 'react-icons/fi';
import { FaFishFins }                 from 'react-icons/fa6';
import { BsPlusSquare }               from 'react-icons/bs';
import { GoLocation }                 from 'react-icons/go';
import '../style/map.css';

const BASE_URL   = import.meta.env.BASE_URL;
const XLSX_FILES = Array.from({ length: 11 }, (_, i) =>
  `${BASE_URL}data/points${i + 1}.xlsx`
);

const OWM_KEY = '1e9f27d719ce96ae1b72780b550e057f';
const descriptionMap = {
  'clear sky':               '맑은 하늘',
  'few clouds':              '구름 약간',
  'scattered clouds':        '흩어진 구름',
  'broken clouds':           '구름 많음',
  'overcast clouds':         '흐림',
  'shower rain':             '소나기',
  'rain':                    '비',
  'light rain':              '약한 비',
  'moderate rain':           '보통 비',
  'heavy intensity rain':    '강한 비',
  'light intensity drizzle': '이슬비',
  'drizzle':                 '이슬비',
  'thunderstorm':            '뇌우',
  'snow':                    '눈',
  'light snow':              '약한 눈',
  'heavy snow':              '강한 눈',
  'sleet':                   '진눈깨비',
  'mist':                    '안개',
  'smoke':                   '연기',
  'haze':                    '실안개',
  'fog':                     '짙은 안개',
  'sand':                    '모래',
  'dust':                    '먼지',
  'volcanic ash':            '화산재',
  'squalls':                 '돌풍',
  'tornado':                 '토네이도',
};

export default function MyMap() {
  const navigate                   = useNavigate();
  const [points, setPoints]       = useState([]);
  const [filteredPoints, setFilteredPoints] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected]     = useState(null);
  const [weatherInfo, setWeather]   = useState(null);

  // 1) 엑셀 데이터 로딩
  useEffect(() => {
    (async () => {
      try {
        const buffers = await Promise.all(
          XLSX_FILES.map(async url => {
            const res = await fetch(url);
            const buf = await res.arrayBuffer();
            const header = new TextDecoder().decode(buf.slice(0, 20));
            return /^<!doctype html>/i.test(header) ? null : buf;
          })
        );
        const valid = buffers.filter(Boolean);
        const rows = valid.flatMap(buf => {
          const wb = XLSX.read(new Uint8Array(buf), { type: 'array' });
          return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        });
        const mapped = rows
          .map((r, i) => ({
            id:      i,
            name:    r['낚시터명']  || `포인트${i + 1}`,
            lat:     parseFloat(r['WGS84위도']  ?? r['위도']),
            lng:     parseFloat(r['WGS84경도'] ?? r['경도']),
            species: r['주요어종']  || r['주요 어종'] || ''
          }))
          .filter(p => !isNaN(p.lat) && !isNaN(p.lng));
        setPoints(mapped);
        setFilteredPoints(mapped);
      } catch (e) {
        console.error('XLSX 파싱 오류:', e);
      }
    })();
  }, []);

  // 2) 검색어 필터링
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
        `https://api.openweathermap.org/data/2.5/weather` +
        `?lat=${pt.lat}&lon=${pt.lng}` +
        `&appid=${OWM_KEY}&units=metric`
      );
      if (!resp.ok) throw new Error(resp.statusText);
      const data = await resp.json();
      const rawDesc = data.weather[0].description.toLowerCase();
      const desc = descriptionMap[rawDesc] ||
                   rawDesc.charAt(0).toUpperCase() + rawDesc.slice(1);
      setWeather({
        temp: Number(data.main.temp),
        wind: Number(data.wind.speed),
        desc,
        icon: data.weather[0].icon
      });
    } catch (e) {
      console.error('Weather API error:', e);
      setWeather({ error: '날씨 정보를 불러올 수 없습니다.' });
    }
  };

  if (!points.length) {
    return <div className="loading-overlay">로딩 중…</div>;
  }

  return (
    <div className="map-screen-container">
      {/* Header */}
      <header className="map-header">
        <button className="back-icon" onClick={() => navigate(-1)}>
          <IoArrowBack />
        </button>
        <h2 className="map-title">지도</h2>
      </header>

      {/* 지도 + 검색 오버레이 래퍼 */}
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

      {/* Info Panel */}
      {selected && (
        <div className="info-panel">
          <br></br>
          <br></br>
          <br></br>
          <br></br>
          <br></br>
          <h3 className="location-name">{selected.name}</h3>
          {selected.species && (
            <p className="species-list">주요 어종: {selected.species}</p>
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

      {/* Bottom Navigation */}
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
