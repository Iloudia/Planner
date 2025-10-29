import { NavLink, Route, Routes } from 'react-router-dom'
import CalendarPage from './pages/CalendarPage'
import PlannerPage from './pages/PlannerPage'

const App = () => {
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="site-header__inner">
          <span className="site-logo">Planifier ma journée</span>
          <nav className="site-nav" aria-label="Navigation principale">
            <NavLink to="/" end className="site-nav__link">
              Plan du jour
            </NavLink>
            <NavLink to="/calendrier" className="site-nav__link">
              Calendrier mensuel
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<PlannerPage />} />
          <Route path="/calendrier" element={<CalendarPage />} />
        </Routes>
      </main>

      <footer className="site-footer">
        Propulse ta journée — garde l&apos;équilibre entre ambition et sérénité.
      </footer>
    </div>
  )
}

export default App

