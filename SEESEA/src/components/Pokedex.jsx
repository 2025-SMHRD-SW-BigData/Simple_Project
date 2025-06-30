// src/components/Pokedex.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios                               from 'axios';
import '../style/Pokedex.css';
import { BsPlusLg }                        from 'react-icons/bs';

const FishCard = ({ fish }) => (
  <div className="fish-card">
    <img src={fish.imageUrl} alt={fish.name} className="fish-image" />
    <div className="fish-info">
      <h3 className="fish-name">{fish.name}</h3>
      <p className="fish-rarity">희귀도: {fish.rarity} ★</p>
    </div>
  </div>
);

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
  const fileInputRef              = useRef(null);

  // 카드 목록 로드
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

  const handleAddClick = () => {
    if (uploading) return;
    if (!userId) {
      setErrorMsg('⚠️ 로그인 후 이용해 주세요.');
      return;
    }
    setErrorMsg('');
    fileInputRef.current.click();
  };

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
      const { card_id, imageUrl, name, rarity } = res.data;
      setCards(prev => [{ card_id, imageUrl, name, rarity }, ...prev]);
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
        <div className="add-card-container" onClick={handleAddClick}>
          <AddImageCard disabled={!userId || uploading} />
        </div>

        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleFileChange}
        />

        {cards.map(fish => (
          <FishCard key={fish.card_id} fish={fish} />
        ))}
      </div>
    </div>
  );
}
