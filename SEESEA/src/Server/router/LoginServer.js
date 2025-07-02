// File: src/Server/router/LoginServer.js

const express    = require('express');
const router     = express.Router();
const mysql      = require('mysql2');             // 기존 로그인용 MySQL

// ─── MySQL 커넥션 ────────────────────────────────────────────────────────────
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
  console.log('▶▶▶ /userLogin/login 진입', req.body);

  const { USER_ID, PW } = req.body;
  const sql = 'SELECT * FROM Member WHERE USER_ID = ? AND PW = ?';
  conn.query(sql, [USER_ID, PW], (err, results) => {
    if (err) {
      console.error('로그인 DB 오류:', err);
      return res.status(500).json({ success: false, message: '서버 오류' });
    }
    if (results.length > 0) {
      req.session.userId = USER_ID;
      console.log('로그인 성공, 세션에 userId 저장:', USER_ID);
      return res.json({ success: true, message: '로그인 성공' });
    } else {
      console.log('로그인 실패: 아이디/비번 불일치');
      return res.status(401).json({ success: false, message: '아이디 또는 비밀번호가 일치하지 않습니다.' });
    }
  });
});

// POST /userLogin/find-password
// → USER_ID를 전달받아 DB에 저장된 PW를 그대로 반환합니다.
router.post('/find-password', (req, res) => {
  const { USER_ID } = req.body;
  if (!USER_ID) {
    return res.status(400).json({ error: 'USER_ID를 입력해주세요.' });
  }

  const sql = 'SELECT PW FROM Member WHERE USER_ID = ?';
  conn.query(sql, [USER_ID], (err, results) => {
    if (err) {
      console.error('비밀번호 조회 DB 오류:', err);
      return res.status(500).json({ error: '서버 오류' });
    }
    if (results.length === 0) {
      console.log('비밀번호 조회 실패: 존재하지 않는 USER_ID', USER_ID);
      return res.status(404).json({ error: '등록된 아이디가 아닙니다.' });
    }
    const pw = results[0].PW;
    console.log('비밀번호 조회 성공:', USER_ID, pw);
    return res.json({ password: pw });
  });
});

module.exports = router;
