// src/components/Pokedex.jsx

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../style/Pokedex.css';
import { BsPlusLg } from 'react-icons/bs';
import { FaStar } from 'react-icons/fa';

// 클릭한 이미지를 크게 보여주는 모달
const ImageModal = ({ imageUrl, onClose }) => (
  <div className="image-modal-overlay" onClick={onClose}>
    <img
      src={imageUrl}
      alt="Enlarged view"
      className="enlarged-image"
      onClick={e => e.stopPropagation()}
    />
  </div>
);

// 물고기 카드
const FishCard = ({ fish, onClick }) => (
  <div className="fish-card" onClick={onClick}>
    {fish.imageUrl ? (
      <img src={fish.imageUrl} alt={fish.name} className="fish-image" />
    ) : (
      <div className="fish-image-placeholder"></div>
    )}
    <div className="fish-info">
      <h3 className="fish-name">{fish.name}</h3>
      <div className="fish-rarity">
        {/* 희귀도 숫자 대신 별 아이콘을 rarity 만큼 렌더링 */}
        {Array.from({ length: fish.rarity }, (_, i) => (
          <FaStar key={i} />
        ))}
      </div>
    </div>
  </div>
);

// + 버튼 카드
const AddImageCard = ({ disabled }) => (
  <button
    className="add-image-card"
    disabled={disabled}
    style={disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
  >
    <BsPlusLg size={24} />
  </button>
);

export default function Pokedex({ userId }) {
  const [cards, setCards]         = useState([]);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg]   = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef              = useRef(null);

  // 1) 로그인 여부 확인 후 카드 목록 로드
  useEffect(() => {
    if (!userId) {
      setErrorMsg('⚠️ 로그인 후 이용해 주세요.');
      return;
    }
    axios.get('http://localhost:3001/pokedex/cards', {
      params: { user_id: userId }
    })
    .then(res => {
      setCards(res.data);
      setErrorMsg('');
    })
    .catch(() => {
      setErrorMsg('기존 카드를 불러오지 못했습니다.');
    });
  }, [userId]);

  // 2) + 버튼 클릭 → 파일 선택 다이얼로그
  const handleAddClick = () => {
    if (uploading) return;
    if (!userId) {
      setErrorMsg('⚠️ 로그인 후 이용해 주세요.');
      return;
    }
    setErrorMsg('');
    fileInputRef.current.click();
  };

  // 3) 파일이 선택되면 업로드 & 카드 추가
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
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      const { card_id, imageUrl, name, rarity, hashtags } = res.data;
      setCards(prev => [{ card_id, imageUrl, name, rarity, hashtags }, ...prev]);
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
          <AddImageCard disabled={!userId || uploading} />
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
          <FishCard
            key={fish.card_id}
            fish={fish}
            onClick={() => setSelectedImage(fish.imageUrl)}
          />
        ))}
      </div>

      {/* 모달 */}
      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}
