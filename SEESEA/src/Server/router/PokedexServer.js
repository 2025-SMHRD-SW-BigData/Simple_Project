// File: src/Server/router/PokedexServer.js

const express   = require('express');
const multer    = require('multer');
const mysql     = require('mysql2/promise');
const axios     = require('axios');
const FormData  = require('form-data');
const path      = require('path');
const fs        = require('fs');

const router = express.Router();

// ─── 업로드 디렉터리 준비 ─────────────────────────────────────────────────────
const PUBLIC_DIR = path.resolve(__dirname, '../../public');
const CARDS_DIR  = path.join(PUBLIC_DIR, 'cards');
fs.mkdirSync(CARDS_DIR, { recursive: true });

// ─── Multer 설정 ───────────────────────────────────────────────────────────────
const storage = multer.memoryStorage();
const upload  = multer({ storage });

// ─── MySQL 풀 생성 ────────────────────────────────────────────────────────────
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

// ─── 카드 목록 조회 ────────────────────────────────────────────────────────────
router.get('/cards', async (req, res) => {
  const userId = req.query.user_id;
  if (!userId) return res.status(400).json({ error: 'user_id required' });
  try {
    const [rows] = await pool.execute(
      `SELECT CARD_ID AS card_id, IMAGE_URL AS imageUrl, FISH_NAME AS name, RAREITY AS rarity
       FROM CARD
       WHERE USER_ID = ?
       ORDER BY CAPTURE_DATE DESC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error('카드 목록 조회 실패:', err);
    res.status(500).json({ error: 'Failed to load cards.' });
  }
});

// ─── 카드 생성 & 레벨·EXP 갱신 ─────────────────────────────────────────────────
router.post('/predict', upload.single('image'), async (req, res) => {
  const { user_id } = req.body;
  const file        = req.file;
  if (!user_id || !file) {
    return res.status(400).json({ error: 'user_id and image are required' });
  }

  let conn;
  try {
    // 1) Flask에 이미지 전송
    const form = new FormData();
    form.append('image', file.buffer, { filename: file.originalname, contentType: file.mimetype });
    const flaskRes = await axios.post('http://localhost:5000/predict', form, {
      headers: form.getHeaders(),
      timeout: 300000
    });

    const { imageUrl, name, rarity, hashtags, description } = flaskRes.data;

    // 2) DB에 카드 저장
    conn = await pool.getConnection();
    await conn.beginTransaction();

    const [r] = await conn.execute(
      `INSERT INTO CARD (USER_ID, RAREITY, IMAGE_URL, FISH_NAME)
       VALUES (?, ?, ?, ?)`,
      [user_id, rarity, imageUrl, name]
    );
    const card_id = r.insertId;

    // 3) 해시태그 저장
    for (const tag of (hashtags || [])) {
      await conn.execute(
        'INSERT INTO HASHTAG (CARD_ID, HASHTAG_CONTENTS) VALUES (?, ?)',
        [card_id, tag]
      );
    }

    // 4) MEMBER 테이블 레벨·EXP 계산 & 업데이트
    const [[{ cnt }]] = await conn.execute(
      'SELECT COUNT(*) AS cnt FROM CARD WHERE USER_ID = ?',
      [user_id]
    );
    const newLevel = Math.floor(cnt / 2) + 1;           // 카드 2장마다 레벨 +1
    const newExp   = (cnt % 2) * 50;                    // 남은 카드 1장당 EXP 50%
    await conn.execute(
      'UPDATE Member SET `LEVEL` = ?, EXP = ? WHERE USER_ID = ?',
      [newLevel, newExp, user_id]
    );

    await conn.commit();
    conn.release();

    // 5) 응답
    res.status(201).json({ card_id, imageUrl, name, rarity, hashtags, description });
  } catch (err) {
    if (conn) {
      await conn.rollback();
      conn.release();
    }
    console.error('카드 생성 실패:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

module.exports = router;
