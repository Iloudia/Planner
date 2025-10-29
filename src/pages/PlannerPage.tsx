import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ChangeEvent } from 'react'
import type { ScheduledTask } from '../data/sampleData'
import { scheduledTasks } from '../data/sampleData'
import { plannerCardRouteById, plannerCardRoutes } from '../data/plannerCardRoutes'
import planner01 from '../assets/planner-01.jpg'
import planner02 from '../assets/planner-02.jpg'
import planner03 from '../assets/planner-03.jpg'
import planner04 from '../assets/planner-04.jpg'
import planner05 from '../assets/planner-05.jpg'
import planner06 from '../assets/planner-06.jpg'
import planner07 from '../assets/planner-07.jpg'
import planner08 from '../assets/planner-08.jpg'
import planner09 from '../assets/planner-09.jpg'
import planner10 from '../assets/planner-10.jpg'

type DashboardCard = {
  id: string
  title: string
  image: string
  path?: string
}

type UpcomingTask = ScheduledTask & {
  startDate: Date
}

type UpcomingGroup = {
  key: string
  accent: string
  dateLabel: string
  dayNumber: string
  weekday: string
  tasks: Array<{
    id: string
    title: string
    timeRange: string
    tag: string
  }>
}

const plannerImages = [
  planner01,
  planner02,
  planner03,
  planner04,
  planner05,
  planner06,
  planner07,
  planner08,
  planner09,
  planner10,
] as const

const fallbackImages = plannerImages.slice(0, 9)
const profileImage = plannerImages[9] ?? plannerImages[0]

const pastelPalette = ['#F8EDEB', '#E3F2FD', '#E8F8F5', '#FDF2F8', '#EDE9FE', '#FFF4E6']

const initialCards: DashboardCard[] = plannerCardRoutes.map((route, index) => ({
  id: route.id,
  title: route.title,
  image: fallbackImages[index % fallbackImages.length] ?? fallbackImages[0],
  path: route.path,
}))

const withAlpha = (hexColor: string, alpha: number) => {
  const parsed = hexColor.replace('#', '')
  const value = parseInt(parsed, 16)
  const r = (value >> 16) & 255
  const g = (value >> 8) & 255
  const b = value & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const PlannerPage = () => {
  const navigate = useNavigate()
  const [cards, setCards] = useState<DashboardCard[]>(initialCards)
  const [notes, setNotes] = useState(() => Array.from({ length: 5 }, () => ''))

  useEffect(() => {
    document.body.classList.add('planner-page--white')
    return () => {
      document.body.classList.remove('planner-page--white')
    }
  }, [])

  const todayLabel = useMemo(() => {
    const formatter = new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    const label = formatter.format(new Date())
    return label.charAt(0).toUpperCase() + label.slice(1)
  }, [])

  const upcomingTaskGroups = useMemo(() => {
    const now = new Date()
    const capitalise = (value: string) =>
      value.length > 0 ? value.charAt(0).toUpperCase() + value.slice(1) : value

    const tasksWithStart: UpcomingTask[] = scheduledTasks.map((task) => {
      const [year, month, day] = task.date.split('-').map(Number)
      const [hour, minute] = task.start.split(':').map(Number)
      const startDate = new Date(year, (month ?? 1) - 1, day ?? 1, hour ?? 0, minute ?? 0)
      return { ...task, startDate }
    })

    const future = tasksWithStart
      .filter((task) => task.startDate.getTime() >= now.getTime())
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())

    const dataset = (future.length > 0 ? future : tasksWithStart).slice(0, 6)
    if (dataset.length === 0) {
      return [] as UpcomingGroup[]
    }

    const dayFormatter = new Intl.DateTimeFormat('fr-FR', { day: '2-digit' })
    const weekdayFormatter = new Intl.DateTimeFormat('fr-FR', { weekday: 'long' })
    const dateFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' })

    const groups = new Map<string, UpcomingGroup>()
    let colorIndex = 0

    dataset.forEach((task) => {
      const key = task.startDate.toISOString().split('T')[0]
      const accent = pastelPalette[colorIndex % pastelPalette.length] ?? pastelPalette[0]
      const timeRange = `${task.start} - ${task.end}`
      const existing = groups.get(key)

      if (!existing) {
        groups.set(key, {
          key,
          accent,
          dateLabel: dateFormatter.format(task.startDate),
          dayNumber: dayFormatter.format(task.startDate),
          weekday: capitalise(weekdayFormatter.format(task.startDate)),
          tasks: [
            {
              id: task.id,
              title: task.title,
              timeRange,
              tag: task.tag,
            },
          ],
        })
        colorIndex += 1
      } else {
        existing.tasks.push({
          id: task.id,
          title: task.title,
          timeRange,
          tag: task.tag,
        })
      }
    })

    return Array.from(groups.values())
  }, [])

  const handleNoteChange = (index: number) => (event: ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = event.target
    setNotes((previous) => previous.map((note, position) => (position === index ? value : note)))
  }

  const handleCardClick = (card: DashboardCard) => {
    const path = card.path ?? plannerCardRouteById[card.id]
    if (path) {
      navigate(path)
      return
    }
    console.info(`Carte selectionnee : ${card.title}`)
  }

  const handleEditCard = (cardId: string) => {
    setCards((previous) => {
      const target = previous.find((item) => item.id === cardId)
      if (!target) {
        return previous
      }

      const nextTitle = window.prompt('Nouveau titre pour la carte ?', target.title)
      if (!nextTitle || nextTitle.trim().length === 0) {
        return previous
      }

      const nextImage = window.prompt('URL de la nouvelle image (vide pour garder actuelle)', target.image)
      const trimmedImage = nextImage && nextImage.trim().length > 0 ? nextImage.trim() : target.image

      return previous.map((item) =>
        item.id === cardId ? { ...item, title: nextTitle.trim(), image: trimmedImage } : item,
      )
    })
  }

  const handleRemoveCard = (cardId: string) => {
    setCards((previous) => previous.filter((card) => card.id !== cardId))
  }

  const handleAddCard = () => {
    const title = window.prompt('Titre pour la nouvelle carte ?')
    if (!title || title.trim().length === 0) {
      return
    }

    const imageInput = window.prompt("URL de l'image (vide pour visuel par defaut)")
    const fallbackImage = fallbackImages[(cards.length + 1) % fallbackImages.length] ?? fallbackImages[0]

    const nextCard: DashboardCard = {
      id: `card-${Date.now()}`,
      title: title.trim(),
      image: imageInput && imageInput.trim().length > 0 ? imageInput.trim() : fallbackImage,
    }

    setCards((previous) => [...previous, nextCard])
  }

  return (
    <div className="planner-page dashboard-page">
      <section className="dashboard-content">
        <div className="dashboard-column dashboard-column--left">
          <div className="dashboard-profile-card dashboard-panel">
            <img className="dashboard-profile-card__image" src={profileImage} alt="Moodboard quotidien" />
            <span className="dashboard-profile-card__divider" />
            <div className="dashboard-profile-card__notes">
              {notes.map((note, index) => (
                <textarea
                  key={index}
                  value={note}
                  onChange={handleNoteChange(index)}
                  placeholder={`Phrase ${index + 1}`}
                  aria-label={`Note objectif ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="dashboard-column dashboard-column--center">
          <div className="dashboard-date">
            <span>Aujourd'hui</span>
            <time>{todayLabel}</time>
          </div>
          <div className="dashboard-card-controls">
            <button
              type="button"
              className="dashboard-card-add"
              onClick={handleAddCard}
              aria-label="Ajouter une nouvelle carte"
            >
              +
            </button>
          </div>
          <div className="dashboard-card-grid">
            {cards.map((card) => (
              <button
                key={card.id}
                type="button"
                className="dashboard-card"
                onClick={() => handleCardClick(card)}
              >
                <div className="dashboard-card__actions">
                  <span
                    className="dashboard-card__action dashboard-card__action--edit"
                    onClick={(event) => {
                      event.stopPropagation()
                      handleEditCard(card.id)
                    }}
                    role="button"
                    aria-label={`Modifier la carte ${card.title}`}
                  >
                    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
                      <path
                        d="M4.5 14.75 3.5 17l2.25-1 7.75-7.75-1.5-1.5L4.5 14.75Zm9.2-9.2 1.5 1.5 1.3-1.3a.75.75 0 0 0 0-1.06l-.94-.94a.75.75 0 0 0-1.06 0l-1.3 1.3Z"
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth="0.3"
                      />
                    </svg>
                  </span>
                  <span
                    className="dashboard-card__action dashboard-card__action--remove"
                    onClick={(event) => {
                      event.stopPropagation()
                      handleRemoveCard(card.id)
                    }}
                    role="button"
                    aria-label={`Supprimer la carte ${card.title}`}
                  >
                    {'\u00d7'}
                  </span>
                </div>
                <img src={card.image} alt={card.title} />
                <span className="dashboard-card__title">{card.title}</span>
              </button>
            ))}
          </div>
        </div>

        <aside className="dashboard-column dashboard-column--right">
          <div className="dashboard-upcoming dashboard-panel">
            <div className="dashboard-upcoming__header">
              <span className="dashboard-upcoming__title">Prochaines taches</span>
              <span className="dashboard-upcoming__subtitle">
                Ton prochain focus, tout en douceur pastel.
              </span>
            </div>
            {upcomingTaskGroups.length === 0 ? (
              <div className="dashboard-upcoming__empty">
                <span>Aucune echeance a venir. Profite de ce calme.</span>
              </div>
            ) : (
              upcomingTaskGroups.map((group) => (
                <div
                  key={group.key}
                  className="dashboard-upcoming__day"
                  style={{
                    background: `linear-gradient(140deg, ${withAlpha(group.accent, 0.35)} 0%, ${withAlpha(group.accent, 0.18)} 100%)`,
                    boxShadow: `0 18px 40px ${withAlpha(group.accent, 0.28)}`,
                    borderColor: group.accent,
                  }}
                >
                  <div className="dashboard-upcoming__date">
                    <span className="dashboard-upcoming__day-number">{group.dayNumber}</span>
                    <span className="dashboard-upcoming__weekday">{group.weekday}</span>
                    <span className="dashboard-upcoming__full-date">{group.dateLabel}</span>
                  </div>
                  <ul className="dashboard-upcoming__tasks">
                    {group.tasks.map((task) => (
                      <li key={task.id} className="dashboard-upcoming__task">
                        <span className="dashboard-upcoming__time">{task.timeRange}</span>
                        <div className="dashboard-upcoming__task-info">
                          <span className="dashboard-upcoming__task-title">{task.title}</span>
                          <span className="dashboard-upcoming__tag">{task.tag}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        </aside>
      </section>
    </div>
  )
}

export default PlannerPage
