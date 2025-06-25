const express = require('express')
const app = express();
const cors = require('cors')

app.use(cors())
app.use(express.json());

//http://localhost:3001/login
app.post('/login', (req,res)=>{
    console.log('접근 확인')
    res.send('Test')
})

app.listen(3001)