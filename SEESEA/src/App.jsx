import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Main from './components/Main'
import Login from './components/Login'
import Join from './components/Join'
import MainComu from './components/MainComu'
import MyMap from './components/MyMap'
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
          <Route path='/commumain' element={<MainComu/>}></Route>
          <Route path='/map' element={<MyMap/>}></Route>
        </Routes>
      </div>
    </>
  )
}

export default App
