import { useState } from 'react'
import type { FormEvent } from 'react'
import usePersistentState from '../hooks/usePersistentState'

type Outing = {
  id: string
  title: string
  location: string
  date: string
  details?: string
}

const getDefaultDate = () => {
  const next = new Date()
  next.setDate(next.getDate() + 7)
  const year = next.getFullYear()
  const month = `${next.getMonth() + 1}`.padStart(2, '0')
  const day = `${next.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

const defaultOutings: Outing[] = [
  {
    id: 'out-1',
    title: 'Brunch avec Clara',
    location: 'Cafe pastel',
    date: getDefaultDate(),
    details: 'Penser a reserver une table pour 11h30',
  },
]

const OutingsPage = () => {
  const [outings, setOutings] = usePersistentState<Outing[]>('planner.outings', () => defaultOutings)
  const [draft, setDraft] = useState({ title: '', location: '', date: getDefaultDate(), details: '' })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (draft.title.trim().length === 0) {
      return
    }

    const nextOuting: Outing = {
      id: `outing-${Date.now()}`,
      title: draft.title.trim(),
      location: draft.location.trim(),
      date: draft.date,
      details: draft.details.trim() || undefined,
    }

    setOutings((previous) => [nextOuting, ...previous])
    setDraft((previous) => ({ ...previous, title: '', location: '', details: '' }))
  }

  return (
    <div className="outings-page">
      <header className="outings-header">
        <h1>Sorties a planifier</h1>
        <p>Anticipe tes moments de detente et garde tes idees sorties au meme endroit.</p>
      </header>

      <section className="outings-form">
        <h2>Nouvelle sortie</h2>
        <form onSubmit={handleSubmit}>
          <label>
            <span>Intitule</span>
            <input
              type="text"
              value={draft.title}
              onChange={(event) => setDraft((previous) => ({ ...previous, title: event.target.value }))}
              placeholder="Ex: Escape game"
              required
            />
          </label>
          <label>
            <span>Lieu</span>
            <input
              type="text"
              value={draft.location}
              onChange={(event) => setDraft((previous) => ({ ...previous, location: event.target.value }))}
              placeholder="Ex: Centre-ville"
            />
          </label>
          <label>
            <span>Date</span>
            <input
              type="date"
              value={draft.date}
              onChange={(event) => setDraft((previous) => ({ ...previous, date: event.target.value }))}
              required
            />
          </label>
          <label className="outings-form__field--full">
            <span>Details</span>
            <textarea
              value={draft.details}
              onChange={(event) => setDraft((previous) => ({ ...previous, details: event.target.value }))}
              placeholder="Invites, budget, transport..."
              rows={3}
            />
          </label>
          <button type="submit">Ajouter</button>
        </form>
      </section>

  <section className="outings-list">
        <h2>Planning</h2>
        <ul>
          {outings.map((outing) => (
            <li key={outing.id}>
              <header>
                <strong>{outing.title}</strong>
                <time>{outing.date}</time>
              </header>
              {outing.location ? <span className="outings-location">{outing.location}</span> : null}
              {outing.details ? <p>{outing.details}</p> : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export default OutingsPage
