import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Navbar from './components/common/Navbar'
import DemoBanner from './components/common/DemoBanner'

const Home = lazy(() => import('./pages/Home'))
const Navigation = lazy(() => import('./pages/Navigation'))
const NavigationResult = lazy(() => import('./pages/NavigationResult'))
const Travel = lazy(() => import('./pages/Travel'))
const TravelResult = lazy(() => import('./pages/TravelResult'))
const Trip = lazy(() => import('./pages/Trip'))
const Settings = lazy(() => import('./pages/Settings'))

function Loading() {
  return (
    <div className="loading-page">
      <div className="loading-spinner" />
      <p>加载中...</p>
    </div>
  )
}

export default function App() {
  return (
    <div className="app">
      <DemoBanner />
      <Navbar />
      <main className="main-content">
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/navigation" element={<Navigation />} />
            <Route path="/navigation/result" element={<NavigationResult />} />
            <Route path="/travel" element={<Travel />} />
            <Route path="/travel/result" element={<TravelResult />} />
            <Route path="/trip" element={<Trip />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  )
}
