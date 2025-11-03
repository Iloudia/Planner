import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import heroIllustration from '../../assets/MoodBoard.png'
import plannerPreview from '../../assets/planner-02.jpg'
import mindfulPreview from '../../assets/planner-04.jpg'
import journalPreview from '../../assets/planner-09.jpg'
import './HomePage.css'

const HomePage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, login, userEmail, logout } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const destinationPath = useMemo(() => {
    const fromRoute = location.state as { from?: { pathname: string } } | undefined
    return fromRoute?.from?.pathname ?? '/planner'
  }, [location.state])

  useEffect(() => {
    if (isAuthenticated) {
      navigate(destinationPath, { replace: true })
    }
  }, [destinationPath, isAuthenticated, navigate])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const didLogin = login({ email, password })

    if (!didLogin) {
      setError('Merci de renseigner un email et un mot de passe valides.')
      return
    }

    setError('')
    setIsModalOpen(false)
    setEmail('')
    setPassword('')
  }

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero__content">
          <span className="home-hero__tagline">Un espace pour planifier en douceur</span>
          <h1>
            {"Planner t'accompagne pour une vie organis\u00e9e, align\u00e9e sur tes envies et pleine de douceur."}
          </h1>
          <p>
            {"Retrouve en un coup d'oeil tes routines, ton journal, tes finances et tout ce qui nourrit ton \u00e9quilibre."}
            {" Tu peux t'inscrire ou te connecter en quelques secondes pour acc\u00e9der \u00e0 ton espace personnalis\u00e9."}
          </p>
          <div className="home-hero__actions">
            <button type="button" className="home-cta-button" onClick={() => setIsModalOpen(true)}>
              Connexion ou inscription
            </button>
            {isAuthenticated ? (
              <button
                type="button"
                className="home-secondary-button"
                onClick={() => navigate('/planner')}
              >
                Reprendre ma planification
              </button>
            ) : null}
          </div>
          {isAuthenticated ? (
            <div className="home-hero__status">
              {"Connect\u00e9 en tant que "}<strong>{userEmail}</strong>
              <button type="button" onClick={logout}>
                {"Se d\u00e9connecter"}
              </button>
            </div>
          ) : null}
        </div>
        <div className="home-hero__visual">
          <img src={heroIllustration} alt="Moodboard Planner" />
        </div>
      </section>

      <section className="home-features" aria-labelledby="home-features-title">
        <h2 id="home-features-title">{"Tout ce que tu peux retrouver dans Planner"}</h2>
        <div className="home-feature-grid">
          <article className="home-feature-card">
            <img src={plannerPreview} alt="Aper\u00e7u du calendrier Planner" />
            <h3>{"Un agenda pastel qui te ressemble"}</h3>
            <p>
              {"Visualise ton mois, organise tes journ\u00e9es et ajoute des routines bien-\u00eatre pour garder le cap sans stress."}
            </p>
          </article>
          <article className="home-feature-card">
            <img src={mindfulPreview} alt="Pr\u00e9visualisation de l'espace self-love" />
            <h3>{"Prends soin de toi"}</h3>
            <p>
              {"Des espaces d\u00e9di\u00e9s \u00e0 la gratitude, \u00e0 tes activit\u00e9s pr\u00e9f\u00e9r\u00e9es et \u00e0 la th\u00e9rapie pour nourrir ton \u00e9quilibre mental."}
            </p>
          </article>
          <article className="home-feature-card">
            <img src={journalPreview} alt="Capture d'\u00e9cran du journal" />
            <h3>{"Un journal intime et guid\u00e9"}</h3>
            <p>
              {"Capture tes pens\u00e9es, tes le\u00e7ons du jour et tes intentions pour demain. Ton carnet reste \u00e0 port\u00e9e de main."}
            </p>
          </article>
        </div>
      </section>

      <section className="home-onboarding" aria-labelledby="home-onboarding-title">
        <h2 id="home-onboarding-title">{"Comment \u00e7a marche\u00a0?"}</h2>
        <ol className="home-steps">
          <li>
            <strong>{"Inscris-toi ou connecte-toi."}</strong>
            {" Tu as juste besoin d'un email et d'un mot de passe."}
          </li>
          <li>
            <strong>{"D\u00e9couvre ton tableau de bord."}</strong>
            {" Acc\u00e8de aux pages Planner, activit\u00e9s, journal et davantage."}
          </li>
          <li>
            <strong>{"Personnalise ton exp\u00e9rience."}</strong>
            {" Ajoute tes cartes favorites, planifie et suis tes progr\u00e8s."}
          </li>
        </ol>
      </section>

      {isModalOpen ? (
        <div className="home-auth-modal" role="dialog" aria-modal="true" aria-labelledby="home-auth-title">
          <div className="home-auth-modal__backdrop" onClick={() => setIsModalOpen(false)} />
          <div className="home-auth-modal__content">
            <header>
              <h2 id="home-auth-title">{"Connexion ou inscription"}</h2>
              <p>{"Entre ton email et un mot de passe pour rejoindre Planner."}</p>
            </header>
            <form onSubmit={handleSubmit} className="home-auth-form">
              <label htmlFor="home-auth-email">
                {"Adresse email"}
                <input
                  id="home-auth-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="toi@exemple.com"
                  required
                />
              </label>
              <label htmlFor="home-auth-password">
                {"Mot de passe"}
                <input
                  id="home-auth-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Cr\u00e9e ton mot de passe"
                  minLength={6}
                  required
                />
              </label>
              {error ? <p className="home-auth-form__error">{error}</p> : null}
              <div className="home-auth-form__actions">
                <button type="submit">{"Acc\u00e9der \u00e0 Planner"}</button>
                <button type="button" onClick={() => setIsModalOpen(false)}>
                  {"Annuler"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default HomePage


