import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Main from './components/Main'
import Login from './components/Login'
import Join from './components/Join'
import MainComu from './components/MainComu'
import MyMap from './components/MyMap'
import './App.css'
import Community from './components/Community'; // Community 컴포넌트 import

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className='App'>
        <Routes>
          <Route path='/' element={<Main/>}></Route>
          <Route path='/login' element={<Login/>}></Route>
          <Route path='/join' element={<Join/>}></Route>
<<<<<<< HEAD
          <Route path='/commumain' element={<MainComu/>}></Route>
          <Route path='/map' element={<MyMap/>}></Route>
=======
          <Route path='/community' element={<Community/>}/>
>>>>>>> 65d6920f6ae0ce19fdb39d84e4a6639bcb37b6fc
        </Routes>
      </div>
    </>
  )
}

export default App
