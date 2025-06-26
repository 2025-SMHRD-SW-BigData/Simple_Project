import React, { useState } from 'react';
import '../style/Pokedex.css';
import { BsPlusLg } from 'react-icons/bs';

// --- ✨ 1. FishCard 컴포넌트 수정 ---
// imageUrl이 없을 경우를 대비한 로직을 추가합니다.
const FishCard = ({ fish }) => (
  <div className="fish-card">
    {/* imageUrl이 존재하면 이미지를 보여주고, 없으면 '빈 칸' 스타일을 적용합니다. */}
    {fish.imageUrl ? (
      <img src={fish.imageUrl} alt="물고기" className="fish-image" />
    ) : (
      <div className="fish-image-placeholder"></div>
    )}
  </div>
);

const AddImageCard = ({ onClick }) => (
    <button className="add-image-card" onClick={onClick}>
        <BsPlusLg />
    </button>
);

const initialImages = [
    { id: 1, imageUrl: '/src/assets/fishing-post-woman.jpg' },
    { id: 2, imageUrl: '/src/assets/fishing-post.jpg' },
    { id: 3, imageUrl: '/src/assets/fishing-post-esul.jpg' },
    { id: 4, imageUrl: '/src/assets/fishing-post-woman.jpg' },
    { id: 5, imageUrl: '/src/assets/fishing-post.jpg' },
];

const Pokedex = () => {
    const [images, setImages] = useState(initialImages);

    // --- ✨ 2. handleAddImage 함수 수정 ---
    const handleAddImage = () => {
        // imageUrl이 없는 '빈' 이미지 객체를 만듭니다.
        const newEmptyImage = {
            id: Date.now(),
            imageUrl: null // 또는 undefined
        };
        
        // '빈' 이미지 객체를 배열의 맨 앞에 추가합니다.
        setImages([newEmptyImage, ...images]);
        
        alert('새로운 이미지 칸이 추가되었습니다!');
    };

    return (
        <div className="fish-grid">
            <AddImageCard onClick={handleAddImage} />
            {images.map(image => (
                <FishCard key={image.id} fish={image} />
            ))}
        </div>
    );
};

export default Pokedex;