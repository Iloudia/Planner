import { monthlyReview } from '../data/sampleData'

const MonthlyReviewPage = () => {
  return (
    <div className="review-page">
      <header className="review-header">
        <h1>Revue du mois</h1>
        <p>Une vision claire de tes progres et des ajustements a prevoir pour le mois prochain.</p>
      </header>

      <section className="review-cards">
        <article>
          <h2>Moments forts</h2>
          <ul>
            {monthlyReview.highlights.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </article>
        <article>
          <h2>Lecons</h2>
          <ul>
            {monthlyReview.lessons.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </article>
        <article>
          <h2>Focus prochain mois</h2>
          <ul>
            {monthlyReview.focusNextMonth.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </article>
        <article>
          <h2>Indicateurs</h2>
          <ul className="review-metrics">
            {monthlyReview.metrics.map((metric) => (
              <li key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  )
}

export default MonthlyReviewPage
