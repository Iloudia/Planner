import { useEffect } from 'react'
import therapyMood01 from '../assets/planner-01.jpg'
import therapyMood02 from '../assets/planner-06.jpg'
import therapyMood03 from '../assets/planner-03.jpg'

const dailyPractices = [
  'Respiration 4-7-8 pendant 3 minutes',
  'Ecrire 3 affirmation(s) de confiance',
  'Messagerie vocale bienveillance: dire une fierte du jour',
]

const confidenceBoosters = [
  'Lister une competences renforcee cette semaine',
  'Envoyer un message de gratitude a quelqu\'un',
  'Prendre 5 minutes pour revisualiser un succes recent',
]

const releaseTensions = [
  'Scan corporel rapide (du sommet du crane jusqu\'aux pieds)',
  'Etirement des epaules et du haut du dos 2 minutes',
  'Marcher 10 minutes en pleine conscience',
]

const therapyMoodboard = [
  { src: therapyMood01, alt: 'Carnet de therapie pastel' },
  { src: therapyMood02, alt: 'Bougie et fleurs sechees relaxantes' },
  { src: therapyMood03, alt: 'Respiration et relaxation au soleil' },
] as const

const TherapyPage = () => {
  useEffect(() => {
    document.body.classList.add('planner-page--white')
    return () => {
      document.body.classList.remove('planner-page--white')
    }
  }, [])

  const therapyCards = [
    {
      id: 'daily',
      title: 'Routine anti-stress quotidienne',
      accent: '#fde2e4',
      description: 'Des micro-rituels matin et soir pour revenir au calme.',
      items: dailyPractices,
      badge: '3 minutes',
    },
    {
      id: 'boost',
      title: 'Boost confiance',
      accent: '#e0f2fe',
      description: 'Active ta posture de succes avec ces actions flash.',
      items: confidenceBoosters,
      badge: 'energie',
    },
    {
      id: 'release',
      title: 'Liberer les tensions',
      accent: '#ede9fe',
      description: 'Reconnecte-toi a ton corps et relache les zones crispes.',
      items: releaseTensions,
      badge: 'detente',
    },
  ] as const

  const therapyStats = [
    { id: 'practices', label: 'Rituels quotidiens', value: dailyPractices.length.toString() },
    { id: 'confidence', label: 'Boosters confiance', value: confidenceBoosters.length.toString() },
    { id: 'tension', label: 'Detente express', value: releaseTensions.length.toString() },
  ]

  return (
    <div className="therapy-page aesthetic-page">
      <div className="therapy-page__breadcrumb">therapie</div>
      <div className="therapy-page__accent-bar" aria-hidden="true" />

      <section className="therapy-hero dashboard-panel">
        <div className="therapy-hero__content">
          <span className="therapy-hero__eyebrow">espace therapie</span>
          <h1>Respire, recentre-toi, repars confiante.</h1>
          <p>
            Des rituels courts pour apaiser le stress, activer ta confiance et relacher la pression en douceur.
          </p>
          <div className="therapy-hero__stats">
            {therapyStats.map((stat) => (
              <article key={stat.id}>
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </article>
            ))}
          </div>
        </div>
        <div className="therapy-hero__gallery" aria-hidden="true">
          {therapyMoodboard.map((image, index) => (
            <div key={image.src} className={`therapy-hero__photo therapy-hero__photo--${index + 1}`}>
              <img src={image.src} alt={image.alt} />
            </div>
          ))}
        </div>
      </section>

      <section className="therapy-grid">
        {therapyCards.map((card) => (
          <article key={card.id} className="therapy-card">
            <header className="therapy-card__header" style={{ background: card.accent }}>
              <span className="therapy-card__badge">{card.badge}</span>
              <h2>{card.title}</h2>
              <p>{card.description}</p>
            </header>
            <ul className="therapy-card__list">
              {card.items.map((item) => (
                <li key={item}>
                  <span className="therapy-card__bullet" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <div className="therapy-page__footer-bar" aria-hidden="true" />
    </div>
  )
}

export default TherapyPage
