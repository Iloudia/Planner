import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { getDateKey, scheduledTasks } from '../data/sampleData'
import type { ScheduledTask } from '../data/sampleData'

const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const newTaskColors = ['#A5B4FC', '#7DD3FC', '#FBCFE8', '#BBF7D0', '#FDE68A']

const formatMonthTitle = (date: Date) => {
  const formatter = new Intl.DateTimeFormat('fr-FR', {
    month: 'long',
    year: 'numeric',
  })
  const label = formatter.format(date)
  return label.charAt(0).toUpperCase() + label.slice(1)
}

const withAlpha = (hexColor: string, alpha: number) => {
  const parsed = hexColor.replace('#', '')
  const bigint = parseInt(parsed, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const CalendarPage = () => {
  const [tasks, setTasks] = useState<ScheduledTask[]>(scheduledTasks)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState({
    start: '',
    end: '',
    color: '#000000',
  })

  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const firstDay = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const offset = (firstDay.getDay() + 6) % 7
  const totalCells = Math.ceil((offset + daysInMonth) / 7) * 7

  const tasksByDate = useMemo(() => {
    const map = new Map<string, ScheduledTask[]>()
    tasks.forEach((task) => {
      const list = map.get(task.date) ?? []
      list.push(task)
      map.set(task.date, list)
    })

    map.forEach((list, key) => {
      list.sort((a, b) => a.start.localeCompare(b.start))
      map.set(key, list)
    })

    return map
  }, [tasks])

  const handleEditClick = (taskId: string) => {
    const task = tasks.find((item) => item.id === taskId)
    if (!task) {
      return
    }

    setEditingTaskId(taskId)
    setEditDraft({
      start: task.start,
      end: task.end,
      color: task.color,
    })
  }

  const handleCancelEdit = () => {
    setEditingTaskId(null)
  }

  const handleDraftChange = (field: 'start' | 'end' | 'color', value: string) => {
    setEditDraft((previous) => ({
      ...previous,
      [field]: value,
    }))
  }

  const handleSubmitEdit = (event: FormEvent<HTMLFormElement>, taskId: string) => {
    event.preventDefault()
    setTasks((previous) =>
      previous.map((task) =>
        task.id === taskId
          ? {
              ...task,
              start: editDraft.start,
              end: editDraft.end,
              color: editDraft.color,
            }
          : task,
      ),
    )
    setEditingTaskId(null)
  }

  const handleAddTask = (dateKey: string) => {
    const title = window.prompt('Titre de la tache ?')
    if (!title || title.trim().length === 0) {
      return
    }

    const start = window.prompt('Heure de debut (HH:MM)', '09:00') ?? '09:00'
    const end = window.prompt('Heure de fin (HH:MM)', '10:00') ?? '10:00'
    const color = newTaskColors[Math.floor(Math.random() * newTaskColors.length)] ?? '#A5B4FC'

    const nextTask: ScheduledTask = {
      id: `task-${Date.now()}`,
      title: title.trim(),
      start: start.trim().length > 0 ? start : '09:00',
      end: end.trim().length > 0 ? end : '10:00',
      date: dateKey,
      color,
      tag: 'Perso',
    }

    setTasks((previous) => [...previous, nextTask])
  }

  const cells = useMemo(() => {
    return Array.from({ length: totalCells }, (_, index) => {
      const dayNumber = index - offset + 1
      if (dayNumber < 1 || dayNumber > daysInMonth) {
        return { key: `empty-${index}`, day: null as number | null, dateKey: null, tasks: [], isToday: false }
      }

      const currentDate = new Date(year, month, dayNumber)
      const dateKey = getDateKey(currentDate)
      return {
        key: dateKey,
        dateKey,
        day: dayNumber,
        tasks: tasksByDate.get(dateKey) ?? [],
        isToday:
          dayNumber === today.getDate() &&
          month === today.getMonth() &&
          year === today.getFullYear(),
      }
    })
  }, [daysInMonth, month, offset, tasksByDate, today, totalCells, year])

  const totalScheduled = tasks.length

  return (
    <div className="calendar-page">
      <header className="calendar-header">
        <div>
          <h1 className="calendar-month">{formatMonthTitle(today)}</h1>
          <p className="calendar-subtitle">
            Visualise tes engagements. {totalScheduled} creneaux deja poses.
          </p>
        </div>
      </header>

      <div className="calendar-grid">
        {weekDays.map((label) => (
          <div key={label} className="calendar-grid__weekday">
            {label}
          </div>
        ))}

        {cells.map((cell) =>
          cell.day === null || cell.dateKey === null ? (
            <div key={cell.key} className="calendar-day calendar-day--empty" />
          ) : (
            <div
              key={cell.key}
              className={`calendar-day${cell.isToday ? ' calendar-day--today' : ''}`}
            >
              <div className="calendar-day__header">
                <span className="calendar-day__number">{cell.day}</span>
                <button
                  type="button"
                  className="calendar-day__add"
                  onClick={() => handleAddTask(cell.dateKey!)}
                  aria-label={`Ajouter une tache le ${cell.dateKey}`}
                >
                  +
                </button>
              </div>

              {cell.tasks.map((task) => (
                <div
                  key={task.id}
                  className={`calendar-task${editingTaskId === task.id ? ' calendar-task--editing' : ''}`}
                  style={{
                    background: `linear-gradient(135deg, ${withAlpha(task.color, 0.12)} 0%, ${withAlpha(
                      task.color,
                      0.32,
                    )} 100%)`,
                    borderLeft: `4px solid ${task.color}`,
                  }}
                  onClick={() => {
                    if (editingTaskId === task.id) {
                      return
                    }
                    handleEditClick(task.id)
                  }}
                >
                  {editingTaskId === task.id ? (
                    <form className="calendar-task__form" onSubmit={(event) => handleSubmitEdit(event, task.id)}>
                      <div className="calendar-task__form-row">
                        <label className="calendar-task__field">
                          <span>Debut</span>
                          <input
                            type="time"
                            value={editDraft.start}
                            onChange={(event) => handleDraftChange('start', event.target.value)}
                            required
                          />
                        </label>
                        <label className="calendar-task__field">
                          <span>Fin</span>
                          <input
                            type="time"
                            value={editDraft.end}
                            onChange={(event) => handleDraftChange('end', event.target.value)}
                            required
                          />
                        </label>
                      </div>
                      <label className="calendar-task__field calendar-task__field--full">
                        <span>Couleur</span>
                        <input
                          type="color"
                          value={editDraft.color}
                          onChange={(event) => handleDraftChange('color', event.target.value)}
                          required
                        />
                      </label>
                      <div className="calendar-task__actions">
                        <button
                          type="button"
                          className="calendar-task__button calendar-task__button--ghost"
                          onClick={handleCancelEdit}
                        >
                          Annuler
                        </button>
                        <button type="submit" className="calendar-task__button calendar-task__button--primary">
                          Sauvegarder
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="calendar-task__header">
                        <span className="calendar-task__time">
                          {task.start} - {task.end}
                        </span>
                        <button
                          type="button"
                          className="calendar-task__edit"
                          onClick={(event) => {
                            event.stopPropagation()
                            handleEditClick(task.id)
                          }}
                          aria-label={`Modifier ${task.title}`}
                        >
                          <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
                            <path
                              d="M4.5 14.75 3.5 17l2.25-1 7.75-7.75-1.5-1.5L4.5 14.75Zm9.2-9.2 1.5 1.5 1.3-1.3a.75.75 0 0 0 0-1.06l-.94-.94a.75.75 0 0 0-1.06 0l-1.3 1.3Z"
                              fill="currentColor"
                              stroke="currentColor"
                              strokeWidth="0.3"
                            />
                          </svg>
                        </button>
                      </div>
                      <span className="calendar-task__title">{task.title}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          ),
        )}
      </div>
    </div>
  )
}

export default CalendarPage
