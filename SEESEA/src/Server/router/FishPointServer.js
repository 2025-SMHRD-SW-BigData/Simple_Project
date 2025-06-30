// routes/FishPointServer.js
const express = require('express');
const mysql   = require('mysql2');
const router  = express.Router();

// MySQL 연결
const db = mysql.createConnection({
  host     : 'project-db-campus.smhrd.com',
  port     : 3307,
  user     : 'campus_25SW_BigData_p2_4',
  password : 'smhrd4',
  database : 'campus_25SW_BigData_p2_4'
});
db.connect(err => {
  if (err) console.error('❌ MySQL 연결 실패:', err);
  else       console.log('✅ MySQL 연결 성공 (FishPointServer)');
});

// GET /fishPoint/fishPoints
router.get('/fishPoints', (req, res) => {
  const sql = `
  SELECT
    F.FISHPOINT_ID   AS id,
    F.LOCATION_NAME  AS name,
    F.위도            AS lat,
    F.경도            AS lng,
    COALESCE(
      NULLIF(F.FISH_NAME, ''),
      GROUP_CONCAT(DISTINCT C.FISH_NAME SEPARATOR ', ')
    ) AS species
    FROM FISHPOINT F
    LEFT JOIN CARD C
      ON C.FISH_NAME = F.FISH_NAME   -- ← 여기를 바꿨어요
    GROUP BY F.FISHPOINT_ID
    ORDER BY F.FISHPOINT_ID;
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error('쿼리 오류:', err);
      return res.status(500).json({ error: 'DB 오류' });
    }
    console.log('▶▶ fishPoints 결과:', results);
    res.json(results);
  });
});

module.exports = router;
