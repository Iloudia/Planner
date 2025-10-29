import { useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import usePersistentState from '../hooks/usePersistentState'

type JournalEntry = {
  id: string
  date: string
  mood: string
  content: string
}

const getTodayISO = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = `${today.getMonth() + 1}`.padStart(2, '0')
  const day = `${today.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

const initialEntries: JournalEntry[] = []

const moods = ['Sereine', 'Energisee', 'Equilibree', 'Fatiguee', 'Fiere']

const JournalingPage = () => {
  const [entries, setEntries] = usePersistentState<JournalEntry[]>('planner.journal.entries', () => initialEntries)
  const [draft, setDraft] = useState({
    date: getTodayISO(),
    mood: 'Equilibree',
    content: '',
  })

  const handleDraftChange = <Field extends keyof typeof draft>(field: Field, value: typeof draft[Field]) => {
    setDraft((previous) => ({
      ...previous,
      [field]: value,
    }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (draft.content.trim().length === 0) {
      return
    }

    const newEntry: JournalEntry = {
      id: `entry-${Date.now()}`,
      date: draft.date,
      mood: draft.mood,
      content: draft.content.trim(),
    }

    setEntries((previous) => [newEntry, ...previous])
    setDraft((previous) => ({ ...previous, content: '' }))
  }

  const entriesByDate = useMemo(() => {
    const map = new Map<string, JournalEntry[]>()
    entries.forEach((entry) => {
      const list = map.get(entry.date) ?? []
      list.push(entry)
      map.set(entry.date, list)
    })

    return Array.from(map.entries()).sort((a, b) => (a[0] > b[0] ? -1 : 1))
  }, [entries])

  return (
    <div className="journaling-page">
      <header className="journaling-header">
        <div>
          <h1>Journal quotidien</h1>
          <p>Capture tes ressentis, celebre tes victoires et observe ton evolution semaine apres semaine.</p>
        </div>
        <div className="journaling-header__date">
          <span>Date selectionnee</span>
          <time>{draft.date}</time>
        </div>
      </header>

      <section className="journaling-editor">
        <h2>Nouvelle entree</h2>
        <form onSubmit={handleSubmit} className="journaling-editor__form">
          <label className="journaling-editor__field">
            <span>Date</span>
            <input
              type="date"
              value={draft.date}
              onChange={(event: ChangeEvent<HTMLInputElement>) => handleDraftChange('date', event.target.value)}
            />
          </label>

          <label className="journaling-editor__field">
            <span>Humeur</span>
            <select
              value={draft.mood}
              onChange={(event: ChangeEvent<HTMLSelectElement>) => handleDraftChange('mood', event.target.value)}
            >
              {moods.map((mood) => (
                <option key={mood} value={mood}>
                  {mood}
                </option>
              ))}
            </select>
          </label>

          <label className="journaling-editor__field journaling-editor__field--full">
            <span>Texte</span>
            <textarea
              value={draft.content}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) => handleDraftChange('content', event.target.value)}
              placeholder="Comment se passe ta journee ? Quelles intentions veux-tu poser ?"
              rows={6}
              required
            />
          </label>

          <button type="submit" className="journaling-editor__submit">
            Ajouter cette page
          </button>
        </form>
      </section>

      <section className="journaling-history">
        <h2>Archives</h2>
        <div className="journaling-history__list">
          {entriesByDate.map(([date, items]) => (
            <article key={date} className="journaling-history__group">
              <header>
                <time>{date}</time>
                <span>{items.length} page(s)</span>
              </header>
              <ul>
                {items.map((entry) => (
                  <li key={entry.id}>
                    <span className="journaling-history__mood">{entry.mood}</span>
                    <p>{entry.content}</p>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default JournalingPage
