import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
import usePersistentState from '../hooks/usePersistentState'
import galleryImage01 from '../assets/planner-03.jpg'
import galleryImage02 from '../assets/planner-05.jpg'
import galleryImage03 from '../assets/planner-06.jpg'
import goalImageStrength from '../assets/planner-01.jpg'
import goalImageCardio from '../assets/planner-02.jpg'
import goalImageMobility from '../assets/planner-04.jpg'

type SportGoalStatus = 'not-started' | 'in-progress' | 'completed'

type SportGoal = {
  id: string
  title: string
  createdAt: string
  progress: number
  status: SportGoalStatus
  coverImage: string
  coverAlt: string
  focus: string
}

type SportBoardActivity = 'Cardio' | 'Fitness' | 'Yoga' | 'Renforcement' | 'Mobility' | 'Pilates' | 'Repos actif'

type SportBoardDay = {
  id: string
  label: string
  dateISO: string
  activity: SportBoardActivity
  done: boolean
}

const SPORT_BOARD_STORAGE_KEY = 'planner.sportBoard.v2'

const DAY_LABELS = [
  { id: 'mon', label: 'Lundi' },
  { id: 'tue', label: 'Mardi' },
  { id: 'wed', label: 'Mercredi' },
  { id: 'thu', label: 'Jeudi' },
  { id: 'fri', label: 'Vendredi' },
  { id: 'sat', label: 'Samedi' },
  { id: 'sun', label: 'Dimanche' },
] as const

const BOARD_ACTIVITY_OPTIONS: SportBoardActivity[] = [
  'Cardio',
  'Fitness',
  'Yoga',
  'Renforcement',
  'Mobility',
  'Pilates',
  'Repos actif',
]

const DEFAULT_BOARD_ACTIVITIES: SportBoardActivity[] = [
  'Cardio',
  'Renforcement',
  'Yoga',
  'Fitness',
  'Mobility',
  'Pilates',
  'Repos actif',
]

const GOAL_STATUS_LABELS: Record<SportGoalStatus, string> = {
  'not-started': 'À lancer',
  'in-progress': 'En cours',
  completed: 'Terminé',
}

const GALLERY_IMAGES = [
  { id: 'gallery-1', src: galleryImage01, alt: 'Séance de stretching matinale' },
  { id: 'gallery-2', src: galleryImage02, alt: 'Course au lever du soleil' },
  { id: 'gallery-3', src: galleryImage03, alt: 'Moment de récupération détente' },
] as const

const GOAL_CARDS: SportGoal[] = [
  {
    id: 'goal-1',
    title: 'Perdre 5 kg',
    createdAt: '2025-01-03',
    progress: 45,
    status: 'in-progress',
    coverImage: goalImageStrength,
    coverAlt: 'Séance de renforcement musculaire avec haltères',
    focus: 'Cardio & HIIT',
  },
  {
    id: 'goal-2',
    title: 'Préparer un 10 km',
    createdAt: '2024-12-10',
    progress: 70,
    status: 'in-progress',
    coverImage: goalImageCardio,
    coverAlt: 'Course en extérieur au lever du soleil',
    focus: 'Endurance running',
  },
  {
    id: 'goal-3',
    title: '30 jours de mobilité',
    createdAt: '2025-01-15',
    progress: 15,
    status: 'not-started',
    coverImage: goalImageMobility,
    coverAlt: 'Séance de mobilité et yoga à domicile',
    focus: 'Routine mobilité douce',
  },
  {
    id: 'goal-4',
    title: 'Gagner 3 kg de masse musculaire',
    createdAt: '2024-11-05',
    progress: 90,
    status: 'completed',
    coverImage: goalImageStrength,
    coverAlt: 'Séance de musculation en salle',
    focus: 'Programme hypertrophie',
  },
] as const

const spotifyPlaylistUrl =
  'https://open.spotify.com/embed/playlist/37i9dQZF1DX30wb8EewqgG?utm_source=generator&theme=0'

const formatGoalDate = (isoDate: string) =>
  new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(isoDate))

const formatBoardDate = (isoDate: string) =>
  new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' }).format(new Date(isoDate))

const getMonday = (reference: Date) => {
  const date = new Date(reference)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  date.setHours(0, 0, 0, 0)
  return date
}

const createDefaultBoard = (): SportBoardDay[] => {
  const start = getMonday(new Date())
  return DAY_LABELS.map(({ label }, index) => {
    const current = new Date(start)
    current.setDate(start.getDate() + index)
    return {
      id: `sport-board-${index}`,
      label,
      dateISO: current.toISOString().split('T')[0],
      activity: DEFAULT_BOARD_ACTIVITIES[index % DEFAULT_BOARD_ACTIVITIES.length],
      done: false,
    }
  })
}

const computeWeekRange = (board: SportBoardDay[]) => {
  if (!Array.isArray(board) || board.length === 0) {
    return ''
  }

  const formatter = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' })
  const first = formatter.format(new Date(board[0].dateISO))
  const last = formatter.format(new Date(board[board.length - 1].dateISO))
  return `${first} → ${last}`
}

const SportPage = () => {
  const [board, setBoard] = usePersistentState<SportBoardDay[]>(SPORT_BOARD_STORAGE_KEY, createDefaultBoard)
  const [goalView, setGoalView] = useState<'all' | 'status'>('all')
  const [goalStatusFilter, setGoalStatusFilter] = useState<SportGoalStatus>('in-progress')

  useEffect(() => {
    document.body.classList.add('planner-page--white')
    return () => {
      document.body.classList.remove('planner-page--white')
    }
  }, [])

  useEffect(() => {
    if (!Array.isArray(board) || board.length !== DAY_LABELS.length) {
      setBoard(createDefaultBoard())
    }
  }, [board, setBoard])

  const filteredGoals = useMemo(() => {
    if (goalView === 'all') {
      return GOAL_CARDS
    }

    return GOAL_CARDS.filter((goal) => goal.status === goalStatusFilter)
  }, [goalView, goalStatusFilter])

  const weekRange = useMemo(() => computeWeekRange(board), [board])

  const handleActivityChange = (dayId: string) => (event: ChangeEvent<HTMLSelectElement>) => {
    const nextActivity = event.target.value as SportBoardActivity
    setBoard((previous) => previous.map((day) => (day.id === dayId ? { ...day, activity: nextActivity } : day)))
  }

  const handleDoneToggle = (dayId: string) => (event: ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target
    setBoard((previous) => previous.map((day) => (day.id === dayId ? { ...day, done: checked } : day)))
  }

  return (
    <div className="sport-page">
      <div className="sport-gallery">
        {GALLERY_IMAGES.map((image) => (
          <figure key={image.id} className="sport-gallery__item">
            <img src={image.src} alt={image.alt} />
          </figure>
        ))}
      </div>

      <header className="sport-header">
        <div>
          <span className="sport-header__eyebrow">Routine active</span>
          <h1>Programme de sport</h1>
        </div>
        <div className="sport-header__divider" aria-hidden="true" />
      </header>

      <section className="sport-spotify" aria-label="Playlist Spotify pour la séance de sport">
        <iframe
          title="Playlist Spotify énergie sport"
          src={spotifyPlaylistUrl}
          width="100%"
          height="232"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      </section>

      <section className="sport-quote" aria-label="Citation motivation">
        <blockquote>
          <p>« La constance est ce qui transforme de petites actions en grandes victoires. »</p>
          <cite>— Adapté de Paramahansa Yogananda</cite>
        </blockquote>
      </section>

      <section className="sport-goals">
        <header className="sport-section-header">
          <div>
            <span className="sport-section-header__eyebrow">Objectifs</span>
            <h2>Goal</h2>
          </div>
          <div className="sport-goals__filters">
            <div className="sport-goals__view-toggle" role="tablist" aria-label="Filtrer les objectifs">
              <button
                type="button"
                role="tab"
                aria-selected={goalView === 'all'}
                className={goalView === 'all' ? 'is-active' : undefined}
                onClick={() => setGoalView('all')}
              >
                All
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={goalView === 'status'}
                className={goalView === 'status' ? 'is-active' : undefined}
                onClick={() => setGoalView('status')}
              >
                Par statut
              </button>
            </div>
            {goalView === 'status' ? (
              <div className="sport-goals__status-filter" role="group" aria-label="Statut de l'objectif">
                {(Object.keys(GOAL_STATUS_LABELS) as SportGoalStatus[]).map((status) => (
                  <button
                    key={status}
                    type="button"
                    className={goalStatusFilter === status ? 'is-active' : undefined}
                    onClick={() => setGoalStatusFilter(status)}
                  >
                    {GOAL_STATUS_LABELS[status]}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </header>

        <div className="sport-goals__grid" data-empty={filteredGoals.length === 0 || undefined}>
          {filteredGoals.length === 0 ? (
            <p className="sport-goals__empty">Aucun objectif pour ce statut pour le moment.</p>
          ) : (
            filteredGoals.map((goal) => (
              <article key={goal.id} className="sport-goal-card">
                <div className="sport-goal-card__media">
                  <img src={goal.coverImage} alt={goal.coverAlt} />
                </div>
                <div className="sport-goal-card__body">
                  <span className={`sport-goal-card__badge sport-goal-card__badge--${goal.status}`}>
                    {GOAL_STATUS_LABELS[goal.status]}
                  </span>
                  <h3>{goal.title}</h3>
                  <p className="sport-goal-card__focus">{goal.focus}</p>
                  <time dateTime={goal.createdAt}>Créé le {formatGoalDate(goal.createdAt)}</time>
                  <div className="sport-goal-card__progress">
                    <div className="sport-goal-card__progress-track" aria-hidden="true">
                      <div
                        className="sport-goal-card__progress-bar"
                        style={{ width: `${goal.progress}%` }}
                        role="presentation"
                      />
                    </div>
                    <span aria-label={`Progression ${goal.progress} pour cent`}>{goal.progress}%</span>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="sport-board">
        <header className="sport-section-header">
          <div>
            <span className="sport-section-header__eyebrow">Organisation</span>
            <h2>Planning de sport</h2>
          </div>
          {weekRange ? <p className="sport-board__range">Semaine du {weekRange}</p> : null}
        </header>

        <div className="sport-board__columns" role="list">
          {board.map((day) => (
            <article key={day.id} className="sport-board-card" role="listitem">
              <header className="sport-board-card__header">
                <div>
                  <h3>{day.label}</h3>
                  <time dateTime={day.dateISO}>{formatBoardDate(day.dateISO)}</time>
                </div>
                <span className={`sport-board-card__status${day.done ? ' is-done' : ''}`}>
                  {day.done ? 'Fait' : 'À planifier'}
                </span>
              </header>
              <label className="sport-board-card__field">
                <span>Séance</span>
                <select value={day.activity} onChange={handleActivityChange(day.id)}>
                  {BOARD_ACTIVITY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="sport-board-card__checkbox">
                <input type="checkbox" checked={day.done} onChange={handleDoneToggle(day.id)} />
                <span>Séance effectuée</span>
              </label>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default SportPage
