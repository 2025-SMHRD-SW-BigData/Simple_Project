import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Main from './components/Main'
import Login from './components/Login'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className='App'>
        <Routes>
          <Route path='/' element={<Main/>}></Route>
          <Route path='/login' element={<Login/>}></Route>
        </Routes>
      </div>
    </>
  )
}

export default App
