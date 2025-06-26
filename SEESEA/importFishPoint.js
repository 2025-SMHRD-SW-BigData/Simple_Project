// importFishpoints.js

const mysql = require('mysql2/promise');
const XLSX  = require('xlsx');
const path  = require('path');
const fs    = require('fs');

(async () => {
  // 1) DB 연결
  const db = await mysql.createConnection({
    host: 'project-db-campus.smhrd.com',
    port: 3307,
    user: 'campus_25SW_BigData_p2_4',
    password: 'smhrd4',
    database: 'campus_25SW_BigData_p2_4',
  });
  console.log('✅ MySQL 연결 성공');

  try {
    // 2) 엑셀 파일 목록 생성
    const dataDir = path.join(__dirname, 'public', 'data');
    const files = Array.from({ length: 11 }, (_, i) => `points${i + 1}.xlsx`);

    for (const fileName of files) {
      const filePath = path.join(dataDir, fileName);
      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️ 파일 없음: ${filePath}`);
        continue;
      }

      // 3) 엑셀 읽어서 JSON 변환
      const wb = XLSX.readFile(filePath);
      const sheetName = wb.SheetNames[0];
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName]);

      // 4) 각 행을 DB에 INSERT
      for (const row of rows) {
        const name = row['낚시터명'] || '';
        const lat  = parseFloat(row['WGS84위도']  ?? row['위도']);
        const lng  = parseFloat(row['WGS84경도'] ?? row['경도']);
        if (!name || isNaN(lat) || isNaN(lng)) continue;

        await db.execute(
          `INSERT INTO FISHPOINT (LOCATION_NAME, 위도, 경도)
           VALUES (?, ?, ?)`,
          [name, lat, lng]
        );
      }

      console.log(`✅ ${fileName} → DB 삽입 완료`);
    }

    console.log('🎉 모든 엑셀 데이터 삽입 완료');
  } catch (err) {
    console.error('❌ 작업 중 오류:', err);
  } finally {
    await db.end();
    process.exit();
  }
})();
