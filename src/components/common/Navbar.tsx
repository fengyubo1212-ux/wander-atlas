import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'

const navItems = [
  { path: '/', label: '首页' },
  { path: '/navigation', label: '导航' },
  { path: '/travel', label: '旅行' },
  { path: '/trip', label: '我的行程' },
  { path: '/settings', label: '设置' },
]

export default function Navbar() {
  const location = useLocation()

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="brand-icon">🌏</span>
        <span className="brand-text">Wander</span>
      </Link>
      <div className="navbar-links">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`navbar-link ${location.pathname === item.path ? 'active' : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
