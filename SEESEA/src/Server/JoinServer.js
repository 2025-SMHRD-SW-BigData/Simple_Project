const express = require('express')
const app = express();

const cors = require('cors')
app.use(cors())

//http://localhost:3001/join
app.get('/join', (req,res)=>{
    console.log('접근 확인')
    res.send('Test')
})


app.listen(3001)