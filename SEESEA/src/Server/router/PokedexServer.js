// File: src/Server/router/PokedexServer.js

const express = require('express');
const multer  = require('multer');
const mysql   = require('mysql2/promise');
const path    = require('path');
const fs      = require('fs');
const axios   = require('axios');

const router = express.Router();

// ─── Multer 설정 (메모리 저장) ───────────────────────────────────────────────
const upload = multer({ storage: multer.memoryStorage() });

// ─── MySQL 풀 생성 ───────────────────────────────────────────────────────────
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

// ─── 1) 내 카드 목록 조회 ─────────────────────────────────────────────────────
// GET /pokedex/cards?user_id=…
router.get('/cards', async (req, res) => {
  const userId = req.query.user_id;
  if (!userId) {
    return res.status(400).json({ error: 'user_id required' });
  }
  try {
    const [rows] = await pool.execute(
      'SELECT CARD_ID AS card_id, IMAGE_URL AS imageUrl, FISH_NAME AS name, RAREITY AS rarity FROM CARD WHERE USER_ID = ? ORDER BY CAPTURE_DATE DESC',
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error('카드 목록 로드 실패:', err);
    res.status(500).json({ error: 'Failed to load cards.' });
  }
});

// ─── 2) 카드 생성 (이미지 → Python/Flask 서버 → DB 삽입 → EXP/LEVEL 갱신) ───────────────
// POST /pokedex/predict
router.post('/predict', upload.single('image'), async (req, res) => {
  const userId = req.body.user_id;
  const file   = req.file;
  if (!userId || !file) {
    return res.status(400).json({ error: 'user_id and image are required' });
  }

  let conn;
  try {
    // 1) Python/Flask 서버에 이미지 전송 → 카드 메타데이터 수신
    const form = new FormData();
    form.append('image', file.buffer, { filename: file.originalname });
    const pyRes = await axios.post(
      'http://localhost:5000/predict',
      form,
      {
        headers: form.getHeaders(),
        timeout: 120_000
      }
    );
    const { imageUrl, name, rarity, hashtags, description } = pyRes.data;

    // 2) DB 트랜잭션 시작
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // 3) CARD 테이블에 삽입
    const [insertResult] = await conn.execute(
      `INSERT INTO CARD (USER_ID, RAREITY, IMAGE_URL, FISH_NAME)
       VALUES (?, ?, ?, ?)`,
      [userId, rarity, imageUrl, name]
    );
    const cardId = insertResult.insertId;

    // 4) MEMBER EXP/LEVEL 갱신
    //    카드 1장당 EXP 50%, EXP >= 100 이면 LEVEL +1, EXP -= 100
    const expGain = 50;
    await conn.execute(
      `UPDATE Member
         SET EXP = EXP + ?
       WHERE USER_ID = ?`,
      [expGain, userId]
    );
    //    만약 EXP >= 100 이면 레벨업
    const [[member]] = await conn.execute(
      `SELECT EXP, \`LEVEL\` AS lvl
         FROM Member
        WHERE USER_ID = ?`,
      [userId]
    );
    if (member.EXP >= 100) {
      const newExp = member.EXP - 100;
      await conn.execute(
        `UPDATE Member
           SET \`LEVEL\` = lvl + 1,
               EXP      = ?
         WHERE USER_ID = ?`,
        [newExp, userId]
      );
    }

    // 5) 커밋
    await conn.commit();

    // 6) 응답 (DB 삽입된 카드 ID 포함)
    res.status(201).json({
      card_id : cardId,
      imageUrl,
      name,
      rarity,
      hashtags,
      description
    });
  } catch (err) {
    if (conn) {
      await conn.rollback();
      conn.release();
    }
    console.error('카드 생성 실패:', err);
    res.status(500).json({ error: 'Failed to create card.' });
  } finally {
    if (conn && conn.release) conn.release();
  }
});

module.exports = router;
