// routes/LoginServer.js

const express = require('express');
const router  = express.Router();
const mysql   = require('mysql2');

// MySQL 연결 (간단 예시)
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
      // 세션에 로그인 정보 저장
      req.session.userId = USER_ID;
      console.log('로그인 성공, 세션에 userId 저장:', USER_ID);
      return res.json({ success: true, message: '로그인 성공' });
    } else {
      console.log('로그인 실패: 아이디/비번 불일치');
      return res.status(401).json({ success: false, message: '아이디 또는 비밀번호가 일치하지 않습니다.' });
    }
  });
});

module.exports = router;
