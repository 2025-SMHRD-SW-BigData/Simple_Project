// File: src/Server/router/CommunityServer.js

const express   = require('express');
const multer    = require('multer');
const mysql     = require('mysql2/promise');
const path      = require('path');
const fs        = require('fs');

const router = express.Router();

// ─── 업로드 디렉터리 준비 ─────────────────────────────────────────────────────
const PUBLIC_DIR = path.resolve(__dirname, '../../public');
const UPLOAD_DIR = path.join(PUBLIC_DIR, 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ─── Multer 설정 (최대 10개 파일) ─────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename:    (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random()*1e6)}`;
    cb(null, `${unique}-${file.originalname}`);
  }
});
const upload = multer({ storage });

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

/**
 * 1) 회원 이름 조회
 * GET /community/member/:id
 */
router.get('/member/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT NAME FROM Member WHERE USER_ID = ?', [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Member not found' });
    res.json({ name: rows[0].NAME });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * 2) 프로필 레벨 조회
 * GET /community/profile/level?user_id=…
 */
router.get('/profile/level', async (req, res) => {
  try {
    // 세션 또는 쿼리 파라미터로 userId 결정
    const userId = req.session?.userId || req.query.user_id;
    console.log(userId);
    if (!userId) {
      return res.status(400).json({ error: 'user_id가 필요합니다.' });
    }

    // EXP 컬럼 없이 LEVEL만 조회
    const [rows] = await pool.execute(
      'SELECT `LEVEL` FROM Member WHERE USER_ID = ?',
      [userId]
    );
    if (!rows.length) {
      return res.status(404).json({ error: '회원 정보를 찾을 수 없습니다.' });
    }

    // exp 필드는 더 이상 없으므로 0으로 리턴
    res.json({ level: rows[0].LEVEL, exp: 0 });
  } catch (err) {
    console.error('프로필 조회 오류:', err);
    res.status(500).json({ error: '서버 오류' });
  }
});

/**
 * 3) 팔로우/팔로워 카운트 조회
 * GET /community/follow/count?user_id=…
 */
router.get('/follow/count', async (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.status(400).json({ error: 'user_id required' });
  try {
    const [[{ cnt: followers }]] = await pool.execute(
      'SELECT COUNT(*) AS cnt FROM FOLLOW WHERE FOLLOWING_ID = ?', [userId]
    );
    const [[{ cnt: following }]] = await pool.execute(
      'SELECT COUNT(*) AS cnt FROM FOLLOW WHERE FOLLOWER_ID = ?', [userId]
    );
    res.json({ followers, following });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * 4) 피드 목록 조회 (이미지·댓글·좋아요·팔로우 상태 포함)
 * GET /community/posts?user_id=…
 */
router.get('/posts', async (req, res) => {
  const userId = req.query.user_id;
  if (!userId) return res.status(400).json({ error: 'user_id required' });

  try {
    // UPDATE_DAY 컬럼을 updateDay로 내려줍니다.
    const [posts] = await pool.execute(`
      SELECT
        C.FEED_ID      AS feedId,
        C.USER_ID      AS authorId,
        M.NAME         AS author,
        C.CONTENTS     AS caption,
        C.LIKE_POINT   AS likeCount,
        C.UPDATE_DAY   AS updateDay
      FROM COMMUNITY C
      JOIN Member M ON C.USER_ID = M.USER_ID
      ORDER BY C.UPDATE_DAY DESC
    `);

    for (const post of posts) {
      // 다중 이미지
      const [imgs] = await pool.execute(
        'SELECT IMAGE_URL AS url FROM COMMUNITY_IMG WHERE FEED_ID = ?', [post.feedId]
      );
      post.images = imgs.map(i => i.url);

      // 댓글 목록
      const [cmtsRows] = await pool.execute(`
        SELECT
          C.COMMENT_ID        AS commentId,
          C.COMMENT_USER_ID   AS authorId,
          M.NAME              AS author,
          C.COMMENT_CONTENTS  AS text,
          C.COMMENT_UPDATE    AS updatedAt
        FROM COMMENT C
        JOIN Member M ON C.COMMENT_USER_ID = M.USER_ID
        WHERE C.FEED_ID = ?
        ORDER BY C.COMMENT_UPDATE ASC
      `, [post.feedId]);
      post.comments     = cmtsRows;
      post.commentCount = cmtsRows.length;

      // 내가 좋아요 눌렀는지
      const [[likeRow]] = await pool.execute(
        'SELECT 1 FROM POST_LIKE WHERE USER_ID = ? AND FEED_ID = ?', [userId, post.feedId]
      );
      post.liked = !!likeRow;

      // 내가 author를 팔로우 중인지
      const [[fwRow]] = await pool.execute(
        'SELECT 1 FROM FOLLOW WHERE FOLLOWER_ID = ? AND FOLLOWING_ID = ?', [userId, post.authorId]
      );
      post.following = !!fwRow;

      // 내 글 여부
      post.isMine = (post.authorId === userId);
    }

    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load posts.' });
  }
});

/**
 * 5) 피드 업로드 (다중 이미지)
 * POST /community/upload
 */
router.post('/upload', upload.array('images', 10), async (req, res) => {
  const { user_id, contents } = req.body;
  const files = req.files;
  if (!user_id || !contents || !files?.length) {
    return res.status(400).json({ error: 'user_id, contents, and images required' });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // COMMUNITY 삽입
    const [r] = await conn.execute(
      'INSERT INTO COMMUNITY (USER_ID, CONTENTS) VALUES (?, ?)',
      [user_id, contents]
    );
    const feedId = r.insertId;

    // COMMUNITY_IMG 삽입
    for (const file of files) {
      const imageUrl = `/uploads/${file.filename}`;
      await conn.execute(
        'INSERT INTO COMMUNITY_IMG (FEED_ID, IMAGE_URL) VALUES (?, ?)',
        [feedId, imageUrl]
      );
    }

    await conn.commit();
    res.status(201).json({ success: true, feedId });
  } catch (err) {
    if (conn) { await conn.rollback(); conn.release(); }
    console.error(err);
    res.status(500).json({ error: 'Failed to upload feed.' });
  } finally {
    if (conn && conn.release) conn.release();
  }
});

/**
 * 6) 댓글 작성
 * POST /community/:feedId/comment
 */
router.post('/:feedId/comment', async (req, res) => {
  const feedId = req.params.feedId;
  const { user_id, text } = req.body;
  if (!user_id || !text) return res.status(400).json({ error: 'user_id and text required' });

  let conn;
  try {
    conn = await pool.getConnection();
    const [r] = await conn.execute(
      'INSERT INTO COMMENT (FEED_ID, COMMENT_USER_ID, COMMENT_CONTENTS) VALUES (?,?,?)',
      [feedId, user_id, text]
    );
    const commentId = r.insertId;

    // 방금 삽입된 댓글 조회
    const [[row]] = await conn.execute(`
      SELECT
        C.COMMENT_ID        AS commentId,
        C.COMMENT_USER_ID   AS authorId,
        M.NAME              AS author,
        C.COMMENT_CONTENTS  AS text,
        C.COMMENT_UPDATE    AS updatedAt
      FROM COMMENT C
      JOIN Member M ON C.COMMENT_USER_ID = M.USER_ID
      WHERE C.COMMENT_ID = ?
    `, [commentId]);

    res.status(201).json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to post comment.' });
  } finally {
    if (conn && conn.release) conn.release();
  }
});

/**
 * 7) 댓글 수정
 * PUT /community/:feedId/comment/:commentId
 */
router.put('/:feedId/comment/:commentId', async (req, res) => {
  const { feedId, commentId } = req.params;
  const { user_id, text } = req.body;
  if (!user_id || !text) return res.status(400).json({ error: 'user_id and text required' });

  try {
    await pool.execute(
      'UPDATE COMMENT SET COMMENT_CONTENTS = ? WHERE COMMENT_ID = ? AND COMMENT_USER_ID = ?',
      [text, commentId, user_id]
    );
    const [[row]] = await pool.execute(`
      SELECT
        C.COMMENT_ID        AS commentId,
        C.COMMENT_USER_ID   AS authorId,
        M.NAME              AS author,
        C.COMMENT_CONTENTS  AS text,
        C.COMMENT_UPDATE    AS updatedAt
      FROM COMMENT C
      JOIN Member M ON C.COMMENT_USER_ID = M.USER_ID
      WHERE C.COMMENT_ID = ?
    `, [commentId]);

    res.json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update comment.' });
  }
});

/**
 * 8) 댓글 삭제
 * DELETE /community/:feedId/comment/:commentId
 */
router.delete('/:feedId/comment/:commentId', async (req, res) => {
  const { commentId } = req.params;
  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ error: 'user_id required' });

  try {
    await pool.execute(
      'DELETE FROM COMMENT WHERE COMMENT_ID = ? AND COMMENT_USER_ID = ?',
      [commentId, user_id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete comment.' });
  }
});

/**
 * 9) 좋아요 추가
 * POST /community/:feedId/like
 */
router.post('/:feedId/like', async (req, res) => {
  const { feedId } = req.params;
  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ error: 'user_id required' });
  try {
    await pool.execute(
      'INSERT INTO POST_LIKE (USER_ID,FEED_ID) VALUES (?,?)',
      [user_id, feedId]
    );
    await pool.execute(
      'UPDATE COMMUNITY SET LIKE_POINT = LIKE_POINT + 1 WHERE FEED_ID = ?',
      [feedId]
    );
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Already liked' });
    }
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * 10) 좋아요 취소
 * DELETE /community/:feedId/like
 */
router.delete('/:feedId/like', async (req, res) => {
  const { feedId } = req.params;
  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ error: 'user_id required' });
  try {
    await pool.execute(
      'DELETE FROM POST_LIKE WHERE USER_ID = ? AND FEED_ID = ?',
      [user_id, feedId]
    );
    await pool.execute(
      'UPDATE COMMUNITY SET LIKE_POINT = LIKE_POINT - 1 WHERE FEED_ID = ? AND LIKE_POINT > 0',
      [feedId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * 11) 팔로우
 * POST /community/:authorId/follow
 */
router.post('/:authorId/follow', async (req, res) => {
  const { authorId } = req.params;
  const { user_id }  = req.body;
  if (!user_id) return res.status(400).json({ error: 'user_id required' });
  try {
    await pool.execute(
      'INSERT INTO FOLLOW (FOLLOWER_ID,FOLLOWING_ID) VALUES (?,?)',
      [user_id, authorId]
    );
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Already following' });
    }
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * 12) 언팔로우
 * DELETE /community/:authorId/follow
 */
router.delete('/:authorId/follow', async (req, res) => {
  const { authorId } = req.params;
  const { user_id }  = req.body;
  if (!user_id) return res.status(400).json({ error: 'user_id required' });
  try {
    await pool.execute(
      'DELETE FROM FOLLOW WHERE FOLLOWER_ID = ? AND FOLLOWING_ID = ?',
      [user_id, authorId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;