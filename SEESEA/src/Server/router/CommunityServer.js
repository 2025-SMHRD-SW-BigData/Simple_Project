// File: src/Server/router/CommunityServer.js

const express = require('express');
const multer  = require('multer');
const mysql   = require('mysql2/promise');
const path    = require('path');

const router = express.Router();

// 절대경로로 src/public/uploads 폴더
const UPLOAD_DIR = path.resolve(__dirname, '../public/uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename:    (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

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

/**
 * GET /community/posts
 *  - JOIN으로 Member.NAME을 가져와 author에 담아 반환
 */
router.get('/posts', async (req, res) => {
  const userId = req.query.user_id;
  if (!userId) return res.status(400).json({ error: 'user_id required' });

  try {
    const [rows] = await pool.execute(
      `SELECT
         C.FEED_ID           AS feed_id,
         C.USER_ID           AS author_id,
         M.NAME              AS author,         -- 회원 이름을 author로
         C.CONTENTS          AS caption,
         COALESCE(I.IMAGE_URL, '') AS imageUrl,
         C.LIKE_POINT        AS likeCount,
         (SELECT COUNT(*) FROM \`COMMENT\` WHERE FEED_ID=C.FEED_ID) AS commentCount
       FROM COMMUNITY C
       JOIN Member M
         ON C.USER_ID = M.USER_ID
       LEFT JOIN COMMUNITY_IMG I
         ON C.FEED_ID = I.FEED_ID
       ORDER BY C.UPDATE_DAY DESC`
    );

    const result = rows.map(r => ({
      feed_id:      r.feed_id,
      author:       r.author,                // 이제 NAME(이름)이 들어갑니다
      caption:      r.caption,
      imageUrl:     r.imageUrl,
      likeCount:    r.likeCount,
      commentCount: r.commentCount,
      isMine:       r.author_id === userId,  // 유저 판단은 author_id로
      liked:        false
    }));

    res.json(result);
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ error: 'Failed to load posts.' });
  }
});

/**
 * POST /community/upload
 *  - 삽입 후 Member.NAME 조회해서 author에 담아 반환
 */
router.post('/upload', upload.single('image'), async (req, res) => {
  const { user_id, contents } = req.body;
  const file = req.file;
  if (!user_id || !contents || !file) {
    return res.status(400).json({ error: 'user_id, contents, image are all required' });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // 1) 피드 삽입
    const [r] = await conn.execute(
      `INSERT INTO COMMUNITY (USER_ID, CONTENTS) VALUES (?, ?)`,
      [user_id, contents]
    );
    const feedId = r.insertId;

    // 2) 이미지 저장
    const imageUrl = `/uploads/${file.filename}`;
    await conn.execute(
      `INSERT INTO COMMUNITY_IMG (FEED_ID, IMAGE_URL) VALUES (?, ?)`,
      [feedId, imageUrl]
    );

    // 3) 방금 생성된 피드의 author 이름 조회
    const [[userRow]] = await conn.execute(
      `SELECT NAME FROM Member WHERE USER_ID = ?`,
      [user_id]
    );
    const authorName = userRow ? userRow.NAME : '';

    await conn.commit();

    // 4) 응답: author에 이름을 담아 보냄
    res.status(201).json({
      feed_id:      feedId,
      author:       authorName,  // 이름
      caption:      contents,
      imageUrl,
      likeCount:    0,
      commentCount: 0,
      isMine:       true
    });
  } catch (err) {
    if (conn) { await conn.rollback(); conn.release(); }
    console.error('Error uploading post:', err);
    res.status(500).json({ error: 'Failed to upload post.' });
  } finally {
    if (conn && conn.release) conn.release();
  }
});

module.exports = router;
