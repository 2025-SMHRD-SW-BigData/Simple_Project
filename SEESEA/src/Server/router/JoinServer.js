const express = require('express')
const app = express();

const mysql = require('mysql2')

//node에서 react로 응답 보내기 위해서 cors설정
//위치주의
const cors = require('cors')
app.use(cors())
app.use(express.json())

let conn = mysql.createConnection({
    host : 'project-db-campus.smhrd.com', //='0.0.0.0'
    port : 3307,
    user : 'campus_25SW_BigData_p2_4',
    password : 'smhrd4',
    database : 'campus_25SW_BigData_p2_4'
})

   conn.connect();

//http://localhost:3001/join
app.post('/join', (req,res)=>{
    console.log('접근 확인')

    const JoinId = req.body.USER_ID
    const JoinPw = req.body.PW
    const JoinName = req.body.NAME
    const JoinAge = req.body.AGE

console.log(req.body)

let checkID = 'SELECT * FROM Member WHERE USER_ID = ?'
conn.query(checkID, [JoinId], (err, results) => {
    if(err){
        console.error(err);
        return res.status(500).send({ success: false, message: '서버 오류' });
    }

    if(results.length > 0){
        // 이미 존재하는 아이디
     return res.status(400).send({ success: false, message: '이미 존재하는 아이디입니다.' });
    }


    let sql = 'insert into Member(USER_ID, PW, NAME, AGE) values (?, ?, ?, ?)';
    conn.query(sql,[JoinId,JoinPw,JoinName,JoinAge],(err,rows)=>{
         if(!err){
            console.log('입력성공')  
            res.send({ success: true, message: '회원가입 성공! 로그인 해주세요.' });          
        } else{
            console.log(err)
            console.log('입력실패')             
        }      
    })

})
})
// app.listen(3001, () => {
//     console.log('서버 실행 중')
// })
module.exports = app