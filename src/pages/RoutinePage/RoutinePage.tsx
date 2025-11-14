import type { FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import type { RoutineItem } from '../../data/sampleData'
import { eveningRoutine as defaultEveningRoutine, morningRoutine as defaultMorningRoutine } from '../../data/sampleData'
import usePersistentState from '../../hooks/usePersistentState'
import morningIllustration from '../../assets/morning-note.svg'
import eveningIllustration from '../../assets/evening-note.svg'
import './RoutinePage.css'

type RoutineId = string
type RoutinePeriod = 'morning' | 'evening'
type RoutineDraft = {
  title: string
  detail: string
}

const COMPLETED_STORAGE_KEY = 'planner.routines.completed'
const MORNING_ROUTINE_STORAGE_KEY = 'planner.routines.morning'
const EVENING_ROUTINE_STORAGE_KEY = 'planner.routines.evening'

type RoutineChecklistProps = {
  items: RoutineItem[]
  completedSet: Set<RoutineId>
  toggleRoutine: (id: RoutineId) => void
  onRemoveItem?: (id: RoutineId) => void
  onMoveItem?: (id: RoutineId, direction: 'up' | 'down') => void
}

const RoutineChecklist = ({
  items,
  completedSet,
  toggleRoutine,
  onRemoveItem,
  onMoveItem,
}: RoutineChecklistProps) => (
  <ul className="routine-note__list">
    {items.map((item, index) => (
      <li className="routine-note__item" key={item.id}>
        <div className="routine-note__row">
          <label className="routine-note__label">
            <span className="routine-note__index">{String(index + 1).padStart(2, '0')}</span>
            <input
              className="routine-note__checkbox"
              type="checkbox"
              checked={completedSet.has(item.id)}
              onChange={() => toggleRoutine(item.id)}
            />
            <span className="routine-note__text">
              <span className="routine-note__item-title">{item.title}</span>
              {item.detail && <span className="routine-note__item-detail">{item.detail}</span>}
            </span>
          </label>
          {(onRemoveItem || onMoveItem) && (
            <div className="routine-note__actions">
              {onMoveItem && (
                <>
                  <button
                    type="button"
                    className="routine-note__move"
                    onClick={() => onMoveItem(item.id, 'up')}
                    aria-label={`Monter ${item.title}`}
                    disabled={index === 0}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="routine-note__move"
                    onClick={() => onMoveItem(item.id, 'down')}
                    aria-label={`Descendre ${item.title}`}
                    disabled={index === items.length - 1}
                  >
                    ↓
                  </button>
                </>
              )}
              {onRemoveItem && (
                <button
                  type="button"
                  className="routine-note__remove"
                  onClick={() => onRemoveItem(item.id)}
                  aria-label={`Supprimer ${item.title}`}
                >
                  ×
                </button>
              )}
            </div>
          )}
        </div>
      </li>
    ))}
  </ul>
)

type RoutineComposerProps = {
  draft: RoutineDraft
  onDraftChange: (field: keyof RoutineDraft, value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  buttonLabel: string
  placeholderTitle: string
  placeholderDetail: string
}

const RoutineComposer = ({
  draft,
  onDraftChange,
  onSubmit,
  buttonLabel,
  placeholderTitle,
  placeholderDetail,
}: RoutineComposerProps) => (
  <form className="routine-note__composer" onSubmit={onSubmit}>
    <label>
      <span>Nouvelle action</span>
      <input
        type="text"
        value={draft.title}
        onChange={(event) => onDraftChange('title', event.target.value)}
        placeholder={placeholderTitle}
        required
      />
    </label>
    <label>
      <span>Détail (optionnel)</span>
      <textarea
        value={draft.detail}
        onChange={(event) => onDraftChange('detail', event.target.value)}
        placeholder={placeholderDetail}
        rows={2}
      />
    </label>
    <button type="submit" className="routine-note__composer-submit">
      {buttonLabel}
    </button>
  </form>
)

const RoutinePage = () => {
  const [completedIds, setCompletedIds] = usePersistentState<RoutineId[]>(COMPLETED_STORAGE_KEY, () => [])
  const [morningRoutines, setMorningRoutines] = usePersistentState<RoutineItem[]>(
    MORNING_ROUTINE_STORAGE_KEY,
    () => defaultMorningRoutine,
  )
  const [eveningRoutines, setEveningRoutines] = usePersistentState<RoutineItem[]>(
    EVENING_ROUTINE_STORAGE_KEY,
    () => defaultEveningRoutine,
  )
  const [routineDrafts, setRoutineDrafts] = useState<Record<RoutinePeriod, RoutineDraft>>({
    morning: { title: '', detail: '' },
    evening: { title: '', detail: '' },
  })
  const completedSet = useMemo(() => new Set<RoutineId>(completedIds), [completedIds])

  useEffect(() => {
    document.body.classList.add('planner-page--white')
    return () => {
      document.body.classList.remove('planner-page--white')
    }
  }, [])

  const handleRoutineDraftChange = (period: RoutinePeriod, field: keyof RoutineDraft, value: string) => {
    setRoutineDrafts((previous) => ({
      ...previous,
      [period]: {
        ...previous[period],
        [field]: value,
      },
    }))
  }

  const handleRoutineSubmit = (period: RoutinePeriod) => (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const draft = routineDrafts[period]
    const trimmedTitle = draft.title.trim()
    if (trimmedTitle.length === 0) {
      return
    }
    const trimmedDetail = draft.detail.trim()
    const newItem: RoutineItem = {
      id: `${period}-${Date.now()}`,
      title: trimmedTitle,
      ...(trimmedDetail.length > 0 ? { detail: trimmedDetail } : {}),
    }
    if (period === 'morning') {
      setMorningRoutines((previous) => [...previous, newItem])
    } else {
      setEveningRoutines((previous) => [...previous, newItem])
    }
    setRoutineDrafts((previous) => ({
      ...previous,
      [period]: { title: '', detail: '' },
    }))
  }

  const handleRoutineRemoval = (period: RoutinePeriod, id: RoutineId) => {
    if (period === 'morning') {
      setMorningRoutines((previous) => previous.filter((item) => item.id !== id))
    } else {
      setEveningRoutines((previous) => previous.filter((item) => item.id !== id))
    }
    setCompletedIds((previous) => previous.filter((value) => value !== id))
  }

  const handleRoutineMove = (period: RoutinePeriod, id: RoutineId, direction: 'up' | 'down') => {
    const update = (list: RoutineItem[]) => {
      const index = list.findIndex((item) => item.id === id)
      if (index === -1) {
        return list
      }
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= list.length) {
        return list
      }
      const next = [...list]
      const [moved] = next.splice(index, 1)
      next.splice(targetIndex, 0, moved)
      return next
    }

    if (period === 'morning') {
      setMorningRoutines((previous) => update(previous))
    } else {
      setEveningRoutines((previous) => update(previous))
    }
  }

  const toggleRoutine = (id: RoutineId) => {
    setCompletedIds((previous) => {
      if (previous.includes(id)) {
        return previous.filter((value) => value !== id)
      }
      return [...previous, id]
    })
  }

  const routineStats = [
    { id: 'morning', label: 'Rituels du matin', value: morningRoutines.length.toString() },
    { id: 'evening', label: 'Rituels du soir', value: eveningRoutines.length.toString() },
    { id: 'checked', label: 'Cases cochées', value: completedSet.size.toString() },
  ]

  return (
    <div className="routine-page aesthetic-page">
      <div className="routine-page__breadcrumb">Routine</div>
      <div className="routine-page__accent-bar" aria-hidden="true" />

      <section className="routine-hero dashboard-panel">
        <div className="routine-hero__content">
          <span className="routine-hero__eyebrow">Rituels doux</span>
          <h1>Routines du matin et du soir</h1>
          <p>
            Crée ton équilibre intérieur avec des gestes simples, répétés chaque jour pour te recentrer et te faire du
            bien.
          </p>
          <div className="routine-hero__stats">
            {routineStats.map((stat) => (
              <article key={stat.id}>
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="routine-notes">
        <section className="routine-note routine-note--morning">
          <div className="routine-note__top">
            <div className="routine-note__title-band">
              <h2>Routine du matin</h2>
            </div>
            <img
              className="routine-note__illustration"
              src={morningIllustration}
              alt="Illustration douce du lever de soleil"
            />
          </div>
          <div className="routine-note__body">
            <div className="routine-note__pins">
              <span className="routine-note__pin routine-note__pin--left" />
              <span className="routine-note__pin routine-note__pin--right" />
            </div>
            <RoutineChecklist
              items={morningRoutines}
              completedSet={completedSet}
              toggleRoutine={toggleRoutine}
              onRemoveItem={(id) => handleRoutineRemoval('morning', id)}
              onMoveItem={(id, direction) => handleRoutineMove('morning', id, direction)}
            />
            <RoutineComposer
              draft={routineDrafts.morning}
              onDraftChange={(field, value) => handleRoutineDraftChange('morning', field, value)}
              onSubmit={handleRoutineSubmit('morning')}
              buttonLabel="Ajouter à ma routine du matin"
              placeholderTitle="Ex : Boire un verre d'eau tiède citronné"
              placeholderDetail="Détaille si besoin (durée, intention, mantra...)"
            />
          </div>
        </section>

        <section className="routine-note routine-note--evening">
          <div className="routine-note__top">
            <div className="routine-note__title-band">
              <h2>Routine du soir</h2>
            </div>
            <img
              className="routine-note__illustration"
              src={eveningIllustration}
              alt="Illustration apaisante de la nuit"
            />
          </div>
          <div className="routine-note__body">
            <div className="routine-note__pins">
              <span className="routine-note__pin routine-note__pin--left" />
              <span className="routine-note__pin routine-note__pin--right" />
            </div>
            <RoutineChecklist
              items={eveningRoutines}
              completedSet={completedSet}
              toggleRoutine={toggleRoutine}
              onRemoveItem={(id) => handleRoutineRemoval('evening', id)}
              onMoveItem={(id, direction) => handleRoutineMove('evening', id, direction)}
            />
            <RoutineComposer
              draft={routineDrafts.evening}
              onDraftChange={(field, value) => handleRoutineDraftChange('evening', field, value)}
              onSubmit={handleRoutineSubmit('evening')}
              buttonLabel="Ajouter à ma routine du soir"
              placeholderTitle="Ex : Préparer mes vêtements pour demain"
              placeholderDetail="Note ce que tu veux te rappeler ou ressentir"
            />
          </div>
        </section>
      </div>

      <div className="routine-page__footer-bar" aria-hidden="true" />
    </div>
  )
}

export default RoutinePage
