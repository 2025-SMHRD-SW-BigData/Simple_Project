// File: src/Server/router/LoginServer.js

const express = require('express');
const router  = express.Router();
const mysql   = require('mysql2');

// MySQL 커넥션
const conn = mysql.createConnection({
  host     : 'project-db-campus.smhrd.com',
  port     : 3307,
  user     : 'campus_25SW_BigData_p2_4',
  password : 'smhrd4',
  database : 'campus_25SW_BigData_p2_4'
});
conn.connect();

// POST /userLogin/login
router.post('/login', (req, res) => {
  const { USER_ID, PW } = req.body;
  const sql = 'SELECT * FROM Member WHERE USER_ID = ? AND PW = ?';
  conn.query(sql, [USER_ID, PW], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: '서버 오류' });
    if (results.length > 0) {
      req.session.userId = USER_ID;
      return res.json({ success: true, message: '로그인 성공' });
    }
    return res.status(401).json({ success: false, message: '아이디 또는 비밀번호가 일치하지 않습니다.' });
  });
});

// POST /userLogin/find-password
router.post('/find-password', (req, res) => {
  const { USER_ID } = req.body;
  if (!USER_ID) return res.status(400).json({ error: 'USER_ID를 입력해주세요.' });
  const sql = 'SELECT PW FROM Member WHERE USER_ID = ?';
  conn.query(sql, [USER_ID], (err, results) => {
    if (err) return res.status(500).json({ error: '서버 오류' });
    if (results.length === 0) return res.status(404).json({ error: '등록된 아이디가 아닙니다.' });
    return res.json({ password: results[0].PW });
  });
});

// GET /userLogin/session
// → 항상 200 리턴, 세션 없으면 userId: null
router.get('/session', (req, res) => {
  const id = req.session?.userId || null;
  res.json({ userId: id });
});

// GET /userLogin/logout
router.get('/logout', (req, res) => {
  // 세션 파기
  req.session.destroy(err => {
    if (err) {
      console.error('세션 파기 오류:', err);
      return res.status(500).json({ success: false, message: '로그아웃 실패' });
    }
    // 클라이언트 쿠키에서 세션 쿠키도 삭제
    res.clearCookie('seeSeaSession');
    res.json({ success: true, message: '로그아웃 성공' });
  });
});

module.exports = router;
