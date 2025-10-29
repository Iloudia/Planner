import { Link, Route, Routes } from 'react-router-dom'
import CalendarPage from './pages/CalendarPage'
import ActivitiesPage from './pages/ActivitiesPage'
import FinancePage from './pages/FinancePage'
import JournalingPage from './pages/JournalingPage'
import MonthlyReviewPage from './pages/MonthlyReviewPage'
import OutingsPage from './pages/OutingsPage'
import RoutinePage from './pages/RoutinePage'
import TherapyPage from './pages/TherapyPage'
import WatchlistPage from './pages/WatchlistPage'
import PlannerPage from './pages/PlannerPage'
import BackButton from './components/BackButton'

const App = () => {
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="site-header__inner">
          <BackButton />
          <Link to="/" className="site-logo">
            Planner
          </Link>
        </div>
      </header>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<PlannerPage />} />
          <Route path="/calendrier" element={<CalendarPage />} />
          <Route path="/calendrier-mensuel" element={<CalendarPage />} />
          <Route path="/activites" element={<ActivitiesPage />} />
          <Route path="/finances" element={<FinancePage />} />
          <Route path="/journaling" element={<JournalingPage />} />
          <Route path="/routine" element={<RoutinePage />} />
          <Route path="/revue-du-mois" element={<MonthlyReviewPage />} />
          <Route path="/choses-a-regarder" element={<WatchlistPage />} />
          <Route path="/sorties" element={<OutingsPage />} />
          <Route path="/therapie" element={<TherapyPage />} />
        </Routes>
      </main>

      <footer className="site-footer">
        {'Propulse ta journ\u00e9e \u2014 garde l\u0027\u00e9quilibre entre ambition et s\u00e9r\u00e9nit\u00e9.'}
      </footer>
    </div>
  )
}

export default App
