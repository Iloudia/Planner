import './FaqPage.css'

const FAQPage = () => (
  <div className="legal-page">
    <header className="legal-page__header">
      <p className="legal-page__eyebrow">FAQ</p>
      <h1 className="legal-page__title">Questions frequentes</h1>
      <p className="legal-page__intro">
        Tu trouveras ici les reponses aux questions les plus posees sur l utilisation de Planner.
      </p>
    </header>

    <section className="legal-section">
      <h2 className="legal-section__title">Est-ce que Planner est gratuit ?</h2>
      <p className="legal-section__text">
        Oui, le projet est disponible librement pour t accompagner au quotidien. Les nouvelles
        fonctionnalites sont ajoutees progressivement.
      </p>
    </section>

    <section className="legal-section">
      <h2 className="legal-section__title">Comment sauvegarder mes donnees ?</h2>
      <p className="legal-section__text">
        Tes donnees sont stockees localement sur ton appareil. Je recommande dans tous les cas
        d exporter tes notes importantes pour conserver une copie personnelle.
      </p>
    </section>

    <section className="legal-section">
      <h2 className="legal-section__title">Puis-je suggerer des idees ?</h2>
      <p className="legal-section__text">
        Bien sûr ! J adore recevoir vos retours. Tu peux m ecrire via la page contact et partager tes
        envies pour les prochaines evolutions.
      </p>
    </section>
  </div>
)

export default FAQPage
