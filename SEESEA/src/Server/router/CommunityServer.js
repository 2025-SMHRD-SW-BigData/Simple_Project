// File: src/Server/router/CommunityServer.js

const express = require('express');
const multer  = require('multer');
const mysql   = require('mysql2/promise');
const path    = require('path');

const router = express.Router();

// ↓ 절대경로로 src/public/uploads 폴더를 가리키도록 수정합니다.
const UPLOAD_DIR = path.resolve(__dirname, '../public/uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
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
 */
router.get('/posts', async (req, res) => {
  const userId = req.query.user_id;
  if (!userId) return res.status(400).json({ error: 'user_id required' });

  try {
    const [rows] = await pool.execute(
      `SELECT
         C.FEED_ID AS feed_id,
         C.USER_ID AS author,
         C.CONTENTS AS caption,
         COALESCE(I.IMAGE_URL,'') AS imageUrl,
         C.LIKE_POINT AS likeCount,
         (SELECT COUNT(*) FROM \`COMMENT\` WHERE FEED_ID=C.FEED_ID) AS commentCount
       FROM COMMUNITY C
       LEFT JOIN COMMUNITY_IMG I ON C.FEED_ID = I.FEED_ID
       ORDER BY C.UPDATE_DAY DESC`
    );
    const result = rows.map(r => ({
      feed_id:      r.feed_id,
      author:       r.author,
      caption:      r.caption,
      imageUrl:     r.imageUrl,
      likeCount:    r.likeCount,
      commentCount: r.commentCount,
      isMine:       r.author === userId,
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
 */
router.post('/upload', upload.single('image'), async (req, res) => {
  console.log('▶▶▶ POST /community/upload');
  const { user_id, contents } = req.body;
  const file = req.file;
  if (!user_id || !contents || !file) {
    return res.status(400).json({ error: 'user_id, contents, image are all required' });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    const [r] = await conn.execute(
      `INSERT INTO COMMUNITY (USER_ID, CONTENTS) VALUES (?, ?)`,
      [user_id, contents]
    );
    const feedId = r.insertId;

    const imageUrl = `/uploads/${file.filename}`;
    await conn.execute(
      `INSERT INTO COMMUNITY_IMG (FEED_ID, IMAGE_URL) VALUES (?, ?)`,
      [feedId, imageUrl]
    );

    await conn.commit();
    res.status(201).json({
      feed_id:      feedId,
      author:       user_id,
      caption:      contents,
      imageUrl:     imageUrl,
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
