// File: src/Server/router/CommunityServer.js

const express = require('express');
const multer  = require('multer');
const mysql   = require('mysql2/promise');
const path    = require('path');

const router = express.Router();

// 업로드 폴더 설정
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
 * GET /community/member/:id
 * → user_id로 조회해 { name } 반환
 */
router.get('/member/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT NAME FROM Member WHERE USER_ID = ?',
      [req.params.id]
    );
    if (!rows.length) {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.json({ name: rows[0].NAME });
  } catch (err) {
    console.error('Error fetching member name:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /community/posts?user_id=…
 * → 게시물 목록, author에 NAME 담아 반환
 */
router.get('/posts', async (req, res) => {
  const userId = req.query.user_id;
  if (!userId) return res.status(400).json({ error: 'user_id required' });

  try {
    const [rows] = await pool.execute(
      `SELECT
         C.FEED_ID           AS feed_id,
         C.USER_ID           AS author_id,
         M.NAME              AS author,
         C.CONTENTS          AS caption,
         COALESCE(I.IMAGE_URL, '') AS imageUrl,
         C.LIKE_POINT        AS likeCount,
         (SELECT COUNT(*) FROM \`COMMENT\` WHERE FEED_ID=C.FEED_ID) AS commentCount
       FROM COMMUNITY C
       JOIN Member M ON C.USER_ID = M.USER_ID
       LEFT JOIN COMMUNITY_IMG I ON C.FEED_ID = I.FEED_ID
       ORDER BY C.UPDATE_DAY DESC`
    );

    const result = rows.map(r => ({
      feed_id:      r.feed_id,
      author:       r.author,
      imageUrl:     r.imageUrl,
      caption:      r.caption,
      likeCount:    r.likeCount,
      commentCount: r.commentCount,
      isMine:       r.author_id === userId,
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
 * → 새 피드 등록, author에 NAME 담아 반환
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

    const [r] = await conn.execute(
      'INSERT INTO COMMUNITY (USER_ID, CONTENTS) VALUES (?, ?)',
      [user_id, contents]
    );
    const feedId = r.insertId;

    const imageUrl = `/uploads/${file.filename}`;
    await conn.execute(
      'INSERT INTO COMMUNITY_IMG (FEED_ID, IMAGE_URL) VALUES (?, ?)',
      [feedId, imageUrl]
    );

    const [[userRow]] = await conn.execute(
      'SELECT NAME FROM Member WHERE USER_ID = ?',
      [user_id]
    );
    const authorName = userRow ? userRow.NAME : '';

    await conn.commit();

    res.status(201).json({
      feed_id:      feedId,
      author:       authorName,
      imageUrl,
      caption:      contents,
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

/**
 * GET /community/follow/count?user_id=…
 * → 팔로워·팔로잉 수 반환
 */
router.get('/follow/count', async (req, res) => {
  const userId = req.query.user_id;
  if (!userId) return res.status(400).json({ error: 'user_id required' });
  try {
    const [[{ cnt: followers }]] = await pool.execute(
      `SELECT COUNT(*) AS cnt FROM \`FOLLOW\` WHERE FOLLOWING_ID = ?`,
      [userId]
    );
    const [[{ cnt: following }]] = await pool.execute(
      `SELECT COUNT(*) AS cnt FROM \`FOLLOW\` WHERE FOLLOWER_ID = ?`,
      [userId]
    );
    res.json({ followers, following });
  } catch (err) {
    console.error('Error fetching follow counts:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /community/profile/level?user_id=…
 * → Member.LEVEL 반환
 */
router.get('/profile/level', async (req, res) => {
  const userId = req.query.user_id;
  if (!userId) return res.status(400).json({ error: 'user_id required' });
  try {
    const [rows] = await pool.execute(
      'SELECT LEVEL FROM Member WHERE USER_ID = ?',
      [userId]
    );
    if (!rows.length) {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.json({ level: rows[0].LEVEL });
  } catch (err) {
    console.error('Error fetching profile level:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
