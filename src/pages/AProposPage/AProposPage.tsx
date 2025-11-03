import './AProposPage.css'

const AProposPage = () => (
  <div className="legal-page">
    <header className="legal-page__header">
      <p className="legal-page__eyebrow">A propos</p>
      <h1 className="legal-page__title">Planner, un espace pour te recentrer</h1>
      <p className="legal-page__intro">
        Je suis passionnee par l organisation douce et les routines bien-etre. Planner est ne de cette
        envie de concilier productivite et douceur pour chaque journee.
      </p>
    </header>

    <section className="legal-section">
      <h2 className="legal-section__title">Mon approche</h2>
      <p className="legal-section__text">
        Le projet s appuie sur des outils simples, des visuels inspirants et des methodes testees dans
        mon quotidien. L objectif est de t aider a garder ton cap tout en respectant ton rythme.
      </p>
    </section>

    <section className="legal-section">
      <h2 className="legal-section__title">Ce que tu trouveras ici</h2>
      <p className="legal-section__text">
        Des pages pour planifier tes activites, suivre ton bien-etre, noter tes idees et preparer tes
        objectifs avec bienveillance. Tout est pense pour rester inspiree et alignee.
      </p>
    </section>
  </div>
)

export default AProposPage
