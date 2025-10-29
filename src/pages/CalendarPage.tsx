import { useMemo } from 'react'
import { getDateKey, scheduledTasks } from '../data/sampleData'

const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

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
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const firstDay = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const offset = (firstDay.getDay() + 6) % 7
  const totalCells = Math.ceil((offset + daysInMonth) / 7) * 7

  const tasksByDate = useMemo(() => {
    const map = new Map<string, typeof scheduledTasks>()
    scheduledTasks.forEach((task) => {
      const list = map.get(task.date) ?? []
      list.push(task)
      map.set(task.date, list)
    })

    map.forEach((list, key) => {
      list.sort((a, b) => a.start.localeCompare(b.start))
      map.set(key, list)
    })

    return map
  }, [])

  const cells = useMemo(() => {
    return Array.from({ length: totalCells }, (_, index) => {
      const dayNumber = index - offset + 1
      if (dayNumber < 1 || dayNumber > daysInMonth) {
        return { key: `empty-${index}`, day: null }
      }

      const currentDate = new Date(year, month, dayNumber)
      const dateKey = getDateKey(currentDate)
      return {
        key: dateKey,
        day: dayNumber,
        tasks: tasksByDate.get(dateKey) ?? [],
        isToday:
          dayNumber === today.getDate() &&
          month === today.getMonth() &&
          year === today.getFullYear(),
      }
    })
  }, [daysInMonth, month, offset, tasksByDate, today, totalCells, year])

  const totalScheduled = scheduledTasks.length

  return (
    <div className="calendar-page">
      <header className="calendar-header">
        <div>
          <h1 className="calendar-month">{formatMonthTitle(today)}</h1>
          <p className="calendar-subtitle">
            Visualise tes engagements. {totalScheduled} créneaux déjà posés.
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
          cell.day === null ? (
            <div key={cell.key} className="calendar-day calendar-day--empty" />
          ) : (
            <div
              key={cell.key}
              className={`calendar-day${
                cell.isToday ? ' calendar-day--today' : ''
              }`}
            >
              <span className="calendar-day__number">{cell.day}</span>
              {cell.tasks.map((task) => (
                <div
                  key={task.id}
                  className="calendar-task"
                  style={{
                    background: `linear-gradient(135deg, ${withAlpha(
                      task.color,
                      0.12,
                    )} 0%, ${withAlpha(task.color, 0.32)} 100%)`,
                    borderLeft: `4px solid ${task.color}`,
                  }}
                >
                  <span className="calendar-task__time">
                    {task.start} — {task.end}
                  </span>
                  <span className="calendar-task__title">{task.title}</span>
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

