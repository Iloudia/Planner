import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import usePersistentState from '../hooks/usePersistentState'
import watchMood01 from '../assets/planner-02.jpg'
import watchMood02 from '../assets/planner-07.jpg'
import watchMood03 from '../assets/planner-09.jpg'

type WatchStatus = 'a-regarder' | 'en-cours' | 'termine'

type WatchItem = {
  id: string
  title: string
  type: string
  status: WatchStatus
  platform?: string
}

const statusLabels: Record<WatchStatus, string> = {
  'a-regarder': 'A regarder',
  'en-cours': 'En cours',
  termine: 'Termine',
}

const typeOptions = ['Film', 'Serie', 'Documentaire', 'Video', 'Podcast']

const defaultItems: WatchItem[] = [
  { id: 'watch-1', title: 'The Creative Act', type: 'Documentaire', status: 'a-regarder', platform: 'YouTube' },
  { id: 'watch-2', title: 'Only Murders', type: 'Serie', status: 'en-cours', platform: 'Disney+' },
  { id: 'watch-3', title: 'Minimalism', type: 'Film', status: 'termine', platform: 'Netflix' },
]

const watchlistMoodboard = [
  { src: watchMood01, alt: 'Selection pastel de livres et ecran' },
  { src: watchMood02, alt: 'Pause serie cosy avec plaid et boisson' },
  { src: watchMood03, alt: 'Carnet et the pour noter des idees culture' },
] as const

const WatchlistPage = () => {
  const [items, setItems] = usePersistentState<WatchItem[]>('planner.watchlist', () => defaultItems)
  const [draft, setDraft] = useState({ title: '', type: 'Film', status: 'a-regarder' as WatchStatus, platform: '' })

  useEffect(() => {
    document.body.classList.add('planner-page--white')
    return () => {
      document.body.classList.remove('planner-page--white')
    }
  }, [])

  const listByStatus = useMemo(() => {
    const map = new Map<WatchStatus, WatchItem[]>()
    items.forEach((item) => {
      const bucket = map.get(item.status) ?? []
      bucket.push(item)
      map.set(item.status, bucket)
    })
    return Array.from(map.entries())
  }, [items])

  const stats = useMemo(() => {
    const inspirations = items.filter((item) => item.status === 'a-regarder').length
    const inProgress = items.filter((item) => item.status === 'en-cours').length
    const completed = items.filter((item) => item.status === 'termine').length
    return [
      { id: 'ideas', label: 'Inspiration', value: inspirations.toString() },
      { id: 'progress', label: 'En cours', value: inProgress.toString() },
      { id: 'finished', label: 'Visionnes', value: completed.toString() },
    ]
  }, [items])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (draft.title.trim().length === 0) {
      return
    }

    const newItem: WatchItem = {
      id: `watch-${Date.now()}`,
      title: draft.title.trim(),
      type: draft.type,
      status: draft.status,
      platform: draft.platform.trim() || undefined,
    }

    setItems((previous) => [newItem, ...previous])
    setDraft((previous) => ({ ...previous, title: '', platform: '' }))
  }

  const cycleStatus = (id: string) => {
    setItems((previous) =>
      previous.map((item) => {
        if (item.id !== id) {
          return item
        }
        const order: WatchStatus[] = ['a-regarder', 'en-cours', 'termine']
        const index = order.indexOf(item.status)
        const nextStatus = order[(index + 1) % order.length]
        return { ...item, status: nextStatus }
      }),
    )
  }

  return (
    <div className="watchlist-page aesthetic-page">
      <div className="watchlist-page__breadcrumb">watchlist</div>
      <div className="watchlist-page__accent-bar" aria-hidden="true" />

      <section className="watchlist-hero dashboard-panel">
        <div className="watchlist-hero__content">
          <span className="watchlist-hero__eyebrow">culture douce</span>
          <h1>Collectionne tes coups de coeur a visionner.</h1>
          <p>Films, series, podcasts et videos a savourer sans rien oublier.</p>
          <div className="watchlist-hero__stats">
            {stats.map((stat) => (
              <article key={stat.id}>
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </article>
            ))}
          </div>
        </div>
        <div className="watchlist-hero__gallery" aria-hidden="true">
          {watchlistMoodboard.map((image, index) => (
            <div key={image.src} className={`watchlist-hero__photo watchlist-hero__photo--${index + 1}`}>
              <img src={image.src} alt={image.alt} />
            </div>
          ))}
        </div>
      </section>

      <section className="watchlist-dashboard">
        <div className="watchlist-form dashboard-panel">
          <header className="watchlist-section-header">
            <span className="watchlist-section-header__eyebrow">ajouter</span>
            <h2>Nouvelle reference</h2>
          </header>
          <form onSubmit={handleSubmit}>
            <label>
              <span>Titre</span>
              <input
                type="text"
                value={draft.title}
                onChange={(event) => setDraft((previous) => ({ ...previous, title: event.target.value }))}
                placeholder="Ex: L'art du minimalisme"
                required
              />
            </label>
            <label>
              <span>Type</span>
              <select
                value={draft.type}
                onChange={(event) => setDraft((previous) => ({ ...previous, type: event.target.value }))}
              >
                {typeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Plateforme</span>
              <input
                type="text"
                value={draft.platform}
                onChange={(event) => setDraft((previous) => ({ ...previous, platform: event.target.value }))}
                placeholder="Ex: Netflix"
              />
            </label>
            <label>
              <span>Statut</span>
              <select
                value={draft.status}
                onChange={(event) =>
                  setDraft((previous) => ({ ...previous, status: event.target.value as WatchStatus }))
                }
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className="watchlist-form__submit">
              Ajouter a la collection
            </button>
          </form>
        </div>

        <div className="watchlist-columns">
          {listByStatus.map(([status, statusItems]) => (
            <article key={status} className="watchlist-column dashboard-panel">
              <header>
                <h2>{statusLabels[status]}</h2>
                <span>{statusItems.length} fiche(s)</span>
              </header>
              <ul>
                {statusItems.map((item) => (
                  <li key={item.id}>
                    <div className="watchlist-item__meta">
                      <strong>{item.title}</strong>
                      <span>{item.type}</span>
                      {item.platform ? <em>{item.platform}</em> : null}
                    </div>
                    <button type="button" onClick={() => cycleStatus(item.id)} className="watchlist-item__cta">
                      Passer en mode{' '}
                      {statusLabels[
                        item.status === 'termine'
                          ? 'a-regarder'
                          : item.status === 'a-regarder'
                          ? 'en-cours'
                          : 'termine'
                      ]}
                    </button>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <div className="watchlist-page__footer-bar" aria-hidden="true" />
    </div>
  )
}

export default WatchlistPage
