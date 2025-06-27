import React, { useState, useRef } from 'react';
import '../style/Pokedex.css';
import { BsPlusLg } from 'react-icons/bs';

const FishCard = ({ fish }) => (
  <div className="fish-card">
    {fish.imageUrl ? (
      <img src={fish.imageUrl} alt="물고기" className="fish-image" />
    ) : (
      <div className="fish-image-placeholder"></div>
    )}
  </div>
);

const AddImageCard = () => (
    <button className="add-image-card">
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
    // ✨ 3. 숨겨진 input 요소에 접근하기 위한 ref를 생성합니다.
    const fileInputRef = useRef(null);

    // ✨ 4. + 버튼을 클릭했을 때 실행될 함수입니다.
    const handleAddClick = () => {
        // ref를 통해 숨겨진 input 요소를 강제로 클릭합니다.
        fileInputRef.current.click();
    };

    // ✨ 5. 파일이 선택되었을 때 실행될 함수입니다.
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) {
            return; // 사용자가 파일 선택을 취소한 경우
        }

        // FileReader를 사용해 선택한 이미지를 미리보기로 만듭니다.
        const reader = new FileReader();
        reader.readAsDataURL(file); // 파일을 Base64 데이터 URL로 변환
        reader.onloadend = () => {
            // 파일 읽기가 완료되면, 새 이미지 객체를 만들어 상태에 추가합니다.
            const newImage = {
                id: Date.now(),
                imageUrl: reader.result // 여기에 Base64 데이터 URL이 들어갑니다.
            };
            setImages([newImage, ...images]);
        };
        
        alert(`'${file.name}' 파일이 선택되었습니다.`);
    };

    return (
        <div className="fish-grid">
            {/* 
              ✨ 6. AddImageCard를 div로 감싸고, 클릭 이벤트를 연결합니다.
            */}
            <div className="add-card-container" onClick={handleAddClick}>
                <AddImageCard />
            </div>
            
            {/* ✨ 7. 눈에 보이지 않는 파일 input을 추가합니다. */}
            <input
                type="file"
                accept="image/*" // 이미지 파일만 선택 가능하도록 필터링
                style={{ display: 'none' }} // 화면에 보이지 않게 숨김
                ref={fileInputRef} // 위에서 만든 ref와 연결
                onChange={handleFileChange} // 파일이 선택되면 handleFileChange 함수 실행
            />

            {images.map(image => (
                <FishCard key={image.id} fish={image} />
            ))}
        </div>
    );
};

export default Pokedex;