import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import usePersistentState from '../../hooks/usePersistentState'
import activitiesMood01 from '../../assets/planner-05.jpg'
import activitiesMood02 from '../../assets/planner-08.jpg'
import './ActivitiesPage.css'

type ActivityStatus = 'a-faire' | 'planifie' | 'fait'

type Activity = {
  id: string
  title: string
  category: string
  status: ActivityStatus
  idealDate?: string
  photo?: string
}

type ActivityDraft = {
  title: string
  category: string
  status: ActivityStatus
  idealDate: string
}

const statusLabels: Record<ActivityStatus, string> = {
  'a-faire': 'Non planifiÃ©e',
  planifie: 'PlanifiÃ©e',
  fait: 'RÃ©alisÃ©e',
}

const categoryPalette = ['#C7D2FE', '#FBCFE8', '#FDE68A', '#E9D5FF', '#BFDBFE']

const defaultActivities: Activity[] = [
  { id: 'act-1', title: 'Cours de poterie', category: 'CrÃ©ativitÃ©', status: 'planifie', idealDate: '', photo: undefined },
  { id: 'act-2', title: 'RandonnÃ©e au lever du soleil', category: 'Nature', status: 'a-faire', idealDate: '', photo: undefined },
  { id: 'act-3', title: 'Atelier photo', category: 'CrÃ©ativitÃ©', status: 'fait', idealDate: '', photo: undefined },
]

const activitiesHeroImage = {
  src: activitiesMood01,
  alt: 'Palette pastel pour atelier crÃ©atif',
}

const activitiesFormIllustration = activitiesMood02

const formatDate = (value?: string) => {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(date)
}

const ActivitiesPage = () => {
  const [activities, setActivities] = usePersistentState<Activity[]>('planner.activities', () => defaultActivities)
  const [draft, setDraft] = useState<ActivityDraft>({
    title: '',
    category: '',
    status: 'a-faire',
    idealDate: '',
  })

  useEffect(() => {
    document.body.classList.add('planner-page--white')
    return () => {
      document.body.classList.remove('planner-page--white')
    }
  }, [])

  const plannedActivities = useMemo(
    () => activities.filter((activity) => activity.status === 'planifie' || activity.status === 'a-faire'),
    [activities],
  )

  const completedActivities = useMemo(
    () => activities.filter((activity) => activity.status === 'fait'),
    [activities],
  )

  const activitiesStats = useMemo(() => {
    const inspirations = activities.filter((activity) => activity.status === 'a-faire').length
    const scheduled = activities.filter((activity) => activity.status === 'planifie').length
    const completed = activities.filter((activity) => activity.status === 'fait').length
    return [
      { id: 'ideas', label: 'IdÃ©es', value: inspirations.toString() },
      { id: 'scheduled', label: 'Dates prÃ©vues', value: scheduled.toString() },
      { id: 'done', label: 'Moments vÃ©cus', value: completed.toString() },
    ]
  }, [activities])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (draft.title.trim().length === 0) {
      return
    }

    const nextActivity: Activity = {
      id: `activity-${Date.now()}`,
      title: draft.title.trim(),
      category: draft.category.trim().length > 0 ? draft.category.trim() : 'Inspiration',
      status: draft.status,
      idealDate: draft.idealDate,
      photo: undefined,
    }

    setActivities((previous) => [nextActivity, ...previous])
    setDraft({ title: '', category: '', status: draft.status, idealDate: '' })
  }

  const handlePhotoChange = (activityId: string) => (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const nextPhoto = typeof reader.result === 'string' ? reader.result : undefined
      setActivities((previous) =>
        previous.map((activity) => (activity.id === activityId ? { ...activity, photo: nextPhoto } : activity)),
      )
    }
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  const handleRemovePhoto = (activityId: string) => {
    setActivities((previous) =>
      previous.map((activity) => (activity.id === activityId ? { ...activity, photo: undefined } : activity)),
    )
  }

  const renderActivityCard = (activity: Activity, index: number) => {
    return (
      <li
        key={activity.id}
        className="activity-card"
        style={{ borderColor: categoryPalette[index % categoryPalette.length] }}
      >
        <div className="activity-card__media">
          {activity.photo ? (
            <img src={activity.photo} alt={`Visuel pour ${activity.title}`} />
          ) : (
            <div className="activity-card__media-placeholder">Ajoute une photo souvenir</div>
          )}
        </div>
        <div className="activity-card__content">
          <div className="activity-card__header">
            <strong>{activity.title}</strong>
          </div>
          <p className="activity-card__meta">
            <span>{activity.category}</span>
            {activity.idealDate ? <time dateTime={activity.idealDate}>{formatDate(activity.idealDate)}</time> : null}
          </p>
          <div className="activity-card__actions">
            <label className="activity-card__photo-button">
              <input type="file" accept="image/*" onChange={handlePhotoChange(activity.id)} />
              {activity.photo ? 'Changer la photo' : 'Ajouter une photo'}
            </label>
            {activity.photo ? (
              <button type="button" className="activity-card__remove-photo" onClick={() => handleRemovePhoto(activity.id)}>
                Retirer
              </button>
            ) : null}
          </div>
        </div>
      </li>
    )
  }

  return (
    <div className="activities-page aesthetic-page">
      <div className="activities-page__breadcrumb">ActivitÃ©s</div>
      <div className="activities-page__accent-bar" aria-hidden="true" />

      <section className="activities-hero dashboard-panel">
        <div className="activities-hero__content">
          <span className="activities-hero__eyebrow">Moments Ã  crÃ©er</span>
          <h1>Compose ta to-do plaisir et crÃ©ative.</h1>
          <p>Un espace pour rassembler les idÃ©es dâ€™activitÃ©s qui te font du bien et nourrissent ton Ã©nergie.</p>
          <div className="activities-hero__stats">
            {activitiesStats.map((stat) => (
              <article key={stat.id}>
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </article>
            ))}
          </div>
        </div>
        <div className="activities-hero__image">
          <img src={activitiesHeroImage.src} alt={activitiesHeroImage.alt} />
        </div>
      </section>

      <section className="activities-dashboard">
        <div className="activities-form">
          <div className="activities-form__panel dashboard-panel">
            <header className="activities-section-header">
              <span className="activities-section-header__eyebrow">Nouvelle idÃ©e</span>
              <h2>Ajouter une activitÃ©</h2>
            </header>
            <form onSubmit={handleSubmit}>
              <label>
                <span>Nom</span>
                <input
                  type="text"
                  value={draft.title}
                  onChange={(event) => setDraft((previous) => ({ ...previous, title: event.target.value }))}
                  placeholder="Ex : Week-end spa"
                  required
                />
              </label>
              <label>
                <span>CatÃ©gorie</span>
                <input
                  type="text"
                  value={draft.category}
                  onChange={(event) => setDraft((previous) => ({ ...previous, category: event.target.value }))}
                  placeholder="Ex : Bien-Ãªtre"
                />
              </label>
              <label className="activities-form__select">
                <span>Statut</span>
                <select
                  value={draft.status}
                  onChange={(event) =>
                    setDraft((previous) => ({ ...previous, status: event.target.value as ActivityStatus }))
                  }
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Date idÃ©ale</span>
                <input
                  type="date"
                  value={draft.idealDate}
                  onChange={(event) => setDraft((previous) => ({ ...previous, idealDate: event.target.value }))}
                />
              </label>
              <button type="submit" className="activities-form__submit">
                Ajouter Ã  la liste
              </button>
            </form>
          </div>
          <div className="activities-form__illustration" aria-hidden="true">
            <img src={activitiesFormIllustration} alt="" />
          </div>
        </div>

        <div className="activities-groups">
          <article className="activities-group dashboard-panel">
            <header>
              <h2>PlanifiÃ©</h2>
              <span>{plannedActivities.length} activitÃ©(s)</span>
            </header>
            {plannedActivities.length === 0 ? (
              <p className="activities-group__empty">Ajoute une idÃ©e ou une sortie pour la prÃ©parer ici.</p>
            ) : (
              <ul className="activities-group__list">
                {plannedActivities.map((activity, index) => renderActivityCard(activity, index))}
              </ul>
            )}
          </article>
        </div>
      </section>

      <div className="activities-page__footer-bar" aria-hidden="true" />

      <section className="activities-completed">
        <article className="activities-completed__panel dashboard-panel">
          <header className="activities-completed__header">
            <div>
              <h2>RÃ©alisÃ©</h2>
              <p>Archive ici tes moments prÃ©fÃ©rÃ©s Ã  revivre en images.</p>
            </div>
            <span>{completedActivities.length} activitÃ©(s)</span>
          </header>
          {completedActivities.length === 0 ? (
            <p className="activities-group__empty">Capture les souvenirs de tes activitÃ©s dÃ©jÃ  vÃ©cues.</p>
          ) : (
            <ul className="activities-group__list">
              {completedActivities.map((activity, index) => renderActivityCard(activity, index))}
            </ul>
          )}
        </article>
      </section>
    </div>
  )
}

export default ActivitiesPage


