import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import usePersistentState from '../hooks/usePersistentState'

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

const WatchlistPage = () => {
  const [items, setItems] = usePersistentState<WatchItem[]>('planner.watchlist', () => defaultItems)
  const [draft, setDraft] = useState({ title: '', type: 'Film', status: 'a-regarder' as WatchStatus, platform: '' })

  const listByStatus = useMemo(() => {
    const map = new Map<WatchStatus, WatchItem[]>()
    items.forEach((item) => {
      const bucket = map.get(item.status) ?? []
      bucket.push(item)
      map.set(item.status, bucket)
    })
    return Array.from(map.entries())
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
    <div className="watchlist-page">
      <header className="watchlist-header">
        <h1>Choses a regarder</h1>
        <p>Archive tout ce qui t'inspire: films, series, docu, podcasts.</p>
      </header>

      <section className="watchlist-form">
        <h2>Ajouter</h2>
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
          <button type="submit">Ajouter a la collection</button>
        </form>
      </section>

      <section className="watchlist-columns">
        {listByStatus.map(([status, statusItems]) => (
          <article key={status} className="watchlist-column">
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
                  <button type="button" onClick={() => cycleStatus(item.id)}>
                    Passer en mode {statusLabels[
                      item.status === 'termine'
                        ? 'a-regarder'
                        : (item.status === 'a-regarder' ? 'en-cours' : 'termine')
                    ]}
                  </button>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </div>
  )
}

export default WatchlistPage
