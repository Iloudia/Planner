import { Link, Route, Routes, useLocation } from 'react-router-dom'
import CalendarPage from './pages/CalendarPage'
import ActivitiesPage from './pages/ActivitiesPage'
import FinancePage from './pages/FinancePage'
import JournalingPage from './pages/JournalingPage'
import MonthlyReviewPage from './pages/MonthlyReviewPage'
import WishlistPage from './pages/WishlistPage'
import RoutinePage from './pages/RoutinePage'
import TherapyPage from './pages/TherapyPage'
import WatchlistPage from './pages/WatchlistPage'
import PlannerPage from './pages/PlannerPage'
import SelfLovePage from './pages/SelfLovePage'
import SportPage from './pages/SportPage'
import BackButton from './components/BackButton'
import logo1 from './assets/Logo1.png'
import { TasksProvider } from './context/TasksContext'

const App = () => {
  const location = useLocation()
  const showBackButton = location.pathname !== '/'

  return (
    <TasksProvider>
      <div className="app-shell">
        <header className="site-header">
          <div className="site-header__inner">
            <div className="site-header__brand">
              <Link to="/" className="site-logo">
                <img src={logo1} alt="Logo Planner" />
                <span>Planner</span>
              </Link>
              {showBackButton ? <BackButton /> : null}
            </div>
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
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/sorties" element={<WishlistPage />} />
            <Route path="/therapie" element={<TherapyPage />} />
            <Route path="/self-love" element={<SelfLovePage />} />
            <Route path="/sport" element={<SportPage />} />
          </Routes>
        </main>

        <footer className="site-footer">
          {'Propulse ta journ\u00e9e \u2014 garde l\u0027\u00e9quilibre entre ambition et s\u00e9r\u00e9nit\u00e9.'}
        </footer>
      </div>
    </TasksProvider>
  )
}

export default App


