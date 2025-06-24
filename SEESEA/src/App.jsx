import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Main from './components/Main'
import Login from './components/Login'
import Join from './components/Join'
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
          <Route path='/community' element={<Community/>}/>
        </Routes>
      </div>
    </>
  )
}

export default App
