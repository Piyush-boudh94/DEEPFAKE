import { Toaster } from 'react-hot-toast'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import AppErrorBoundary from './components/AppErrorBoundary'
import About from './pages/About'
import Detect from './pages/Detect'
import Home from './pages/Home'
import Report from './pages/Report'


function App() {
  return (
    <AppErrorBoundary>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/detect" element={<Detect />} />
          <Route path="/report/:id" element={<Report />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppErrorBoundary>
  )
}

export default App
