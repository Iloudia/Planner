import './ConfidentialitePage.css'

const ConfidentialitePage = () => (
  <div className="legal-page">
    <header className="legal-page__header">
      <p className="legal-page__eyebrow">Politique de confidentialite</p>
      <h1 className="legal-page__title">Respecter vos donnees</h1>
      <p className="legal-page__intro">
        Nous nous engageons a proteger vos informations personnelles et a vous offrir une experience
        claire et respectueuse.
      </p>
    </header>

    <section className="legal-section">
      <h2 className="legal-section__title">Donnees collectees</h2>
      <p className="legal-section__text">
        Nous recueillons uniquement les donnees necessaires a l utilisation du planner: adresse email,
        nom affiche et contenus que vous ajoutez dans vos espaces personnels.
      </p>
    </section>

    <section className="legal-section">
      <h2 className="legal-section__title">Utilisation</h2>
      <p className="legal-section__text">
        Ces donnees servent a personnaliser votre experience et a assurer la synchronisation entre vos
        appareils. Elles ne sont ni revendues ni partagees a des tiers sans votre accord.
      </p>
    </section>

    <section className="legal-section">
      <h2 className="legal-section__title">Vos droits</h2>
      <p className="legal-section__text">
        Vous pouvez demander la consultation, la rectification ou la suppression de vos informations a
        tout moment via contact@planner.app. Nous repondrons dans un delai maximum de 30 jours.
      </p>
    </section>
  </div>
)

export default ConfidentialitePage
