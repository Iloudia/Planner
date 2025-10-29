import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'

type DashboardCard = {
  id: string
  title: string
  image: string
}

const fallbackImages = [
  'https://images.unsplash.com/photo-1522205941801-65c0b65ed46f?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1529336953121-adb0e84c4ab2?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1515169067865-5387ec356754?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=400&q=80',
]

const initialCards: DashboardCard[] = [
  { id: 'card-1', title: 'Activités', image: fallbackImages[0] },
  { id: 'card-2', title: 'Finances', image: fallbackImages[1] },
  { id: 'card-3', title: 'Journaling', image: fallbackImages[2] },
  { id: 'card-4', title: 'Routine (soir & matin)', image: fallbackImages[3] },
  { id: 'card-5', title: 'Revue du mois', image: fallbackImages[4] },
  { id: 'card-6', title: 'Calendrier mensuel', image: fallbackImages[5] },
  { id: 'card-7', title: 'Choses à regarder', image: fallbackImages[6] },
  { id: 'card-8', title: 'Sorties', image: fallbackImages[7] },
  { id: 'card-9', title: 'Thérapie', image: fallbackImages[8] },
]

const sidebarSections = [
  {
    title: 'Currently reading',
    items: ['Title', 'Title', 'Title'],
  },
  {
    title: 'Meet up',
    items: ['Title', 'Title', 'Title'],
  },
  {
    title: 'Waiting',
    items: ['Title', 'Title', 'Title'],
  },
]

const PlannerPage = () => {
  const [cards, setCards] = useState<DashboardCard[]>(initialCards)
  const [notes, setNotes] = useState(() => Array.from({ length: 5 }, () => ''))

  const today = useMemo(() => new Date(), [])
  const formattedDate = useMemo(() => {
    const formatter = new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    const label = formatter.format(today)
    return label.charAt(0).toUpperCase() + label.slice(1)
  }, [today])

  const handleCardClick = (card: DashboardCard) => {
    console.info(`Carte sélectionnée : ${card.title}`)
  }

  const handleRemoveCard = (cardId: string) => {
    setCards((previous) => previous.filter((card) => card.id !== cardId))
  }

  const handleAddCard = () => {
    const title = window.prompt('Titre pour la nouvelle carte ?')
    if (!title) {
      return
    }
    const imageInput = window.prompt(
      "URL de l’image (laisse vide pour un visuel par défaut)",
    )
    const fallback =
      fallbackImages[(cards.length + 1) % fallbackImages.length] ??
      fallbackImages[0]
    const nextCard: DashboardCard = {
      id: `card-${Date.now()}`,
      title: title.trim(),
      image: imageInput?.trim() || fallback,
    }
    setCards((previous) => [...previous, nextCard])
  }

  const handleNoteChange = (index: number) => (event: ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = event.target
    setNotes((previous) =>
      previous.map((entry, entryIndex) => (entryIndex === index ? value : entry)),
    )
  }

  useEffect(() => {
    document.body.classList.add('planner-page--white')
    return () => {
      document.body.classList.remove('planner-page--white')
    }
  }, [])

  return (
    <div className="planner-page dashboard-page">

      <section className="dashboard-content">
        <div className="dashboard-column dashboard-column--left">
          <div className="dashboard-profile-card dashboard-panel">
            <img
              className="dashboard-profile-card__image"
              src="https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=400&q=80"
              alt="Moodboard quotidien"
            />
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
            <time>{formattedDate}</time>
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
                <img src={card.image} alt={card.title} />
                <span className="dashboard-card__title">{card.title}</span>
                <span
                  className="dashboard-card__remove"
                  onClick={(event) => {
                    event.stopPropagation()
                    handleRemoveCard(card.id)
                  }}
                  role="button"
                  aria-label={`Supprimer la carte ${card.title}`}
                >
                  ×
                </span>
              </button>
            ))}
          </div>
        </div>

        <aside className="dashboard-column dashboard-column--right">
          {sidebarSections.map((section) => (
            <div
              key={section.title}
              className={`dashboard-sidebar-section${
                section.title === 'Currently reading' ? ' dashboard-panel' : ''
              }`}
            >
              <span className="dashboard-sidebar-title">{section.title}</span>
              <ul>
                {section.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </aside>
      </section>
    </div>
  )
}

export default PlannerPage


