import type { CSSProperties } from 'react'
import {
  eveningRoutine,
  getDateKey,
  journalingPrompts,
  morningRoutine,
  monthlyReview,
  scheduledTasks,
} from '../data/sampleData'

type TaskCardStyle = CSSProperties & { '--task-color'?: string }

const PlannerPage = () => {
  const today = new Date()
  const todayKey = getDateKey(today)
  const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const tasksToday = scheduledTasks
    .filter((task) => task.date === todayKey)
    .sort((a, b) => a.start.localeCompare(b.start))

  return (
    <div className="planner-page">
      <section className="planner-section planner-day-overview">
        <div className="tasks-list">
          <div>
            <h2 className="section-title">Tâches à venir</h2>
            <p className="section-subtitle">
              Garde ton énergie pour les moments qui comptent.
            </p>
          </div>

          {tasksToday.length === 0 ? (
            <div className="tasks-empty">
              Aucune tâche planifiée aujourd&apos;hui. Ajoute celles qui feront
              la différence.
            </div>
          ) : (
            tasksToday.map((task) => {
              const cardStyle: TaskCardStyle = { '--task-color': task.color }
              return (
                <article key={task.id} className="task-card" style={cardStyle}>
                  <span className="task-card__time">
                    {task.start} — {task.end}
                  </span>
                  <div className="task-card__body">
                    <span className="task-card__title">{task.title}</span>
                    <span className="task-card__tag">{task.tag}</span>
                  </div>
                </article>
              )
            })
          )}
        </div>

        <div className="date-display">
          <span className="date-display__label">Aujourd&apos;hui</span>
          <time className="date-display__value">
            {dateFormatter.format(today)}
          </time>
        </div>
      </section>

      <section className="planner-section">
        <div>
          <h2 className="section-title">Journaling & rituels</h2>
          <p className="section-subtitle">
            Ancre ton intention du jour et prépare ton énergie.
          </p>
        </div>

        <div className="journal-routine">
          <div className="journal-card">
            <h3 className="journal-card__title">Espace journaling</h3>
            <p>Un paragraphe suffit pour clarifier ton focus et ton énergie.</p>
            <ul className="journal-prompts">
              {journalingPrompts.map((prompt, index) => (
                <li key={index}>{prompt}</li>
              ))}
            </ul>
            <textarea
              className="journal-editor"
              placeholder="Note ton intention, ton focus ou ta gratitude du jour…"
            />
          </div>

          <div className="routine-group">
            <div>
              <h3 className="routine-group__title">Routine du matin</h3>
              <ul className="routine-list">
                {morningRoutine.map((item) => (
                  <li key={item.id} className="routine-item">
                    {item.title}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="routine-group__title">Routine du soir</h3>
              <ul className="routine-list">
                {eveningRoutine.map((item) => (
                  <li key={item.id} className="routine-item">
                    {item.title}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="planner-section">
        <div>
          <h2 className="section-title">Revue du mois</h2>
          <p className="section-subtitle">
            Prends un instant pour reconnaître l&apos;avance gagnée.
          </p>
        </div>

        <div className="monthly-review">
          <div className="review-card">
            <span className="review-card__title">Points forts</span>
            <ul>
              {monthlyReview.highlights.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="review-card">
            <span className="review-card__title">Leçons clé</span>
            <ul>
              {monthlyReview.lessons.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="review-card">
            <span className="review-card__title">Focus prochain mois</span>
            <ul>
              {monthlyReview.focusNextMonth.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="review-card">
            <span className="review-card__title">Indicateurs</span>
            <div className="review-card__metrics">
              {monthlyReview.metrics.map((metric) => (
                <div key={metric.label} className="review-metric">
                  <span>{metric.label}</span>
                  <span>{metric.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default PlannerPage
