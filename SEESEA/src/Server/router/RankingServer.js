// File: src/Server/router/RankingServer.js

const express = require('express');
const mysql   = require('mysql2/promise');
const router  = express.Router();

// MySQL 풀 설정 (다른 서버 라우터와 동일)
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
 * GET /ranking/users
 * - Member 테이블의 LEVEL만 내려줍니다.
 */
router.get('/users', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT 
         USER_ID   AS id,
         NAME      AS nickname,
         \`LEVEL\` AS level
       FROM Member
       ORDER BY \`LEVEL\` DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('랭킹 조회 실패:', err);
    res.status(500).json({ error: 'Failed to load ranking.' });
  }
});

module.exports = router;
