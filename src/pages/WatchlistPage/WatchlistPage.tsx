import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import usePersistentState from '../../hooks/usePersistentState'
import watchMood01 from '../../assets/planner-02.jpg'
import watchMood02 from '../../assets/planner-07.jpg'
import watchMood03 from '../../assets/planner-09.jpg'
import "./WatchlistPage.css"

type WatchStatus = 'a-regarder' | 'en-cours' | 'termine'

type WatchItem = {
  id: string
  title: string
  type: string
  status: WatchStatus
  platform?: string
  thumbnail: string
}

const statusLabels: Record<WatchStatus, string> = {
  'a-regarder': 'À regarder',
  'en-cours': 'En cours',
  termine: 'Terminé',
}

const statusOrder: WatchStatus[] = ['a-regarder', 'en-cours', 'termine']

const typeOptions = ['Film', 'Série', 'Documentaire', 'Vidéo', 'Podcast']

const defaultItems: WatchItem[] = [
  {
    id: 'watch-1',
    title: 'The Creative Act',
    type: 'Documentaire',
    status: 'a-regarder',
    platform: 'YouTube',
    thumbnail: watchMood03,
  },
  {
    id: 'watch-2',
    title: 'Only Murders',
    type: 'Série',
    status: 'en-cours',
    platform: 'Disney+',
    thumbnail: watchMood01,
  },
  {
    id: 'watch-3',
    title: 'Minimalism',
    type: 'Film',
    status: 'termine',
    platform: 'Netflix',
    thumbnail: watchMood02,
  },
]

const watchlistMoodboard = [
  { src: watchMood01, alt: 'Sélection pastel de livres et écran' },
  { src: watchMood02, alt: 'Pause série cosy avec plaid et boisson' },
  { src: watchMood03, alt: 'Carnet et thé pour noter des idées culturelles' },
] as const

const typeThumbnails: Record<string, string> = {
  Film: watchMood02,
  'Série': watchMood01,
  Documentaire: watchMood03,
  'Vidéo': watchMood01,
  Podcast: watchMood02,
}

const defaultStatusBanners: Record<WatchStatus, string> = {
  'a-regarder': watchMood02,
  'en-cours': watchMood01,
  termine: watchMood03,
}

const WatchlistPage = () => {
  const [items, setItems] = usePersistentState<WatchItem[]>('planner.watchlist', () => defaultItems)
  const [draft, setDraft] = useState({ title: '', type: 'Film', status: 'a-regarder' as WatchStatus, platform: '' })
  const [statusBanners, setStatusBanners] = usePersistentState<Record<WatchStatus, string>>(
    'planner.watchlist.banners',
    () => defaultStatusBanners,
  )
  const [activeModal, setActiveModal] = useState<WatchStatus | null>(null)
  const [menuForItem, setMenuForItem] = useState<string | null>(null)

  useEffect(() => {
    document.body.classList.add('planner-page--white')
    return () => {
      document.body.classList.remove('planner-page--white')
    }
  }, [])

  useEffect(() => {
    if (!activeModal) {
      return undefined
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveModal(null)
        setMenuForItem(null)
      }
    }
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeModal])

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (
        target.closest('.watchlist-card-menu__trigger') ||
        target.closest('.watchlist-card-menu')
      ) {
        return
      }
      setMenuForItem(null)
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  const listByStatus = useMemo(
    () =>
      statusOrder.map((status) => [status, items.filter((item) => item.status === status)] as [WatchStatus, WatchItem[]]),
    [items],
  )

  const stats = useMemo(() => {
    const inspirations = items.filter((item) => item.status === 'a-regarder').length
    const inProgress = items.filter((item) => item.status === 'en-cours').length
    const completed = items.filter((item) => item.status === 'termine').length
    return [
      { id: 'ideas', label: 'À découvrir', value: inspirations.toString() },
      { id: 'progress', label: 'En cours', value: inProgress.toString() },
      { id: 'finished', label: 'Visionnés', value: completed.toString() },
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
      thumbnail: typeThumbnails[draft.type] ?? watchMood02,
    }

    setItems((previous) => [newItem, ...previous])
    setDraft((previous) => ({ ...previous, title: '', platform: '' }))
  }

  const handleBannerChange = (status: WatchStatus, banner: string) => {
    setStatusBanners((previous) => ({ ...previous, [status]: banner }))
  }

  const handleEditItem = (item: WatchItem) => {
    const nextTitle = window.prompt('Modifier le titre', item.title)
    if (nextTitle === null) return
    const normalizedTitle = nextTitle.trim()
    if (!normalizedTitle) return
    const nextSubtitle = window.prompt('Modifier le sous-titre', item.platform ?? item.type)
    const normalizedSubtitle = nextSubtitle?.trim()

    setItems((previous) =>
      previous.map((entry) =>
        entry.id === item.id ? { ...entry, title: normalizedTitle, platform: normalizedSubtitle || undefined } : entry,
      ),
    )
    setMenuForItem(null)
  }

  const handleMarkAsWatched = (id: string) => {
    setItems((previous) => previous.map((item) => (item.id === id ? { ...item, status: 'termine' } : item)))
    setMenuForItem(null)
  }

  const handleDeleteItem = (id: string) => {
    setItems((previous) => previous.filter((item) => item.id !== id))
    setMenuForItem(null)
  }

  const openModal = (status: WatchStatus) => {
    setActiveModal(status)
    setMenuForItem(null)
  }

  const closeModal = () => {
    setActiveModal(null)
    setMenuForItem(null)
  }

  const activeModalItems = activeModal ? items.filter((item) => item.status === activeModal) : []
  const activeModalBanner = activeModal ? statusBanners[activeModal] ?? defaultStatusBanners[activeModal] : null

  return (
    <div className="watchlist-page aesthetic-page">
      <div className="watchlist-page__breadcrumb">Watchlist</div>
      <div className="watchlist-page__accent-bar" aria-hidden="true" />

      <section className="watchlist-hero dashboard-panel">
        <div className="watchlist-hero__content">
          <span className="watchlist-hero__eyebrow">Culture douce</span>
          <h1>Collectionne tes coups de cœur à visionner</h1>
          <p>Films, séries, podcasts et vidéos à savourer sans rien oublier.</p>
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
            <span className="watchlist-section-header__eyebrow">Ajouter</span>
            <h2>Nouvelle référence</h2>
          </header>
          <form onSubmit={handleSubmit}>
            <label>
              <span>Titre</span>
              <input
                type="text"
                value={draft.title}
                onChange={(event) => setDraft((previous) => ({ ...previous, title: event.target.value }))}
                placeholder="Ex : L’art du minimalisme"
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
                placeholder="Ex : Netflix"
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
              Ajouter à la collection
            </button>
          </form>
        </div>

        <div className="watchlist-board">
          <div className="watchlist-popup-launchers">
            {listByStatus.map(([status, statusItems]) => (
              <button key={status} type="button" className="watchlist-launcher" onClick={() => openModal(status)}>
                <div className="watchlist-launcher__content">
                  <span>{statusLabels[status]}</span>
                  <strong>{statusItems.length} �l�ment(s)</strong>
                </div>
                <p>Ouvrir la popup</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {activeModal ? (
        <div
          className="watchlist-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={`Collection ${statusLabels[activeModal]}`}
          onClick={closeModal}
        >
          <div className="watchlist-modal" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="watchlist-modal__close" onClick={closeModal} aria-label="Fermer la fen�tre">
              &times;
            </button>
            <div
              className="watchlist-modal__banner"
              style={{ backgroundImage: `url(${activeModalBanner})` }}
            >
              <div className="watchlist-modal__banner-content">
                <div>
                  <span>Collection</span>
                  <h3>{statusLabels[activeModal]}</h3>
                </div>
                <label>
                  <span>Choisir une bann�re</span>
                  <select
                    value={statusBanners[activeModal] ?? defaultStatusBanners[activeModal]}
                    onChange={(event) => handleBannerChange(activeModal, event.target.value)}
                  >
                    {watchlistMoodboard.map((image) => (
                      <option key={image.src} value={image.src}>
                        {image.alt}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className="watchlist-modal__list">
              {activeModalItems.length === 0 ? (
                <p className="watchlist-modal__empty">Ajoute une inspiration pour remplir cette s�lection.</p>
              ) : (
                activeModalItems.map((item) => (
                  <article key={item.id} className="watchlist-modal-card">
                    <img src={item.thumbnail} alt="" aria-hidden="true" />
                    <div className="watchlist-modal-card__content">
                      <h4>{item.title}</h4>
                      <p>{item.platform || item.type}</p>
                    </div>
                    <button
                      type="button"
                      className="watchlist-card-menu__trigger"
                      aria-label="Actions"
                      onClick={(event) => {
                        event.stopPropagation()
                        setMenuForItem((previous) => (previous === item.id ? null : item.id))
                      }}
                    >
                      &#8942;
                    </button>
                    {menuForItem === item.id ? (
                      <div className="watchlist-card-menu">
                        <button type="button" onClick={() => handleEditItem(item)}>
                          Modifier
                        </button>
                        <button type="button" onClick={() => handleMarkAsWatched(item.id)}>
                          Marquer comme regard�
                        </button>
                        <button type="button" className="danger" onClick={() => handleDeleteItem(item.id)}>
                          Supprimer
                        </button>
                      </div>
                    ) : null}
                  </article>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}

      <div className="watchlist-page__footer-bar" aria-hidden="true" />
    </div>
  )
}

export default WatchlistPage
