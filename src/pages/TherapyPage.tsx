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

const TherapyPage = () => {
  return (
    <div className="therapy-page">
      <header className="therapy-header">
        <h1>Espace therapie</h1>
        <p>Des rituels courts pour apaiser le stress et nourrir la confiance au quotidien.</p>
      </header>

      <section className="therapy-section">
        <h2>Routine anti-stress quotidienne</h2>
        <ul>
          {dailyPractices.map((practice) => (
            <li key={practice}>{practice}</li>
          ))}
        </ul>
      </section>

      <section className="therapy-section">
        <h2>Boost confiance</h2>
        <ul>
          {confidenceBoosters.map((action) => (
            <li key={action}>{action}</li>
          ))}
        </ul>
      </section>

      <section className="therapy-section">
        <h2>Liberer les tensions</h2>
        <ul>
          {releaseTensions.map((exercise) => (
            <li key={exercise}>{exercise}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export default TherapyPage
