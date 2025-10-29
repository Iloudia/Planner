import { Route, Routes } from 'react-router-dom'
import CalendarPage from './pages/CalendarPage'
import PlannerPage from './pages/PlannerPage'

const App = () => {
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="site-header__inner" aria-hidden="true" />
      </header>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<PlannerPage />} />
          <Route path="/calendrier" element={<CalendarPage />} />
        </Routes>
      </main>

      <footer className="site-footer">
        {'Propulse ta journ\u00e9e \u2014 garde l\u0027\u00e9quilibre entre ambition et s\u00e9r\u00e9nit\u00e9.'}
      </footer>
    </div>
  )
}

export default App
