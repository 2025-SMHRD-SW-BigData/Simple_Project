import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Main from './components/Main'
import Login from './components/Login'
import Join from './components/Join'
import MyMap from './components/MyMap'
import './App.css'
import Community from './components/Community'
import FeedUpload from './components/FeedUpload'; // FeedUpload 컴포넌트 import
import Pokedex from './components/Pokedex' // ✨ 1. 이 라인을 추가해서 Pokedex 컴포넌트를 불러옵니다.
import RankingPage from './components/RankingPage'; // RankingPage 컴포넌트 import
import './App.css'
import MainLayout from './components/MainLayout';

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className='App'>
      <Routes>
        {/* 헤더/네비가 없는 페이지들 */}
        <Route path='/' element={<Main/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/join' element={<Join/>}/>
        {/* ... 다른 단독 페이지들 ... */}

        {/* ✨ 2. 헤더/네비를 공통으로 사용하는 페이지들을 그룹으로 묶습니다. */}
        <Route element={<MainLayout />}>
          <Route path='/community' element={<Community/>}/>
          <Route path='/pokedex' element={<Pokedex/>}/>
          <Route path='/map' element={<MyMap/>}/>
          {/* '/new' 경로는 아직 없지만, 나중에 여기에 추가하면 됩니다. */}
          {/* <Route path='/new' element={<CreatePage/>}/> */}
        </Route>
      </Routes>
    </div>
  );
}

export default App;
