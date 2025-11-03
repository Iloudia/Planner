import './ContactPage.css'

const ContactPage = () => (
  <div className="legal-page">
    <header className="legal-page__header">
      <p className="legal-page__eyebrow">Contact</p>
      <h1 className="legal-page__title">Ecrire a Planner</h1>
      <p className="legal-page__intro">
        Une idee, une question ou envie de collaborer ? Laisse-moi un message et je te repondrai avec
        grand plaisir.
      </p>
    </header>

    <section className="legal-section">
      <h2 className="legal-section__title">Par email</h2>
      <p className="legal-section__text">
        Envoie ton message a <a href="mailto:contact@planner.app">contact@planner.app</a>. Pense a
        preciser l objet de ta demande pour faciliter la lecture.
      </p>
    </section>

    <section className="legal-section">
      <h2 className="legal-section__title">Sur Instagram</h2>
      <p className="legal-section__text">
        Tu peux egalement m ecrire en message prive sur Instagram @planner.app pour un echange rapide
        et spontane.
      </p>
    </section>
  </div>
)

export default ContactPage
