import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import Inventory from './Inventory';
import Sales from './Sales';
import './App.css';

function Layout({ children }) {
  const location = useLocation();
  
  // Determine title based on path
  const getPageTitle = () => {
    if (location.pathname === '/') return 'Overview'; // Dashboard-like name
    if (location.pathname === '/sales') return 'Analytics';
    return 'Dashboard';
  };

  return (
    <div className="app-layout">
      
      {/* --- SIDEBAR --- */}
      <aside className="sidebar">
        <div className="brand-logo">
          <div className="brand-icon">L</div>
          <span>L.B Store</span>
        </div>

        <ul className="nav-menu">
          <li className="nav-item">
            <NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>
              <span className="icon">📦</span> Inventory
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/sales" className={({ isActive }) => isActive ? "active" : ""}>
              <span className="icon">📊</span> Sales History
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/customers" onClick={e => e.preventDefault()} style={{opacity: 0.5, cursor: 'not-allowed'}}>
              <span className="icon">👥</span> Customers
            </NavLink>
          </li>
        </ul>

        {/* Pro CTA Placeholder from Design */}
        {/* <div style={{ marginTop: 'auto', padding: '20px', background: '#F5F5F7', borderRadius: '14px', textAlign: 'center' }}>
          <h4 style={{margin: '0 0 8px 0', fontSize: '14px'}}>Upgrade to Pro</h4>
          <p style={{margin: '0 0 12px 0', fontSize: '12px', color: '#6F6F73'}}>Get more features</p>
          <button style={{background: '#4B71F0', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', width: '100%', cursor: 'pointer'}}>Upgrade</button>
        </div> */}
      </aside>

      {/* --- MAIN WRAPPER --- */}
      <div className="main-wrapper">
        
        {/* --- TOPBAR --- */}
        <header className="topbar">
          <div className="page-title">
            <h2>{getPageTitle()}</h2>
          </div>

          <div className="topbar-actions">
            {/* <div className="search-bar">
              <span>🔍</span>
              <input type="text" placeholder="Search anything..." />
            </div>
            <div className="user-profile">
              <div style={{textAlign: 'right', marginRight: '10px'}}>
                <div style={{fontWeight: 'bold', fontSize: '14px'}}>Admin User</div>
                <div style={{fontSize: '12px', color: '#6F6F73'}}>Manager</div>
              </div>
              <img src="https://ui-avatars.com/api/?name=Admin+User&background=1B1B1D&color=fff" alt="Profile" className="avatar" />
            </div> */}
          </div>
        </header>

        {/* --- CONTENT AREA --- */}
        <main className="content-area">
          {children}
        </main>

      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Inventory />} />
          <Route path="/sales" element={<Sales />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;