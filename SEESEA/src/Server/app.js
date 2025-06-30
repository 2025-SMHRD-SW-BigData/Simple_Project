// app.js
const express = require('express');
const session = require('express-session');
const cors    = require('cors');
const path    = require('path');

const loginRouter   = require('./router/LoginServer');
const joinRouter    = require('./router/JoinServer');
const fishPointRouter = require('./router/FishPointServer');
const pokedexRouter   = require('./router/PokedexServer');

const app = express();
const PORT = 3001;

// CORS 설정
app.use(cors({
  origin: ['http://localhost:3000','http://localhost:5173'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 세션 설정
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    sameSite: 'lax'
  }
}));

// 정적 파일 (필요 시)
app.use('/static', express.static(path.join(__dirname,'public')));

// 라우터 마운트
app.use('/userLogin', loginRouter);
app.use('/userJoin',  joinRouter);
app.use('/fishPoint', fishPointRouter);
app.use('/pokedex',   pokedexRouter);

// 404 핸들링
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
