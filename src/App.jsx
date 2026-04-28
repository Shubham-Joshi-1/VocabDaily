import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { AppProvider } from './context/AppContext.jsx'
import Home from './pages/Home.jsx'
import History from './pages/History.jsx'
import Settings from './pages/Settings.jsx'
import './App.css'

function Footer() {
  return (
    <footer className="app-footer">
      Made by Shubham Joshi
    </footer>
  )
}

function BottomNav() {
  return (
    <nav className="bottom-nav">
      <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <span className="nav-icon">📖</span>
        <span className="nav-label">Today</span>
      </NavLink>
      <NavLink to="/history" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <span className="nav-icon">📅</span>
        <span className="nav-label">History</span>
      </NavLink>
      <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <span className="nav-icon">⚙️</span>
        <span className="nav-label">Settings</span>
      </NavLink>
    </nav>
  )
}

function Layout() {
  return (
    <div className="app-shell">
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
      <Footer />
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </AppProvider>
  )
}