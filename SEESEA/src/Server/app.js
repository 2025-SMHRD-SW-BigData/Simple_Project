// File: src/Server/app.js

const express = require('express');
const session = require('express-session');
const cors    = require('cors');
const path    = require('path');

const loginRouter     = require('./router/LoginServer');
const joinRouter      = require('./router/JoinServer');
const fishPointRouter = require('./router/FishPointServer');
const pokedexRouter   = require('./router/PokedexServer');
const communityRouter = require('./router/CommunityServer');

const app = express();
const PORT = 3001;

// CORS 설정
app.use(cors({
  origin: ['http://localhost:3000','http://localhost:5173'],
  credentials: true
}));

// Body 파싱
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 세션 설정
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, sameSite: 'lax' }
}));

// ↓ 여기가 핵심: src/Server 가 아닌 src/public 폴더를 정확히 가리킵니다.
const PUBLIC_DIR = path.resolve(__dirname, '../public');
app.use('/static', express.static(PUBLIC_DIR));
app.use('/uploads', express.static(path.join(PUBLIC_DIR, 'uploads')));

// 라우터 마운트
app.use('/userLogin', loginRouter);
app.use('/userJoin',  joinRouter);
app.use('/fishPoint', fishPointRouter);
app.use('/pokedex',   pokedexRouter);
app.use('/community', communityRouter);

// 404 핸들러
app.use((req, res) => {
  console.warn(`⚠️ 404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: `Not Found: ${req.originalUrl}` });
});

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
