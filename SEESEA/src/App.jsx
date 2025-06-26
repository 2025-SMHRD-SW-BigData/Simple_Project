import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Main from './components/Main'
import Login from './components/Login'
import Join from './components/Join'
import MyMap from './components/MyMap'
import './App.css'
import Community from './components/Community'
import Pokedex from './components/Pokedex' // ✨ 1. 이 라인을 추가해서 Pokedex 컴포넌트를 불러옵니다.
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className='App'>
        <Routes>
          <Route path='/' element={<Main/>}></Route>
          <Route path='/login' element={<Login/>}></Route>
          <Route path='/join' element={<Join/>}></Route>
          <Route path='/map' element={<MyMap/>}></Route>
          <Route path='/community' element={<Community/>}></Route>
          <Route path='/pokedex' element={<Pokedex/>}></Route>
        </Routes>
      </div>
    </>
  )
}

export default App
