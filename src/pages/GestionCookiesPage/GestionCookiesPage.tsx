import './GestionCookiesPage.css'

const GestionCookiesPage = () => (
  <div className="legal-page">
    <header className="legal-page__header">
      <p className="legal-page__eyebrow">Gestion des cookies</p>
      <h1 className="legal-page__title">Maitriser vos preferences</h1>
      <p className="legal-page__intro">
        Cette page explique comment les cookies sont utilises sur Planner et comment vous pouvez
        ajuster vos choix.
      </p>
    </header>

    <section className="legal-section">
      <h2 className="legal-section__title">Cookies essentiels</h2>
      <p className="legal-section__text">
        Ils garantissent le fonctionnement basique du site, notamment la connexion a votre compte et
        la sauvegarde de vos preferences. Ils sont indispensables et ne peuvent pas etre desactives.
      </p>
    </section>

    <section className="legal-section">
      <h2 className="legal-section__title">Mesurer l audience</h2>
      <p className="legal-section__text">
        Nous utilisons des cookies analytics anonymises pour comprendre les usages et ameliorer
        l experience. Vous pouvez choisir d activer ou non ces cookies dans la fenetre de gestion.
      </p>
    </section>

    <section className="legal-section">
      <h2 className="legal-section__title">Modifier vos choix</h2>
      <p className="legal-section__text">
        Vous pouvez a tout moment revenir sur vos decisions en ouvrant le centre de preferences
        disponible en bas de chaque page.
      </p>
    </section>
  </div>
)

export default GestionCookiesPage
