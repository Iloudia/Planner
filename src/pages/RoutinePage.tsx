import { useEffect, useMemo } from 'react'
import type { RoutineItem } from '../data/sampleData'
import { eveningRoutine, morningRoutine } from '../data/sampleData'
import usePersistentState from '../hooks/usePersistentState'
import morningIllustration from '../assets/morning-note.svg'
import eveningIllustration from '../assets/evening-note.svg'

type RoutineId = string

const COMPLETED_STORAGE_KEY = 'planner.routines.completed'

type RoutineChecklistProps = {
  items: RoutineItem[]
  completedSet: Set<RoutineId>
  toggleRoutine: (id: RoutineId) => void
}

const RoutineChecklist = ({ items, completedSet, toggleRoutine }: RoutineChecklistProps) => (
  <ul className="routine-note__list">
    {items.map((item, index) => (
      <li className="routine-note__item" key={item.id}>
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
      </li>
    ))}
  </ul>
)

const RoutinePage = () => {
  const [completedIds, setCompletedIds] = usePersistentState<RoutineId[]>(COMPLETED_STORAGE_KEY, () => [])
  const completedSet = useMemo(() => new Set<RoutineId>(completedIds), [completedIds])

  useEffect(() => {
    document.body.classList.add('planner-page--white')
    return () => {
      document.body.classList.remove('planner-page--white')
    }
  }, [])

  const toggleRoutine = (id: RoutineId) => {
    setCompletedIds((previous) => {
      if (previous.includes(id)) {
        return previous.filter((value) => value !== id)
      }
      return [...previous, id]
    })
  }

  const routineStats = [
    { id: 'morning', label: 'Rituels matin', value: morningRoutine.length.toString() },
    { id: 'evening', label: 'Rituels soir', value: eveningRoutine.length.toString() },
    { id: 'checked', label: 'Cases cochees', value: completedSet.size.toString() },
  ]

  return (
    <div className="routine-page aesthetic-page">
      <div className="routine-page__breadcrumb">routine</div>
      <div className="routine-page__accent-bar" aria-hidden="true" />

      <section className="routine-hero dashboard-panel">
        <div className="routine-hero__content">
          <span className="routine-hero__eyebrow">rituels doux</span>
          <h1>Routines du matin et du soir</h1>
          <p>Cree ton equilibre interieur avec des gestes simples repetes chaque jour.</p>
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
            <img className="routine-note__illustration" src={morningIllustration} alt="Illustration douce du lever de soleil" />
          </div>
          <div className="routine-note__body">
            <div className="routine-note__pins">
              <span className="routine-note__pin routine-note__pin--left" />
              <span className="routine-note__pin routine-note__pin--right" />
            </div>
            <RoutineChecklist items={morningRoutine} completedSet={completedSet} toggleRoutine={toggleRoutine} />
          </div>
        </section>

        <section className="routine-note routine-note--evening">
          <div className="routine-note__top">
            <div className="routine-note__title-band">
              <h2>Routine du soir</h2>
            </div>
            <img className="routine-note__illustration" src={eveningIllustration} alt="Illustration apaisante de la nuit" />
          </div>
          <div className="routine-note__body">
            <div className="routine-note__pins">
              <span className="routine-note__pin routine-note__pin--left" />
              <span className="routine-note__pin routine-note__pin--right" />
            </div>
            <RoutineChecklist items={eveningRoutine} completedSet={completedSet} toggleRoutine={toggleRoutine} />
          </div>
        </section>
      </div>

      <div className="routine-page__footer-bar" aria-hidden="true" />
    </div>
  )
}

export default RoutinePage
