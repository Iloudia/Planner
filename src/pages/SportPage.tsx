
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react'
import usePersistentState from '../hooks/usePersistentState'
import planner03 from '../assets/planner-03.jpg'

type SportSessionFocus = 'strength' | 'cardio' | 'core' | 'rest' | 'mobility'

type SportSession = {
  id: string
  day: string
  title: string
  details: string
  durationMinutes: number
  icon: string
  focus: SportSessionFocus
  defaultStatus: 'pending' | 'rest'
}

type SportTodo = {
  id: string
  text: string
  done: boolean
}

type SportState = {
  profileName: string
  programName: string
  motto: string
  level: 'Debutant' | 'Intermediaire' | 'Avance'
  focusAreas: string[]
  startDate: string
  startWeightKg: number
  currentWeightKg: number
  goalWeightKg: number
  heightCm: number
  startWaistCm: number
  waistCm: number
  goalWaistCm: number
  planOverrides: Record<
    string,
    {
      title: string
      details: string
      durationMinutes: number
    }
  >
  completedSessionIds: string[]
  todos: SportTodo[]
  notes: string
  waterLiters: number
}

type SportNumericField =
  | 'startWeightKg'
  | 'currentWeightKg'
  | 'goalWeightKg'
  | 'heightCm'
  | 'startWaistCm'
  | 'waistCm'
  | 'goalWaistCm'

const SPORT_CARD_STORAGE_KEY = 'planner.sportCard'
const PROGRAM_DURATION_WEEKS = 8

const SPORT_WEEK_TEMPLATE: SportSession[] = [
  {
    id: 'sport-mon',
    day: 'Lundi',
    title: 'Full body',
    details: 'Squats, pompes, gainage',
    durationMinutes: 45,
    icon: '\u{1F4AA}',
    focus: 'strength',
    defaultStatus: 'pending',
  },
  {
    id: 'sport-tue',
    day: 'Mardi',
    title: 'Cardio',
    details: 'Course 30 min + etirements',
    durationMinutes: 40,
    icon: '\u{1F3C3}',
    focus: 'cardio',
    defaultStatus: 'pending',
  },
  {
    id: 'sport-wed',
    day: 'Mercredi',
    title: 'Repos',
    details: 'Hydratation et sommeil',
    durationMinutes: 0,
    icon: '\u{1F4A4}',
    focus: 'rest',
    defaultStatus: 'rest',
  },
  {
    id: 'sport-thu',
    day: 'Jeudi',
    title: 'Haut du corps',
    details: 'Tractions, dips, gainage',
    durationMinutes: 50,
    icon: '\u{1F4AA}',
    focus: 'strength',
    defaultStatus: 'pending',
  },
  {
    id: 'sport-fri',
    day: 'Vendredi',
    title: 'Abdos',
    details: 'Circuit 5 exercices',
    durationMinutes: 30,
    icon: '\u{1F525}',
    focus: 'core',
    defaultStatus: 'pending',
  },
  {
    id: 'sport-sat',
    day: 'Samedi',
    title: 'Cardio leger',
    details: 'Velo doux ou marche active',
    durationMinutes: 45,
    icon: '\u{1F6B4}',
    focus: 'cardio',
    defaultStatus: 'pending',
  },
  {
    id: 'sport-sun',
    day: 'Dimanche',
    title: 'Repos actif',
    details: 'Yoga, respiration, stretching',
    durationMinutes: 0,
    icon: '\u{1F9D8}',
    focus: 'mobility',
    defaultStatus: 'rest',
  },
]

const SPORT_NUTRITION_TIPS = [
  'Priorise un repas riche en glucides complexes 2h avant l entrainement.',
  'Planifie une collation proteinee +/- 30g dans les 45 min apres l effort.',
  'Fais le plein de legumes colores pour soutenir la recuperation.',
]

const SPORT_VIDEO_LINKS = [
  { label: 'Routine mobility 10 min', href: 'https://www.youtube.com/watch?v=FzU5j1K0osA' },
  { label: 'HIIT cardio express', href: 'https://www.youtube.com/watch?v=ml6cT4AZdqI' },
  { label: 'Seance yoga recovery', href: 'https://www.youtube.com/watch?v=4pKly2JojMw' },
]

const SPORT_WEEKLY_INSIGHTS = [
  { id: 'week-1', label: 'S1', percent: 45 },
  { id: 'week-2', label: 'S2', percent: 62 },
  { id: 'week-3', label: 'S3', percent: 70 },
  { id: 'week-4', label: 'S4', percent: 80 },
]

const createDefaultSportState = (): SportState => ({
  profileName: 'Alex',
  programName: 'Programme Fit 2025',
  motto: 'Chaque jour compte !',
  level: 'Intermediaire',
  focusAreas: ['Perte de poids', 'Endurance', 'Bien-etre'],
  startDate: '2025-01-06',
  startWeightKg: 72,
  currentWeightKg: 70,
  goalWeightKg: 65,
  heightCm: 168,
  startWaistCm: 82,
  waistCm: 80,
  goalWaistCm: 74,
  planOverrides: {},
  completedSessionIds: [],
  todos: [
    { id: 'todo-1', text: 'Echauffement articulaire 5 min', done: false },
    { id: 'todo-2', text: 'Planche 45 sec x3', done: false },
    { id: 'todo-3', text: 'Etirements profonds', done: false },
  ],
  notes: '',
  waterLiters: 1.5,
})

const SportPage = () => {
  const [sportState, setSportState] = usePersistentState<SportState>(
    SPORT_CARD_STORAGE_KEY,
    createDefaultSportState,
  )
  const [todoDraft, setTodoDraft] = useState('')
  const [focusDraft, setFocusDraft] = useState('')
  const [planEditorId, setPlanEditorId] = useState(() => SPORT_WEEK_TEMPLATE[0]?.id ?? '')
  const [timerPreset, setTimerPreset] = useState(45)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)

  const sportSchedule = SPORT_WEEK_TEMPLATE

  useEffect(() => {
    if (!sportState.planOverrides) {
      setSportState((previous) => ({
        ...previous,
        planOverrides: {},
      }))
    }
  }, [sportState.planOverrides, setSportState])

  useEffect(() => {
    if (!timerRunning || typeof window === 'undefined') {
      return
    }

    const intervalId = window.setInterval(() => {
      setTimerSeconds((previous) => {
        if (previous <= 1) {
          setTimerRunning(false)
          return 0
        }
        return previous - 1
      })
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [timerRunning])

  useEffect(() => {
    document.body.classList.add('planner-page--white')
    return () => {
      document.body.classList.remove('planner-page--white')
    }
  }, [])

  const personalisedSchedule = useMemo(
    () =>
      sportSchedule.map((session) => {
        const override = sportState.planOverrides[session.id]
        if (!override) {
          return session
        }
        return {
          ...session,
          title: override.title,
          details: override.details,
          durationMinutes: override.durationMinutes,
        }
      }),
    [sportSchedule, sportState.planOverrides],
  )

  useEffect(() => {
    if (planEditorId && personalisedSchedule.some((session) => session.id === planEditorId)) {
      return
    }
    setPlanEditorId(personalisedSchedule[0]?.id ?? '')
  }, [personalisedSchedule, planEditorId])

  const selectedEditorSession = useMemo(
    () =>
      personalisedSchedule.find((session) => session.id === planEditorId) ??
      personalisedSchedule[0] ??
      null,
    [personalisedSchedule, planEditorId],
  )

  const completedSessionIdsSet = useMemo(
    () => new Set(sportState.completedSessionIds),
    [sportState.completedSessionIds],
  )

  const activeSessions = useMemo(
    () => personalisedSchedule.filter((session) => session.defaultStatus !== 'rest'),
    [personalisedSchedule],
  )

  const completedSessionsCount = useMemo(
    () =>
      activeSessions.reduce(
        (total, session) => (completedSessionIdsSet.has(session.id) ? total + 1 : total),
        0,
      ),
    [activeSessions, completedSessionIdsSet],
  )

  const trainingMinutesGoal = useMemo(
    () =>
      personalisedSchedule.reduce(
        (total, session) =>
          session.defaultStatus === 'rest' ? total : total + session.durationMinutes,
        0,
      ),
    [personalisedSchedule],
  )

  const trainingMinutesDone = useMemo(
    () =>
      personalisedSchedule.reduce(
        (total, session) =>
          completedSessionIdsSet.has(session.id) ? total + session.durationMinutes : total,
        0,
      ),
    [personalisedSchedule, completedSessionIdsSet],
  )

  const weeklyProgressPercent = useMemo(() => {
    if (activeSessions.length === 0) {
      return 0
    }
    return Math.round((completedSessionsCount / activeSessions.length) * 100)
  }, [activeSessions, completedSessionsCount])

  const trainingMinutesPercent = useMemo(() => {
    if (trainingMinutesGoal === 0) {
      return 0
    }
    return Math.round((trainingMinutesDone / trainingMinutesGoal) * 100)
  }, [trainingMinutesDone, trainingMinutesGoal])

  const hydrationTargetLiters = useMemo(
    () => Number((sportState.currentWeightKg * 0.035).toFixed(2)),
    [sportState.currentWeightKg],
  )

  const hydrationRemainingLiters = useMemo(
    () => Math.max(hydrationTargetLiters - sportState.waterLiters, 0),
    [hydrationTargetLiters, sportState.waterLiters],
  )

  const hydrationProgress = useMemo(() => {
    if (hydrationTargetLiters <= 0) {
      return 0
    }
    return Math.min(sportState.waterLiters / hydrationTargetLiters, 1)
  }, [hydrationTargetLiters, sportState.waterLiters])

  const bmi = useMemo(() => {
    if (sportState.heightCm <= 0) {
      return 0
    }
    const meters = sportState.heightCm / 100
    return sportState.currentWeightKg / (meters * meters)
  }, [sportState.currentWeightKg, sportState.heightCm])

  const bmiRounded = useMemo(() => Math.round(bmi * 10) / 10, [bmi])

  const bmiStatus = useMemo(() => {
    if (bmi === 0) {
      return 'A ajuster'
    }
    if (bmi < 18.5) {
      return 'Fin'
    }
    if (bmi < 25) {
      return 'Equilibre'
    }
    if (bmi < 30) {
      return 'A surveiller'
    }
    return 'Objectif prioritaire'
  }, [bmi])

  const weightProgressPercent = useMemo(() => {
    const delta = sportState.startWeightKg - sportState.goalWeightKg
    if (delta <= 0) {
      return 0
    }
    const progress = sportState.startWeightKg - sportState.currentWeightKg
    return Math.max(0, Math.min(100, Math.round((progress / delta) * 100)))
  }, [sportState.startWeightKg, sportState.goalWeightKg, sportState.currentWeightKg])

  const waistProgressPercent = useMemo(() => {
    const delta = sportState.startWaistCm - sportState.goalWaistCm
    if (delta <= 0) {
      return 0
    }
    const progress = sportState.startWaistCm - sportState.waistCm
    return Math.max(0, Math.min(100, Math.round((progress / delta) * 100)))
  }, [sportState.startWaistCm, sportState.goalWaistCm, sportState.waistCm])

  const weeklyInsights = useMemo(
    () =>
      SPORT_WEEKLY_INSIGHTS.map((insight, index) =>
        index === SPORT_WEEKLY_INSIGHTS.length - 1
          ? { ...insight, percent: weeklyProgressPercent }
          : insight,
      ),
    [weeklyProgressPercent],
  )

  const nextSession = useMemo(
    () =>
      personalisedSchedule.find(
        (session) => session.defaultStatus !== 'rest' && !completedSessionIdsSet.has(session.id),
      ),
    [personalisedSchedule, completedSessionIdsSet],
  )

  const timerMinutesLabel = String(Math.floor(timerSeconds / 60)).padStart(2, '0')
  const timerSecondsLabel = String(timerSeconds % 60).padStart(2, '0')
  const handleToggleSession = (sessionId: string) => {
    const session = personalisedSchedule.find((item) => item.id === sessionId)
    if (!session || session.defaultStatus === 'rest') {
      return
    }
    setSportState((previous) => {
      const exists = previous.completedSessionIds.includes(sessionId)
      const completedSessionIds = exists
        ? previous.completedSessionIds.filter((id) => id !== sessionId)
        : [...previous.completedSessionIds, sessionId]
      return {
        ...previous,
        completedSessionIds,
      }
    })
  }

  const handleSessionOverride = (
    sessionId: string,
    partial: Partial<{ title: string; details: string; durationMinutes: number }>,
  ) => {
    const baseSession = sportSchedule.find((session) => session.id === sessionId)
    if (!baseSession) {
      return
    }
    setSportState((previous) => {
      const overrides = previous.planOverrides ?? {}
      const currentOverride = overrides[sessionId] ?? {
        title: baseSession.title,
        details: baseSession.details,
        durationMinutes: baseSession.durationMinutes,
      }
      const next = {
        title: partial.title ?? currentOverride.title,
        details: partial.details ?? currentOverride.details,
        durationMinutes: partial.durationMinutes ?? currentOverride.durationMinutes,
      }
      if (
        next.title === baseSession.title &&
        next.details === baseSession.details &&
        next.durationMinutes === baseSession.durationMinutes
      ) {
        const { [sessionId]: _removed, ...rest } = overrides
        return {
          ...previous,
          planOverrides: rest,
        }
      }
      return {
        ...previous,
        planOverrides: {
          ...overrides,
          [sessionId]: next,
        },
      }
    })
  }

  const handleNumericChange =
    (field: SportNumericField) => (event: ChangeEvent<HTMLInputElement>) => {
      const raw = event.target.value
      const value = Number.parseFloat(raw)
      setSportState((previous) => ({
        ...previous,
        [field]: Number.isNaN(value) ? previous[field] : value,
      }))
    }

  const handleDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSportState((previous) => ({
      ...previous,
      startDate: event.target.value,
    }))
  }

  const handleProfileFieldChange =
    (field: 'profileName' | 'programName' | 'motto') =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setSportState((previous) => ({
        ...previous,
        [field]: event.target.value,
      }))
    }

  const handleAddFocusArea = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = focusDraft.trim()
    if (value.length === 0) {
      return
    }
    setSportState((previous) => ({
      ...previous,
      focusAreas: previous.focusAreas.includes(value)
        ? previous.focusAreas
        : [...previous.focusAreas, value],
    }))
    setFocusDraft('')
  }

  const handleRemoveFocusArea = (value: string) => {
    setSportState((previous) => ({
      ...previous,
      focusAreas: previous.focusAreas.filter((item) => item !== value),
    }))
  }

  const handleAdjustWater = (delta: number) => {
    setSportState((previous) => {
      const nextValue = Math.max(0, Math.round((previous.waterLiters + delta) * 100) / 100)
      return {
        ...previous,
        waterLiters: nextValue,
      }
    })
  }

  const handleResetWater = () => {
    setSportState((previous) => ({
      ...previous,
      waterLiters: 0,
    }))
  }

  const handleAddTodo = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = todoDraft.trim()
    if (value.length === 0) {
      return
    }
    setSportState((previous) => ({
      ...previous,
      todos: [...previous.todos, { id: `todo-${Date.now()}`, text: value, done: false }],
    }))
    setTodoDraft('')
  }

  const handleToggleTodo = (todoId: string) => {
    setSportState((previous) => ({
      ...previous,
      todos: previous.todos.map((todo) =>
        todo.id === todoId ? { ...todo, done: !todo.done } : todo,
      ),
    }))
  }

  const handleRemoveTodo = (todoId: string) => {
    setSportState((previous) => ({
      ...previous,
      todos: previous.todos.filter((todo) => todo.id !== todoId),
    }))
  }

  const handleNotesChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setSportState((previous) => ({
      ...previous,
      notes: event.target.value,
    }))
  }

  const handleTimerStart = () => {
    if (timerRunning || timerPreset <= 0) {
      return
    }
    setTimerSeconds(timerPreset)
    setTimerRunning(true)
  }

  const handleTimerStop = () => {
    setTimerRunning(false)
    setTimerSeconds(0)
  }

  const handleTimerPresetChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = Number.parseInt(event.target.value, 10)
    setTimerPreset(Number.isNaN(value) ? timerPreset : value)
  }

  const handlePlanEditorChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setPlanEditorId(event.target.value)
  }

  const handleLevelChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as SportState['level']
    if (value === 'Debutant' || value === 'Intermediaire' || value === 'Avance') {
      setSportState((previous) => ({
        ...previous,
        level: value,
      }))
    }
  }

  const focusAccent = (focus: SportSessionFocus) => {
    switch (focus) {
      case 'strength':
        return '#f97316'
      case 'cardio':
        return '#0ea5e9'
      case 'core':
        return '#6366f1'
      case 'mobility':
        return '#4ade80'
      case 'rest':
      default:
        return '#94a3b8'
    }
  }

  const statusIconForSession = (session: SportSession) => {
    if (session.defaultStatus === 'rest') {
      return { icon: session.icon, label: 'Repos' }
    }
    if (completedSessionIdsSet.has(session.id)) {
      return { icon: '?', label: 'Termine' }
    }
    return { icon: '?', label: 'A faire' }
  }

  const hydrationTargetLabel = hydrationTargetLiters.toFixed(2)
  const waterLitersLabel = sportState.waterLiters.toFixed(2)
  const hydrationRemainingLabel = hydrationRemainingLiters.toFixed(2)

  const startDateLabel = useMemo(() => {
    if (!sportState.startDate) {
      return 'A definir'
    }
    const value = new Date(sportState.startDate)
    if (Number.isNaN(value.getTime())) {
      return 'A definir'
    }
    return value.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }, [sportState.startDate])

  const endDateLabel = useMemo(() => {
    if (!sportState.startDate) {
      return 'A definir'
    }
    const start = new Date(sportState.startDate)
    if (Number.isNaN(start.getTime())) {
      return 'A definir'
    }
    const end = new Date(start)
    end.setDate(start.getDate() + PROGRAM_DURATION_WEEKS * 7)
    return end.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }, [sportState.startDate])

  const trainingHours = Math.floor(trainingMinutesDone / 60)
  const trainingMinutesRemainder = trainingMinutesDone % 60
  return (
    <div className="sport-page">
      <section className="sport-card" aria-labelledby="sport-card-title">
        <header className="sport-card__header">
          <div className="sport-card__header-info">
            <h1 id="sport-card-title">{sportState.programName || 'Programme sport'}</h1>
            <p className="sport-card__badge">Programme sport</p>
            <label className="sport-card__field">
              <span>Nom du programme</span>
              <input
                type="text"
                value={sportState.programName}
                onChange={handleProfileFieldChange('programName')}
              />
            </label>
            <label className="sport-card__field">
              <span>Phrase motivation</span>
              <input
                type="text"
                value={sportState.motto}
                onChange={handleProfileFieldChange('motto')}
              />
            </label>
            <div className="sport-card__meta">
              <label className="sport-card__inline-field">
                <span>Ton pseudo</span>
                <input
                  type="text"
                  value={sportState.profileName}
                  onChange={handleProfileFieldChange('profileName')}
                />
              </label>
              <label className="sport-card__inline-field">
                <span>Niveau</span>
                <select value={sportState.level} onChange={handleLevelChange}>
                  <option value="Debutant">Debutant</option>
                  <option value="Intermediaire">Intermediaire</option>
                  <option value="Avance">Avance</option>
                </select>
              </label>
              <div className="sport-card__inline-field">
                <span>Duree</span>
                <strong>{PROGRAM_DURATION_WEEKS} semaines</strong>
              </div>
              <div className="sport-card__inline-field">
                <span>Prochaine seance</span>
                <strong>
                  {nextSession
                    ? `${nextSession.day} - ${nextSession.title}`
                    : 'Toutes les seances sont cochees'}
                </strong>
              </div>
            </div>
          </div>
          <div className="sport-card__banner">
            <img src={planner03} alt="Banniere motivation sport" />
            <div className="sport-card__dates">
              <span>Debut&nbsp;: {startDateLabel}</span>
              <span>Fin&nbsp;: {endDateLabel}</span>
            </div>
          </div>
        </header>

        <section className="sport-card__section" aria-labelledby="sport-profile-title">
          <div className="sport-card__section-header">
            <h1 id="sport-profile-title">Profil et objectifs</h1>
            <p>Garde une vision claire de tes mesures pour voir le chemin parcouru.</p>
          </div>
          <div className="sport-profile">
            <div className="sport-profile__grid">
              <label className="sport-profile__field">
                <span>Poids de depart (kg)</span>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={sportState.startWeightKg}
                  onChange={handleNumericChange('startWeightKg')}
                />
              </label>
              <label className="sport-profile__field">
                <span>Poids actuel (kg)</span>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={sportState.currentWeightKg}
                  onChange={handleNumericChange('currentWeightKg')}
                />
              </label>
              <label className="sport-profile__field">
                <span>Poids vise (kg)</span>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={sportState.goalWeightKg}
                  onChange={handleNumericChange('goalWeightKg')}
                />
              </label>
              <label className="sport-profile__field">
                <span>Taille (cm)</span>
                <input
                  type="number"
                  min="120"
                  step="1"
                  value={sportState.heightCm}
                  onChange={handleNumericChange('heightCm')}
                />
              </label>
              <label className="sport-profile__field">
                <span>Tour de taille depart (cm)</span>
                <input
                  type="number"
                  min="40"
                  step="0.5"
                  value={sportState.startWaistCm}
                  onChange={handleNumericChange('startWaistCm')}
                />
              </label>
              <label className="sport-profile__field">
                <span>Tour de taille actuel (cm)</span>
                <input
                  type="number"
                  min="40"
                  step="0.5"
                  value={sportState.waistCm}
                  onChange={handleNumericChange('waistCm')}
                />
              </label>
              <label className="sport-profile__field">
                <span>Tour de taille vise (cm)</span>
                <input
                  type="number"
                  min="40"
                  step="0.5"
                  value={sportState.goalWaistCm}
                  onChange={handleNumericChange('goalWaistCm')}
                />
              </label>
              <label className="sport-profile__field">
                <span>Date de debut</span>
                <input type="date" value={sportState.startDate} onChange={handleDateChange} />
              </label>
            </div>
            <div className="sport-profile__metrics">
              <div className="sport-profile__metric">
                <span>Progression poids</span>
                <div className="sport-profile__bar">
                  <div style={{ width: `${weightProgressPercent}%` }} />
                </div>
                <strong>{weightProgressPercent}%</strong>
              </div>
              <div className="sport-profile__metric">
                <span>Tour de taille</span>
                <div className="sport-profile__bar">
                  <div style={{ width: `${waistProgressPercent}%` }} />
                </div>
                <strong>{waistProgressPercent}%</strong>
              </div>
              <div className="sport-profile__metric">
                <span>IMC actuel</span>
                <strong>{bmiRounded.toFixed(1)}</strong>
                <em>{bmiStatus}</em>
              </div>
            </div>
            <div className="sport-profile__focus">
              <h2>Focus du programme</h2>
              <div className="sport-profile__chips">
                {sportState.focusAreas.map((area) => (
                  <button
                    type="button"
                    key={area}
                    className="sport-profile__chip"
                    onClick={() => handleRemoveFocusArea(area)}
                  >
                    <span>{area}</span>
                    <span aria-hidden="true">{'\u00d7'}</span>
                  </button>
                ))}
                {sportState.focusAreas.length === 0 ? (
                  <span className="sport-profile__chip sport-profile__chip--ghost">
                    Ajoute ton premier objectif
                  </span>
                ) : null}
              </div>
              <form className="sport-profile__focus-form" onSubmit={handleAddFocusArea}>
                <input
                  type="text"
                  placeholder="Ex. Mobilite, sommeil, energie"
                  value={focusDraft}
                  onChange={(event) => setFocusDraft(event.target.value)}
                />
                <button type="submit">Ajouter</button>
              </form>
            </div>
          </div>
        </section>

        <section className="sport-card__section" aria-labelledby="sport-schedule-title">
          <div className="sport-card__section-header">
            <h2 id="sport-schedule-title">Planning hebdomadaire</h2>
            <p>Coche tes seances et ajuste ton programme en fonction de la semaine.</p>
          </div>
          <div className="sport-schedule">
            <table className="sport-schedule__table">
              <thead>
                <tr>
                  <th scope="col">Jour</th>
                  <th scope="col">Seance</th>
                  <th scope="col">Duree</th>
                  <th scope="col">Statut</th>
                </tr>
              </thead>
              <tbody>
                {personalisedSchedule.map((session) => {
                  const status = statusIconForSession(session)
                  const isCompleted = completedSessionIdsSet.has(session.id)
                  return (
                    <tr key={session.id} style={{ borderLeftColor: focusAccent(session.focus) }}>
                      <th scope="row">
                        <div className="sport-schedule__day">
                          <span aria-hidden="true" className="sport-schedule__emoji">
                            {session.icon}
                          </span>
                          <span>{session.day}</span>
                        </div>
                      </th>
                      <td>
                        <div className="sport-schedule__session">
                          <strong>{session.title}</strong>
                          <p>{session.details}</p>
                        </div>
                      </td>
                      <td>{session.durationMinutes > 0 ? `${session.durationMinutes} min` : '-'}</td>
                      <td>
                        <div className="sport-schedule__status">
                          <span aria-hidden="true">{status.icon}</span>
                          <span>{status.label}</span>
                        </div>
                        {session.defaultStatus !== 'rest' ? (
                          <label className="sport-schedule__checkbox">
                            <input
                              type="checkbox"
                              checked={isCompleted}
                              onChange={() => handleToggleSession(session.id)}
                            />
                            <span>Termine</span>
                          </label>
                        ) : (
                          <span className="sport-schedule__rest">Recuperation</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <div className="sport-schedule__editor">
              <h3>Personnalise ta semaine</h3>
              <div className="sport-schedule__editor-grid">
                <label>
                  <span>Jour</span>
                  <select value={planEditorId} onChange={handlePlanEditorChange}>
                    {personalisedSchedule.map((session) => (
                      <option key={session.id} value={session.id}>
                        {session.day}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Intitule</span>
                  <input
                    type="text"
                    value={selectedEditorSession?.title ?? ''}
                    onChange={(event) =>
                      handleSessionOverride(planEditorId, { title: event.target.value })
                    }
                    disabled={!selectedEditorSession}
                  />
                </label>
                <label className="sport-schedule__editor-details">
                  <span>Details</span>
                  <textarea
                    rows={2}
                    value={selectedEditorSession?.details ?? ''}
                    onChange={(event) =>
                      handleSessionOverride(planEditorId, { details: event.target.value })
                    }
                    disabled={!selectedEditorSession}
                  />
                </label>
                <label>
                  <span>Duree (min)</span>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={selectedEditorSession?.durationMinutes ?? 0}
                    onChange={(event) => {
                      const raw = Number.parseInt(event.target.value, 10)
                      handleSessionOverride(planEditorId, {
                        durationMinutes: Number.isNaN(raw) ? 0 : raw,
                      })
                    }}
                    disabled={!selectedEditorSession}
                  />
                </label>
              </div>
            </div>
          </div>
        </section>

        <section className="sport-card__section" aria-labelledby="sport-hydration-title">
          <div className="sport-card__section-header">
            <h2 id="sport-hydration-title">Hydratation et nutrition</h2>
            <p>Alimente ton energie et suis ton quota d eau au quotidien.</p>
          </div>
          <div className="sport-hydration">
            <div className="sport-hydration__tracker">
              <div className="sport-hydration__intro">
                <span role="img" aria-label="goutte d eau">
                  ??
                </span>
                <p>Boire environ 35 ml par kg de poids corporel chaque jour.</p>
              </div>
              <div className="sport-hydration__inputs">
                <label>
                  <span>Poids actuel (kg)</span>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={sportState.currentWeightKg}
                    onChange={handleNumericChange('currentWeightKg')}
                  />
                </label>
                <label>
                  <span>Poids vise (kg)</span>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={sportState.goalWeightKg}
                    onChange={handleNumericChange('goalWeightKg')}
                  />
                </label>
                <label>
                  <span>Objectif eau (L)</span>
                  <strong>{hydrationTargetLabel}</strong>
                </label>
              </div>
              <div className="sport-hydration__bar">
                <div style={{ width: `${Math.round(hydrationProgress * 100)}%` }} />
              </div>
              <p className="sport-hydration__summary">
                {waterLitersLabel} L bus - Reste {hydrationRemainingLabel} L pour l objectif du jour
              </p>
              <div className="sport-hydration__actions">
                <button type="button" onClick={() => handleAdjustWater(0.25)}>
                  +0.25 L
                </button>
                <button
                  type="button"
                  onClick={() => handleAdjustWater(-0.25)}
                  disabled={sportState.waterLiters <= 0}
                >
                  -0.25 L
                </button>
                <button type="button" onClick={handleResetWater}>
                  Reset
                </button>
              </div>
            </div>
            <div className="sport-nutrition">
              <h3>Idees nutrition</h3>
              <ul>
                {SPORT_NUTRITION_TIPS.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
              <div className="sport-nutrition__cards">
                <article>
                  <h4>Repas pre-training</h4>
                  <p>Flocons d avoine + banane + beurre de cacahuete.</p>
                </article>
                <article>
                  <h4>Recup post-training</h4>
                  <p>Shake proteine + fruit rouge + graines de chia.</p>
                </article>
                <article>
                  <h4>Apport journalier</h4>
                  <p>Maintiens toi entre 1800 et 2000 kcal selon ton energie du jour.</p>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section className="sport-card__section" aria-labelledby="sport-progress-title">
          <div className="sport-card__section-header">
            <h2 id="sport-progress-title">Suivi et progression</h2>
            <p>Observe l evolution de ton cycle semaine apres semaine.</p>
          </div>
          <div className="sport-progress">
            <article className="sport-progress__item">
              <h3>Sessions validees</h3>
              <div className="sport-progress__bar">
                <div style={{ width: `${weeklyProgressPercent}%` }} />
              </div>
              <p>
                {completedSessionsCount} / {activeSessions.length} seances - {weeklyProgressPercent}% du plan
              </p>
            </article>
            <article className="sport-progress__item">
              <h3>Temps total</h3>
              <div className="sport-progress__bar">
                <div style={{ width: `${trainingMinutesPercent}%` }} />
              </div>
              <p>
                {trainingHours} h {trainingMinutesRemainder} min accumules
              </p>
            </article>
            <article className="sport-progress__item sport-progress__item--card">
              <h3>Tableau d evolution</h3>
              <ul className="sport-progress__weeks">
                {weeklyInsights.map((insight) => (
                  <li key={insight.id}>
                    <span>{insight.label}</span>
                    <div>
                      <div style={{ width: `${insight.percent}%` }} />
                    </div>
                    <strong>{insight.percent}%</strong>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        <section className="sport-card__section" aria-labelledby="sport-mindset-title">
          <div className="sport-card__section-header">
            <h2 id="sport-mindset-title">Conseils et motivation</h2>
            <p>Le mindset compte autant que les muscles.</p>
          </div>
          <div className="sport-mindset">
            <article className="sport-mindset__quote">
              <h3>Citation du jour</h3>
              <blockquote>Chaque repetition construit la version plus forte de toi.</blockquote>
            </article>
            <article className="sport-mindset__tip">
              <h3>Astuce sante</h3>
              <p>Dors 7h minimum, hydrate toi des le reveil et garde 10 min d etirements calmes.</p>
            </article>
            <article className="sport-mindset__playlist">
              <h3>Playlist motivation</h3>
              <iframe
                title="Playlist motivation sport"
                src="https://open.spotify.com/embed/playlist/37i9dQZF1DX76Wlfdnj7AP?utm_source=generator"
                width="100%"
                height="152"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
              />
            </article>
            <article className="sport-mindset__links">
              <h3>Videos coup de boost</h3>
              <ul>
                {SPORT_VIDEO_LINKS.map((resource) => (
                  <li key={resource.href}>
                    <a href={resource.href} target="_blank" rel="noreferrer">
                      {resource.label}
                    </a>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        <section className="sport-card__section" aria-labelledby="sport-bonus-title">
          <div className="sport-card__section-header">
            <h2 id="sport-bonus-title">Bonus entrainement</h2>
            <p>Ton espace outils: minuteur, to-do et carnet de bord.</p>
          </div>
          <div className="sport-bonus">
            <article className="sport-bonus__timer">
              <h3>Minuteur express</h3>
              <div className="sport-bonus__timer-display">
                <span>{timerMinutesLabel}</span>
                <span>:</span>
                <span>{timerSecondsLabel}</span>
              </div>
              <div className="sport-bonus__timer-controls">
                <label>
                  <span>Format</span>
                  <select value={timerPreset} onChange={handleTimerPresetChange}>
                    <option value={30}>30 sec</option>
                    <option value={45}>45 sec</option>
                    <option value={60}>60 sec</option>
                    <option value={90}>90 sec</option>
                  </select>
                </label>
                <div className="sport-bonus__timer-actions">
                  <button type="button" onClick={handleTimerStart} disabled={timerRunning}>
                    Demarrer
                  </button>
                  <button type="button" onClick={handleTimerStop} disabled={!timerRunning}>
                    Stop
                  </button>
                </div>
              </div>
            </article>
            <article className="sport-bonus__todo">
              <h3>To-do de seance</h3>
              <form onSubmit={handleAddTodo}>
                <input
                  type="text"
                  placeholder="Ajouter un exercice a cocher"
                  value={todoDraft}
                  onChange={(event) => setTodoDraft(event.target.value)}
                />
                <button type="submit">Ajouter</button>
              </form>
              <ul>
                {sportState.todos.map((todo) => (
                  <li key={todo.id}>
                    <label>
                      <input
                        type="checkbox"
                        checked={todo.done}
                        onChange={() => handleToggleTodo(todo.id)}
                      />
                      <span>{todo.text}</span>
                    </label>
                    <button type="button" onClick={() => handleRemoveTodo(todo.id)}>
                      {'\u00d7'}
                    </button>
                  </li>
                ))}
                {sportState.todos.length === 0 ? (
                  <li className="sport-bonus__todo-empty">
                    Liste vide pour l instant. Ajoute tes exercices du jour.
                  </li>
                ) : null}
              </ul>
            </article>
            <article className="sport-bonus__notes">
              <h3>Journal de bord</h3>
              <textarea
                rows={5}
                placeholder="Note tes sensations, ton energie, tes petites victoires..."
                value={sportState.notes}
                onChange={handleNotesChange}
              />
              <p>Astuce: epingle cette page sur ton mobile pour y acceder partout.</p>
            </article>
          </div>
        </section>
      </section>
    </div>
  )
}

export default SportPage
