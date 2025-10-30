import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import usePersistentState from '../hooks/usePersistentState'
import activitiesMood01 from '../assets/planner-05.jpg'
import activitiesMood02 from '../assets/planner-08.jpg'
import activitiesMood03 from '../assets/planner-04.jpg'

type ActivityStatus = 'a-faire' | 'planifie' | 'fait'

type Activity = {
  id: string
  title: string
  category: string
  status: ActivityStatus
  idealDate?: string
}

type ActivityDraft = {
  title: string
  category: string
  status: ActivityStatus
  idealDate: string
}

const statusLabels: Record<ActivityStatus, string> = {
  'a-faire': 'A explorer',
  planifie: 'Planifie',
  fait: 'Realise',
}

const categoryPalette = ['#C7D2FE', '#FBCFE8', '#FDE68A', '#BBF7D0', '#FECACA']

const defaultActivities: Activity[] = [
  { id: 'act-1', title: 'Cours de poterie', category: 'Creativite', status: 'planifie', idealDate: '' },
  { id: 'act-2', title: 'Randonnee au lever du soleil', category: 'Nature', status: 'a-faire', idealDate: '' },
  { id: 'act-3', title: 'Atelier photo', category: 'Creativite', status: 'fait', idealDate: '' },
]

const activitiesMoodboard = [
  { src: activitiesMood01, alt: 'Palette pastel pour atelier creatif' },
  { src: activitiesMood02, alt: 'Balade nature et respiration' },
  { src: activitiesMood03, alt: 'Table organisee pour une activite fun' },
] as const

const ActivitiesPage = () => {
  const [activities, setActivities] = usePersistentState<Activity[]>('planner.activities', () => defaultActivities)
  const [draft, setDraft] = useState<ActivityDraft>({
    title: '',
    category: '',
    status: 'a-faire',
    idealDate: '',
  })

  useEffect(() => {
    document.body.classList.add('planner-page--white')
    return () => {
      document.body.classList.remove('planner-page--white')
    }
  }, [])

  const activitiesByStatus = useMemo(() => {
    const map = new Map<ActivityStatus, Activity[]>()
    activities.forEach((activity) => {
      const list = map.get(activity.status) ?? []
      list.push(activity)
      map.set(activity.status, list)
    })

    return Array.from(map.entries())
  }, [activities])

  const activitiesStats = useMemo(() => {
    const inspirations = activities.filter((activity) => activity.status === 'a-faire').length
    const scheduled = activities.filter((activity) => activity.status === 'planifie').length
    const completed = activities.filter((activity) => activity.status === 'fait').length
    return [
      { id: 'ideas', label: 'Idees', value: inspirations.toString() },
      { id: 'scheduled', label: 'Dates prevues', value: scheduled.toString() },
      { id: 'done', label: 'Experiences', value: completed.toString() },
    ]
  }, [activities])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (draft.title.trim().length === 0) {
      return
    }

    const nextActivity: Activity = {
      id: `activity-${Date.now()}`,
      title: draft.title.trim(),
      category: draft.category.trim().length > 0 ? draft.category.trim() : 'Inspiration',
      status: draft.status,
      idealDate: draft.idealDate,
    }

    setActivities((previous) => [nextActivity, ...previous])
    setDraft({ title: '', category: '', status: draft.status, idealDate: '' })
  }

  return (
    <div className="activities-page aesthetic-page">
      <div className="activities-page__breadcrumb">activites</div>
      <div className="activities-page__accent-bar" aria-hidden="true" />

      <section className="activities-hero dashboard-panel">
        <div className="activities-hero__content">
          <span className="activities-hero__eyebrow">experiences a vivre</span>
          <h1>Compose ta to-do plaisir et creative.</h1>
          <p>Un espace pour consigner toutes les activites qui nourrissent ton energie.</p>
          <div className="activities-hero__stats">
            {activitiesStats.map((stat) => (
              <article key={stat.id}>
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </article>
            ))}
          </div>
        </div>
        <div className="activities-hero__gallery" aria-hidden="true">
          {activitiesMoodboard.map((image, index) => (
            <div key={image.src} className={`activities-hero__photo activities-hero__photo--${index + 1}`}>
              <img src={image.src} alt={image.alt} />
            </div>
          ))}
        </div>
      </section>

      <section className="activities-dashboard">
        <div className="activities-form dashboard-panel">
          <header className="activities-section-header">
            <span className="activities-section-header__eyebrow">nouvelle idee</span>
            <h2>Ajouter une activite</h2>
          </header>
          <form onSubmit={handleSubmit}>
            <label>
              <span>Nom</span>
              <input
                type="text"
                value={draft.title}
                onChange={(event) => setDraft((previous) => ({ ...previous, title: event.target.value }))}
                placeholder="Ex: Weekend spa"
                required
              />
            </label>
            <label>
              <span>Categorie</span>
              <input
                type="text"
                value={draft.category}
                onChange={(event) => setDraft((previous) => ({ ...previous, category: event.target.value }))}
                placeholder="Ex: Bien-etre"
              />
            </label>
            <label>
              <span>Statut</span>
              <select
                value={draft.status}
                onChange={(event) =>
                  setDraft((previous) => ({ ...previous, status: event.target.value as ActivityStatus }))
                }
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Date ideale</span>
              <input
                type="date"
                value={draft.idealDate}
                onChange={(event) => setDraft((previous) => ({ ...previous, idealDate: event.target.value }))}
              />
            </label>
            <button type="submit" className="activities-form__submit">
              Ajouter a la liste
            </button>
          </form>
        </div>

        <div className="activities-columns">
          {activitiesByStatus.map(([status, items]) => (
            <article key={status} className="activities-column dashboard-panel">
              <header>
                <h2>{statusLabels[status]}</h2>
                <span>{items.length} idee(s)</span>
              </header>
              <ul>
                {items.map((activity, index) => (
                  <li key={activity.id} style={{ borderColor: categoryPalette[index % categoryPalette.length] }}>
                    <strong>{activity.title}</strong>
                    <span>{activity.category}</span>
                    {activity.idealDate ? <time>{activity.idealDate}</time> : null}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <div className="activities-page__footer-bar" aria-hidden="true" />
    </div>
  )
}

export default ActivitiesPage
