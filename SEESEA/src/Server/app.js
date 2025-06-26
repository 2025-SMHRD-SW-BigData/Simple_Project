const express = require('express')
const app = express();
const cors = require('cors')

app.use(cors())
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const userLogin = require('./router/LoginServer')
const userJoin  = require('./router/JoinServer')
const fishPoint = require('./router/FishPointServer')  

app. use('/userLogin' , userLogin)
app. use('/userJoin' , userJoin)
app. use('/fishPoint' , fishPoint)

app.listen(3001)
