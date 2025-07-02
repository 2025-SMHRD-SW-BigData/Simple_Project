import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { BsPlusLg } from 'react-icons/bs';
import { FaStar }   from 'react-icons/fa';
import { useOutletContext } from 'react-router-dom';
import '../style/Pokedex.css';

export default function Pokedex() {
  // Outlet에서 userId와 refreshProfile 받기
  const { userId, refreshProfile } = useOutletContext();

  const [cards, setCards]         = useState([]);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg]   = useState('');
  const [modalImage, setModalImage] = useState(null);  // ← 추가
  const fileInputRef              = useRef(null);

  // 1) 마운트 시 기존 카드 로드
  useEffect(() => {
    if (!userId) {
      setErrorMsg('⚠️ 로그인 후 이용해 주세요.');
      return;
    }
    axios.get('http://localhost:3001/pokedex/cards', {
      params: { user_id: userId },
      withCredentials: true
    })
    .then(res => {
      setCards(res.data);
      setErrorMsg('');
    })
    .catch(() => {
      setErrorMsg('기존 카드를 불러오지 못했습니다.');
    });
  }, [userId]);

  // + 버튼 클릭
  const handleAddClick = () => {
    if (!userId) {
      setErrorMsg('⚠️ 로그인 후 이용해 주세요.');
      return;
    }
    if (uploading) return;
    setErrorMsg('');
    fileInputRef.current.click();
  };

  // 파일 선택 → 업로드 → 즉시 갱신
  const handleFileChange = async e => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg('');

    const formData = new FormData();
    formData.append('image', file);
    formData.append('user_id', userId);

    try {
      const res = await axios.post(
        'http://localhost:3001/pokedex/predict',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        }
      );
      const { card_id, imageUrl, name, rarity } = res.data;

      // 새 카드 바로 앞에 추가
      setCards(prev => [
        { card_id, imageUrl, name, rarity },
        ...prev
      ]);

      // 헤더 프로필(레벨/경험치) 즉시 갱신
      refreshProfile();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || '카드 생성 중 오류');
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  return (
    <div className="pokedex-container">
      {errorMsg && <div className="error-msg">{errorMsg}</div>}

      <div className="fish-grid">
        {/* + 카드 */}
        <div className="add-card-container" onClick={handleAddClick}>
          <button
            className="add-image-card"
            disabled={uploading}
            style={uploading ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          >
            <BsPlusLg size={24} />
          </button>
        </div>

        {/* 숨겨진 파일 input */}
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleFileChange}
        />

        {/* 물고기 카드들 */}
        {cards.map(fish => (
          <div
            key={fish.card_id}
            className="fish-card"
            onClick={() => setModalImage(fish.imageUrl)}  // ← 클릭 시 모달 열기
          >
            <img src={fish.imageUrl} alt={fish.name} className="fish-image" />
            <div className="fish-info">
              <h3 className="fish-name">{fish.name}</h3>
              <div className="fish-rarity">
                {Array.from({ length: fish.rarity }, (_, i) => (
                  <FaStar key={i} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 이미지 모달 */}
      {modalImage && (
        <div
          className="image-modal-overlay"
          onClick={() => setModalImage(null)}
        >
          <img
            src={modalImage}
            alt="Enlarged"
            className="enlarged-image"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
