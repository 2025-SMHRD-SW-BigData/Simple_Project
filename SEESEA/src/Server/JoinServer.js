const express = require('express')
const app = express();

const mysql = require('mysql2')

//node에서 react로 응답 보내기 위해서 cors설정
//위치주의
const cors = require('cors')
app.use(cors())


let conn = mysql.createConnection({
    host : 'project-db-campus.smhrd.com', //='0.0.0.0'
    port : 3307,
    user : 'campus_25SW_BigData_p2_4',
    password : 'smhrd4',
    database : 'campus_25SW_BigData_p2_4'
})

   conn.connect();

//http://localhost:3001/join
app.get('/join', (req,res)=>{
    console.log('접근 확인')

    const JoinId = req.query.Email
    const JoinPw = req.query.Pw

 

    let sql = 'insert into member values(?,?)'
    conn.query(sql,[JoinId,JoinPw],(err,rows)=>{
         if(!err){
            console.log('입력성공')
            
        } else{
            console.log('입력실패') 
                       
        }      
    })

})


app.listen(3001)