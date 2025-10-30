import { useEffect, useMemo } from 'react'
import { monthlyReview } from '../data/sampleData'
import reviewMood01 from '../assets/planner-03.jpg'
import reviewMood02 from '../assets/planner-06.jpg'
import reviewMood03 from '../assets/planner-10.jpg'

const reviewMoodboard = [
  { src: reviewMood01, alt: 'Carnet pastel pour bilan mensuel' },
  { src: reviewMood02, alt: 'Moments forts capture en photo' },
  { src: reviewMood03, alt: 'Planification en douceur avec boisson chaude' },
] as const

const MonthlyReviewPage = () => {
  useEffect(() => {
    document.body.classList.add('planner-page--white')
    return () => {
      document.body.classList.remove('planner-page--white')
    }
  }, [])

  const highlightCount = useMemo(() => monthlyReview.highlights.length, [])

  const reviewStats = [
    { id: 'wins', label: 'Moments forts', value: highlightCount.toString() },
    { id: 'focus', label: 'Axes prochains', value: monthlyReview.focusNextMonth.length.toString() },
    { id: 'metrics', label: 'Indicateurs suivis', value: monthlyReview.metrics.length.toString() },
  ]

  return (
    <div className="review-page aesthetic-page">
      <div className="review-page__breadcrumb">revue</div>
      <div className="review-page__accent-bar" aria-hidden="true" />

      <section className="review-hero dashboard-panel">
        <div className="review-hero__content">
          <span className="review-hero__eyebrow">bilan pastel</span>
          <h1>Revue du mois</h1>
          <p>Un regard global sur tes progres, tes apprentissages et les ajustements a preparer.</p>
          <div className="review-hero__stats">
            {reviewStats.map((stat) => (
              <article key={stat.id}>
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </article>
            ))}
          </div>
        </div>
        <div className="review-hero__gallery" aria-hidden="true">
          {reviewMoodboard.map((image, index) => (
            <div key={image.src} className={`review-hero__photo review-hero__photo--${index + 1}`}>
              <img src={image.src} alt={image.alt} />
            </div>
          ))}
        </div>
      </section>

      <section className="review-grid">
        <article className="review-card">
          <header>
            <span className="review-card__eyebrow">gratitude</span>
            <h2>Moments forts</h2>
          </header>
          <ul>
            {monthlyReview.highlights.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </article>
        <article className="review-card">
          <header>
            <span className="review-card__eyebrow">prises de conscience</span>
            <h2>Lecons</h2>
          </header>
          <ul>
            {monthlyReview.lessons.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </article>
        <article className="review-card">
          <header>
            <span className="review-card__eyebrow">next steps</span>
            <h2>Focus prochain mois</h2>
          </header>
          <ul>
            {monthlyReview.focusNextMonth.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </article>
        <article className="review-card review-card--metrics">
          <header>
            <span className="review-card__eyebrow">mesure</span>
            <h2>Indicateurs</h2>
          </header>
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

      <div className="review-page__footer-bar" aria-hidden="true" />
    </div>
  )
}

export default MonthlyReviewPage
