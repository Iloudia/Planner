import { useMemo } from 'react'
import { eveningRoutine, morningRoutine } from '../data/sampleData'
import usePersistentState from '../hooks/usePersistentState'

type RoutineId = string

const COMPLETED_STORAGE_KEY = 'planner.routines.completed'

const RoutinePage = () => {
  const [completedIds, setCompletedIds] = usePersistentState<RoutineId[]>(COMPLETED_STORAGE_KEY, () => [])
  const completedSet = useMemo(() => new Set<RoutineId>(completedIds), [completedIds])

  const toggleRoutine = (id: RoutineId) => {
    setCompletedIds((previous) => {
      if (previous.includes(id)) {
        return previous.filter((value) => value !== id)
      }
      return [...previous, id]
    })
  }

  return (
    <div className="routine-page">
      <header className="routine-header">
        <h1>Routines du matin et du soir</h1>
        <p>Stabilise ton energie en suivant tes micro-rituels quotidiens.</p>
      </header>

      <section className="routine-section">
        <h2>Routine du matin</h2>
        <ul>
          {morningRoutine.map((item) => (
            <li key={item.id}>
              <label>
                <input
                  type="checkbox"
                  checked={completedSet.has(item.id)}
                  onChange={() => toggleRoutine(item.id)}
                />
                <span>{item.title}</span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section className="routine-section">
        <h2>Routine du soir</h2>
        <ul>
          {eveningRoutine.map((item) => (
            <li key={item.id}>
              <label>
                <input
                  type="checkbox"
                  checked={completedSet.has(item.id)}
                  onChange={() => toggleRoutine(item.id)}
                />
                <span>{item.title}</span>
              </label>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export default RoutinePage
