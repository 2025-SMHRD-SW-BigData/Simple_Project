// routes/PokedexServer.js
const express  = require('express');
const multer   = require('multer');
const axios    = require('axios');
const FormData = require('form-data');
const mysql    = require('mysql2/promise');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// MySQL 풀 설정
const pool = mysql.createPool({
  host               : 'project-db-campus.smhrd.com',
  port               : 3307,
  user               : 'campus_25SW_BigData_p2_4',
  password           : 'smhrd4',
  database           : 'campus_25SW_BigData_p2_4',
  waitForConnections : true,
  connectionLimit    : 10,
  queueLimit         : 0,
  charset            : 'utf8mb4'
});

// Flask AI 서버 URL
const FLASK_URL = 'http://localhost:5000/predict';

// POST /pokedex/predict — 이미지 업로드 → 카드 생성
router.post('/predict', upload.single('image'), async (req, res) => {
  console.log('▶▶▶ /pokedex/predict 진입');
  const { user_id: userId } = req.body;
  const file = req.file;

  // 필수 파라미터 검사
  if (!userId) {
    return res.status(400).json({ error: 'user_id를 보내주세요.' });
  }
  if (!file) {
    return res.status(400).json({ error: 'image 파일이 필요합니다.' });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // Member 확인
    const [mrows] = await conn.execute(
      'SELECT 1 FROM Member WHERE USER_ID = ?', [userId]
    );
    if (mrows.length === 0) {
      return res.status(404).json({ error: '등록되지 않은 사용자입니다.' });
    }

    // AI 서버 호출 → { name, rarity, hashtags, description, imageUrl }
    const form = new FormData();
    form.append('image', file.buffer, file.originalname);
    const flaskRes = await axios.post(FLASK_URL, form, {
      headers: form.getHeaders(),
      timeout: 120000
    });
    if (flaskRes.status !== 200) {
      throw new Error(`AI 서버 오류: ${flaskRes.status}`);
    }
    const card = flaskRes.data;
    console.log('← AI가 만든 카드:', card);

    // CARD 저장 (FISHPOINT_ID 컬럼 없이)
    const [insertCard] = await conn.execute(
      `INSERT INTO CARD
         (USER_ID, RAREITY, IMAGE_URL, FISH_NAME)
       VALUES (?, ?, ?, ?)`,
      [userId, parseInt(card.rarity,10), card.imageUrl, card.name]
    );
    const newCardId = insertCard.insertId;

    // HASHTAG 저장
    if (Array.isArray(card.hashtags) && card.hashtags.length) {
      for (const tag of card.hashtags) {
        await conn.execute(
          'INSERT INTO HASHTAG (CARD_ID, HASHTAG_CONTENTS) VALUES (?,?)',
          [newCardId, tag]
        );
      }
    }

    await conn.commit();
    return res.status(201).json({ card_id: newCardId, ...card });

  } catch (err) {
    if (conn) {
      await conn.rollback();
      conn.release();
    }
    console.error('카드 생성 중 오류:', err);
    return res.status(500).json({ error: '카드 생성 중 오류가 발생했습니다.' });
  } finally {
    if (conn && conn.release) conn.release();
  }
});

// GET /pokedex/cards — 로그인한 유저의 저장된 카드 모두 조회
router.get('/cards', async (req, res) => {
  const userId = req.query.user_id;  // 예: ?user_id=USER001
  if (!userId) {
    return res.status(400).json({ error: 'user_id 쿼리 파라미터가 필요합니다.' });
  }

  try {
    const [rows] = await pool.execute(
      `SELECT CARD_ID   AS card_id,
              IMAGE_URL  AS imageUrl,
              FISH_NAME  AS name,
              RAREITY    AS rarity
       FROM CARD
       WHERE USER_ID = ?
       ORDER BY CARD_ID DESC`,
      [userId]
    );
    return res.json(rows);
  } catch (err) {
    console.error('카드 조회 중 오류:', err);
    return res.status(500).json({ error: '카드 조회 중 오류가 발생했습니다.' });
  }
});

module.exports = router;
