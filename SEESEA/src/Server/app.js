// File: src/Server/app.js
const express       = require('express');
const session       = require('express-session');
const cors          = require('cors');
const path          = require('path');
const cookieParser  = require('cookie-parser');

const authRouter      = require('./router/AuthServer');
const loginRouter     = require('./router/LoginServer');
const joinRouter      = require('./router/JoinServer');
const fishPointRouter = require('./router/FishPointServer');
const pokedexRouter   = require('./router/PokedexServer');
const communityRouter = require('./router/CommunityServer');
const rankingRouter   = require('./router/RankingServer');

const app = express();
const PORT = 3001;

// 1) CORS 설정
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true
}));

// 2) Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3) Cookie + Session
app.use(cookieParser());
app.use(session({
  secret: 'your-session-secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,      // 로컬은 false
    sameSite: 'lax',    // ⬅️ 변경: 네비게이션 요청에서도 쿠키가 유지되도록
    httpOnly: true
  }
}));

// 4) 정적 파일 서빙
const PUBLIC_DIR = path.resolve(__dirname, '../public');
app.use('/static', express.static(PUBLIC_DIR));
app.use('/uploads', express.static(path.join(PUBLIC_DIR, 'uploads')));

// 5) 라우터 마운트
app.use('/auth',      authRouter);
app.use('/userLogin', loginRouter);
app.use('/userJoin',  joinRouter);
app.use('/fishPoint', fishPointRouter);
app.use('/pokedex',   pokedexRouter);
app.use('/community', communityRouter);
app.use('/ranking',   rankingRouter);

// 6) 404 핸들러
app.use((req, res) => {
  res.status(404).json({ error: `Not Found: ${req.method} ${req.originalUrl}` });
});

// 7) 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server Error' });
});

// 8) 서버 시작
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
