import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import usePersistentState from '../hooks/usePersistentState'
import outingsMood01 from '../assets/planner-04.jpg'
import outingsMood02 from '../assets/planner-08.jpg'
import outingsMood03 from '../assets/planner-10.jpg'

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

const outingsMoodboard = [
  { src: outingsMood01, alt: 'Terrasse au soleil pour un brunch pastel' },
  { src: outingsMood02, alt: 'Balade entre amies avec bouquet de fleurs' },
  { src: outingsMood03, alt: 'Cafe latte et carnet pour planifier une sortie' },
] as const

const OutingsPage = () => {
  const [outings, setOutings] = usePersistentState<Outing[]>('planner.outings', () => defaultOutings)
  const [draft, setDraft] = useState({ title: '', location: '', date: getDefaultDate(), details: '' })

  useEffect(() => {
    document.body.classList.add('planner-page--white')
    return () => {
      document.body.classList.remove('planner-page--white')
    }
  }, [])

  const stats = useMemo(() => {
    const uniquePlaces = new Set(
      outings.map((outing) => outing.location.trim()).filter((location) => location.length > 0),
    ).size
    const nextOuting = outings[0]
    return [
      { id: 'planned', label: 'Moments planifies', value: outings.length.toString() },
      { id: 'spots', label: 'Lieux inspires', value: uniquePlaces.toString() },
      { id: 'next', label: 'Prochaine date', value: nextOuting?.date ?? 'A definir' },
    ]
  }, [outings])

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
    <div className="outings-page aesthetic-page">
      <div className="outings-page__breadcrumb">sorties</div>
      <div className="outings-page__accent-bar" aria-hidden="true" />

      <section className="outings-hero dashboard-panel">
        <div className="outings-hero__content">
          <span className="outings-hero__eyebrow">moments a partager</span>
          <h1>Planifie des bulles de joie et de connexion.</h1>
          <p>Garde toutes tes idees sorties, invites et vibes preferees au meme endroit pastel.</p>
          <div className="outings-hero__stats">
            {stats.map((stat) => (
              <article key={stat.id}>
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </article>
            ))}
          </div>
        </div>
        <div className="outings-hero__gallery" aria-hidden="true">
          {outingsMoodboard.map((image, index) => (
            <div key={image.src} className={`outings-hero__photo outings-hero__photo--${index + 1}`}>
              <img src={image.src} alt={image.alt} />
            </div>
          ))}
        </div>
      </section>

      <section className="outings-layout">
        <div className="outings-form dashboard-panel">
          <header className="outings-section-header">
            <span className="outings-section-header__eyebrow">nouvelle idee</span>
            <h2>Planifier une sortie</h2>
          </header>
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
            <label className="outings-form__field outings-form__field--full">
              <span>Details</span>
              <textarea
                value={draft.details}
                onChange={(event) => setDraft((previous) => ({ ...previous, details: event.target.value }))}
                placeholder="Invites, budget, transport..."
                rows={3}
              />
            </label>
            <button type="submit" className="outings-form__submit">
              Ajouter au planning
            </button>
          </form>
        </div>

        <section className="outings-list dashboard-panel">
          <header className="outings-section-header">
            <span className="outings-section-header__eyebrow">planning doux</span>
            <h2>Moments prevus</h2>
          </header>
          {outings.length === 0 ? (
            <p className="outings-empty">Ajoute une idee sortie pour animer ton agenda.</p>
          ) : (
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
          )}
        </section>
      </section>

      <div className="outings-page__footer-bar" aria-hidden="true" />
    </div>
  )
}

export default OutingsPage
