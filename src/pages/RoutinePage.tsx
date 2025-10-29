import { useState } from 'react'
import { eveningRoutine, morningRoutine } from '../data/sampleData'

type RoutineId = string

type RoutineState = {
  completed: Set<RoutineId>
}

const RoutinePage = () => {
  const [state, setState] = useState<RoutineState>({ completed: new Set() })

  const toggleRoutine = (id: RoutineId) => {
    setState((previous) => {
      const nextCompleted = new Set(previous.completed)
      if (nextCompleted.has(id)) {
        nextCompleted.delete(id)
      } else {
        nextCompleted.add(id)
      }
      return { completed: nextCompleted }
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
                  checked={state.completed.has(item.id)}
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
                  checked={state.completed.has(item.id)}
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
