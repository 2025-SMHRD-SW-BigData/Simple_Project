const express = require('express')
const app = express();
const cors = require('cors')
const mysql = require('mysql2')

app.use(cors())
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let conn = mysql.createConnection({
    host : 'project-db-campus.smhrd.com', //='0.0.0.0'
    port : 3307,
    user : 'campus_25SW_BigData_p2_4',
    password : 'smhrd4',
    database : 'campus_25SW_BigData_p2_4'
})

   conn.connect();



//http://localhost:3001/login
app.post('/login', (req,res)=>{
    console.log('접근 확인')
    console.log('받은 데이터:', req.body)

    const JoinId = req.body.USER_ID
    const JoinPw = req.body.PW


let checkID = 'SELECT * FROM Member WHERE USER_ID = ? and PW = ?'
conn.query(checkID, [JoinId, JoinPw], (err, results) => {
if(err){
    console.error(err);
    return res.status(500).send({ success: false, message: '서버 오류' });
    }

if (results.length > 0) {
    console.log('로그인 성공');
    return res.send({ success: true, message: '로그인 성공' })
}else{
    console.log('로그인 실패')
    return res.status(401).send({ success: false, message: '아이디 또는 비밀번호가 일치하지 않습니다.' });
    }

console.log(req)


})
})
app.listen(3001, () => {
    console.log('서버 실행 중')
})