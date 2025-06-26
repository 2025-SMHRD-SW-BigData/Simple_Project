const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = mysql.createConnection({
    host : 'project-db-campus.smhrd.com', //='0.0.0.0'
    port : 3307,
    user : 'campus_25SW_BigData_p2_4',
    password : 'smhrd4',
    database : 'campus_25SW_BigData_p2_4'
});

db.connect(err => {
  if (err) console.error('❌ MySQL 연결 실패:', err);
  else console.log('✅ MySQL 연결 성공');
});

app.get('/api/fishpoints', (req, res) => {
  const sql = `
    SELECT 
      F.FISHPOINT_ID AS id,
      F.LOCATION_NAME AS name,
      F.위도 AS lat,
      F.경도 AS lng,
      GROUP_CONCAT(DISTINCT C.FISH_NAME SEPARATOR ', ') AS species
    FROM FISHPOINT F
    LEFT JOIN CARD C ON F.FISHPOINT_ID = C.FISHPOINT_ID
    GROUP BY F.FISHPOINT_ID
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error('쿼리 오류:', err);
      return res.status(500).json({ error: 'DB 오류 발생' });
    }
    res.json(results);
  });
});

module.exports = app

// app.listen(3001, () => {
//   console.log('FishPoint 서버 실행 중');
// });
