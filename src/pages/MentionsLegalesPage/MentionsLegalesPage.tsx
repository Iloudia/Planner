import './MentionsLegalesPage.css'

const MentionsLegalesPage = () => (
  <div className="legal-page">
    <header className="legal-page__header">
      <p className="legal-page__eyebrow">Mentions legales</p>
      <h1 className="legal-page__title">Informer avec transparence</h1>
      <p className="legal-page__intro">
        Ces informations couvrent l identite de l editeur, l hebergeur et les conditions d utilisation
        du site Planner.
      </p>
    </header>

    <section className="legal-section">
      <h2 className="legal-section__title">Editeur du site</h2>
      <p className="legal-section__text">
        Ce site est edite par Planner, projet personnel destine a accompagner l organisation et le soin
        de soi au quotidien. Pour toute question, vous pouvez ecrire a contact@planner.app.
      </p>
    </section>

    <section className="legal-section">
      <h2 className="legal-section__title">Responsabilite</h2>
      <p className="legal-section__text">
        Le contenu est fourni a titre indicatif et peut evoluer. L utilisation du site implique
        l acceptation des conditions presentees ici. Planner ne pourra etre tenu responsable des
        dommages directs ou indirects consecutifs a l utilisation du site.
      </p>
    </section>

    <section className="legal-section">
      <h2 className="legal-section__title">Hebergement</h2>
      <p className="legal-section__text">
        Le site est heberge par une plateforme cloud conforme aux exigences europeennes en matiere de
        securite et de protection des donnees.
      </p>
    </section>
  </div>
)

export default MentionsLegalesPage
