// File: src/Server/router/AuthServer.js

const express   = require('express');
const axios     = require('axios');
const qs        = require('querystring');
const mysql     = require('mysql2/promise');
const crypto    = require('crypto');

const router = express.Router();

// ─── MySQL 풀 생성 ───────────────────────────────────────────────────────
const pool = mysql.createPool({
  host               : 'project-db-campus.smhrd.com',
  port               : 3307,
  user               : 'campus_25SW_BigData_p2_4',
  password           : 'smhrd4',
  database           : 'campus_25SW_BigData_p2_4',
  waitForConnections : true,
  connectionLimit    : 10
});

// ─── OAuth 설정값 ────────────────────────────────────────────────────────
const GOOGLE = {
  client_id:     '11476171992-qr8lq7e79it7v3p20460esmff8vu0cda.apps.googleusercontent.com',
  client_secret: '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',
  redirect_uri:  'http://localhost:3001/auth/google/callback'
};
const KAKAO = {
  client_id:    '838120870316a0d18acf54641b9a901b',
  redirect_uri: 'http://localhost:3001/auth/kakao/callback'
};
const NAVER = {
  client_id:     'xZipVr8JiejcQa_fuguv',
  client_secret: '5yU5VVpO5I',
  redirect_uri:  'http://localhost:3001/auth/naver/callback'
};

// ─── 1) Google 인증 화면으로 리디렉트 ────────────────────────────────────
router.get('/google', (req, res) => {
  const url = 'https://accounts.google.com/o/oauth2/v2/auth?' + qs.stringify({
    client_id:    GOOGLE.client_id,
    redirect_uri: GOOGLE.redirect_uri,
    response_type:'code',
    scope:        'profile email',
    prompt:       'select_account'
  });
  res.redirect(url);
});

// ─── 2) Google 콜백 핸들러 ───────────────────────────────────────────────
router.get('/google/callback', async (req, res) => {
  try {
    const code = req.query.code;
    const tokenRes = await axios.post(
      'https://oauth2.googleapis.com/token',
      qs.stringify({
        code,
        client_id:     GOOGLE.client_id,
        client_secret: GOOGLE.client_secret,
        redirect_uri:  GOOGLE.redirect_uri,
        grant_type:    'authorization_code'
      }),
      { headers: { 'Content-Type':'application/x-www-form-urlencoded' } }
    );
    const accessToken = tokenRes.data.access_token;

    const profileRes = await axios.get(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      { headers: { Authorization:`Bearer ${accessToken}` } }
    );
    const data     = profileRes.data;
    const userId   = String(data.email ?? '');
    const nickname = String(data.name  ?? '');
    
    req.session.userId = userId;

    if (!userId) {
      console.error('Google userinfo missing email:', data);
      return res.redirect('http://localhost:5173/login?error=google');
    }

    const [[exists]] = await pool.execute(
      'SELECT 1 FROM Member WHERE USER_ID=?',
      [userId]
    );
    if (!exists) {
      await pool.execute(
        'INSERT INTO Member (USER_ID, PW, NAME) VALUES (?, ?, ?)',
        [userId, '', nickname]
      );
    }

    res.redirect('http://localhost:5173/login?user_id=' + encodeURIComponent(userId));
  } catch (e) {
    console.error(e);
    res.redirect('http://localhost:5173/login?error=google');
  }
});

// ─── 3) Kakao 인증 화면으로 리디렉트 ────────────────────────────────────
router.get('/kakao', (req, res) => {
  const url = 'https://kauth.kakao.com/oauth/authorize?' + qs.stringify({
    client_id:     KAKAO.client_id,
    redirect_uri:  KAKAO.redirect_uri,
    response_type: 'code',
    scope:         'profile_nickname account_email',  // 이메일 권한 추가
    prompt:        'login'
  });
  res.redirect(url);
});

// ─── 4) Kakao 콜백 핸들러 ───────────────────────────────────────────────
router.get('/kakao/callback', async (req, res) => {
  try {
    const code = req.query.code;
    const tokenRes = await axios.post(
      'https://kauth.kakao.com/oauth/token',
      qs.stringify({
        grant_type:    'authorization_code',
        client_id:     KAKAO.client_id,
        redirect_uri:  KAKAO.redirect_uri,
        code
      }),
      { headers: { 'Content-Type':'application/x-www-form-urlencoded' } }
    );
    const accessToken = tokenRes.data.access_token;

    const profileRes = await axios.get(
      'https://kapi.kakao.com/v2/user/me',
      { headers: { Authorization:`Bearer ${accessToken}` } }
    );
    console.log('🍊 Kakao raw data:', profileRes.data);
    const acct     = profileRes.data.kakao_account || {};
    let userId     = String(acct.email ?? '');
    const nickname = String(acct.profile?.nickname ?? '');

    req.session.userId = userId;

    if (!userId) {
      console.warn('⚠️ Kakao email undefined, fallback to rawId');
      userId = String(profileRes.data.id);
    }

    if (!userId) {
      console.error('Kakao userId missing:', profileRes.data);
      return res.redirect('http://localhost:5173/login?error=kakao');
    }

    const [[exists]] = await pool.execute(
      'SELECT 1 FROM Member WHERE USER_ID=?',
      [userId]
    );
    if (!exists) {
      await pool.execute(
        'INSERT INTO Member (USER_ID, PW, NAME) VALUES (?, ?, ?)',
        [userId, '', nickname]
      );
    }

    res.redirect('http://localhost:5173/login?user_id=' + encodeURIComponent(userId));
  } catch (e) {
    console.error(e);
    res.redirect('http://localhost:5173/login?error=kakao');
  }
});

// ─── 5) Naver 인증 화면으로 리디렉트 ─────────────────────────────────────
router.get('/naver', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  req.session.naverState = state;

  const url = 'https://nid.naver.com/oauth2.0/authorize?' + qs.stringify({
    client_id:    NAVER.client_id,
    response_type:'code',
    redirect_uri: NAVER.redirect_uri,
    state,
    scope:        'profile',
    auth_type:    'reauthenticate'
  });
  res.redirect(url);
});

// ─── 6) Naver 콜백 핸들러 ───────────────────────────────────────────────
router.get('/naver/callback', async (req, res) => {
  try {
    const { code, state: returnedState } = req.query;
    if (returnedState !== req.session.naverState) {
      throw new Error('Invalid Naver OAuth state');
    }

    const tokenRes = await axios.get(
      'https://nid.naver.com/oauth2.0/token',
      { params:{
          grant_type:    'authorization_code',
          client_id:     NAVER.client_id,
          client_secret: NAVER.client_secret,
          code,
          state:         returnedState
        }}
    );
    const accessToken = tokenRes.data.access_token;

    const profileRes = await axios.get(
      'https://openapi.naver.com/v1/nid/me',
      { headers: { Authorization:`Bearer ${accessToken}` } }
    );
    const resp     = profileRes.data.response || {};
    const userId   = String(resp.email ?? '');
    const nickname = String(resp.name  ?? '');

    req.session.userId = userId;

    if (!userId) {
      console.error('Naver profile.email missing:', profileRes.data);
      return res.redirect('http://localhost:5173/login?error=naver');
    }

    const [[exists]] = await pool.execute(
      'SELECT 1 FROM Member WHERE USER_ID=?',
      [userId]
    );
    if (!exists) {
      await pool.execute(
        'INSERT INTO Member (USER_ID, PW, NAME) VALUES (?, ?, ?)',
        [userId, '', nickname]
      );
    }

    res.redirect('http://localhost:5173/login?user_id=' + encodeURIComponent(userId));
  } catch (e) {
    console.error(e);
    res.redirect('http://localhost:5173/login?error=naver');
  }
});

// ─── 7) 로그아웃 ────────────────────────────────────────────────────────
router.get('/logout', (req, res) => {
  res.redirect('http://localhost:5173/login');
});

module.exports = router;