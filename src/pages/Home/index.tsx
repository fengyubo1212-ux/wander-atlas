import { Link } from 'react-router-dom'
import './Home.css'

export default function Home() {
  return (
    <div className="home fade-in">
      <section className="hero">
        <div className="hero-icon">🌏</div>
        <h1 className="hero-title">随行 Wander</h1>
        <p className="hero-subtitle">陌生的地方，也能轻松出发。</p>
      </section>

      <section className="home-cards">
        <Link to="/navigation" className="home-card">
          <div className="card-icon">🧭</div>
          <h2 className="card-title">导航</h2>
          <p className="card-desc">从哪里去哪里？</p>
          <span className="card-action">开始导航 →</span>
        </Link>

        <Link to="/travel" className="home-card">
          <div className="card-icon">✈️</div>
          <h2 className="card-title">旅行</h2>
          <p className="card-desc">想去哪里旅行？</p>
          <span className="card-action">开始规划 →</span>
        </Link>
      </section>
    </div>
  )
}
