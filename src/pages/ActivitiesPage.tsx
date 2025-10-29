import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'

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

const ActivitiesPage = () => {
  const [activities, setActivities] = useState<Activity[]>([
    { id: 'act-1', title: 'Cours de poterie', category: 'Creativite', status: 'planifie', idealDate: '' },
    { id: 'act-2', title: 'Randonnee au lever du soleil', category: 'Nature', status: 'a-faire', idealDate: '' },
    { id: 'act-3', title: 'Atelier photo', category: 'Creativite', status: 'fait', idealDate: '' },
  ])
  const [draft, setDraft] = useState<ActivityDraft>({
    title: '',
    category: '',
    status: 'a-faire',
    idealDate: '',
  })

  const activitiesByStatus = useMemo(() => {
    const map = new Map<ActivityStatus, Activity[]>()
    activities.forEach((activity) => {
      const list = map.get(activity.status) ?? []
      list.push(activity)
      map.set(activity.status, list)
    })

    return Array.from(map.entries())
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
    <div className="activities-page">
      <header className="activities-header">
        <h1>Activites a tester</h1>
        <p>Gardes une liste vivante des experiences que tu veux planifier.</p>
      </header>

      <section className="activities-form">
        <h2>Ajouter une activite</h2>
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
          <button type="submit">Ajouter a la liste</button>
        </form>
      </section>

      <section className="activities-columns">
        {activitiesByStatus.map(([status, items]) => (
          <article key={status} className="activities-column">
            <header>
              <h2>{statusLabels[status]}</h2>
              <span>{items.length} idee(s)</span>
            </header>
            <ul>
              {items.map((activity, index) => (
                <li
                  key={activity.id}
                  style={{ borderColor: categoryPalette[index % categoryPalette.length] }}
                >
                  <strong>{activity.title}</strong>
                  <span>{activity.category}</span>
                  {activity.idealDate ? <time>{activity.idealDate}</time> : null}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </div>
  )
}

export default ActivitiesPage
