import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import usePersistentState from '../hooks/usePersistentState'
import journalingIllustration from '../assets/planner-09.jpg'

type JournalFeeling = 'happy' | 'pout' | 'angry' | 'tired'

type PromptAnswer =
  | { label: string; type: 'text'; value: string }
  | { label: string; type: 'list'; items: string[] }

type PromptEntrySection = {
  id: string
  title: string
  answers: PromptAnswer[]
}

type JournalEntry = {
  id: string
  date: string
  mood: string
  content: string
  feeling: JournalFeeling
  feelingReason: string
  prompts?: PromptEntrySection[]
  freeWriting?: string
}

type PromptField =
  | {
      id: string
      type: 'textarea'
      label: string
      placeholder?: string
    }
  | {
      id: string
      type: 'checkboxes'
      label: string
      options: string[]
    }

type JournalingPromptSection = {
  id: string
  icon: string
  title: string
  accent: string
  description?: string
  helper?: string
  fields: PromptField[]
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
const feelings: Array<{ value: JournalFeeling; label: string; emoji: string }> = [
  { value: 'happy', label: 'Bien', emoji: '🌈' },
  { value: 'pout', label: 'Boudeuse', emoji: '🌦️' },
  { value: 'angry', label: 'En colere', emoji: '🔥' },
  { value: 'tired', label: 'Fatiguee', emoji: '🌙' },
]
const DATE_PROMPT_FIELD_ID = 'prompt-date'

const journalingPromptSections: JournalingPromptSection[] = [
  {
    id: 'daily-state',
    icon: '🕯️',
    title: '1. Etat du jour',
    accent: '#ffe9f1',
    description: 'Concentre-toi sur ce que tu ressens, sur ton humeur et sur l’instant présent.',
    fields: [
      {
        id: DATE_PROMPT_FIELD_ID,
        type: 'textarea',
        label: 'Quelle est la date d\'aujourdhui ?',
        placeholder: 'Laisse ton cœur parler ici…',
      },
      {
        id: 'prompt-mood-now',
        type: 'textarea',
        label: 'Comment je me suis sentie ?',
        placeholder: 'Laisse monter les sensations, les émotions ou les mots qui te viennent.',
      },
      {
        id: 'prompt-mood-influence',
        type: 'textarea',
        label: 'Qu’est-ce qui a influencé mon humeur aujourd’hui ? (Événements, pensées, personnes, énergie, météo...)',
        placeholder: 'Note ce qui a changé ton humeur ou ton énergie.',
      },
      {
        id: 'prompt-learning',
        type: 'textarea',
        label: 'Qu\'ai-je appris ou compris sur moi-meme aujourdhui ?',
        placeholder: 'Dépose tes pensées…',
      },
    ],
  },
  {
    id: 'daily-celebration',
    icon: '💫',
    title: '2. Ma journee',
    accent: '#e0f2fe',
    description: 'Revis les belles choses et célèbre ce qui compte.',
    fields: [
      {
        id: 'prompt-highlights',
        type: 'textarea',
        label: 'Qu\'est-ce qui s\'est bien passe aujourd\'hui ?',
        placeholder: 'Liste tes victoires, même minuscules.',
      },
      {
        id: 'prompt-gratitude',
        type: 'textarea',
        label: 'De quoi suis-je reconnaissant(e) ?',
        placeholder: 'Exprime ce qui remplit ton coeur.',
      },
      {
        id: 'prompt-replay',
        type: 'textarea',
        label: 'Y a-t-il un moment que j\'aimerais revivre ?',
        placeholder: 'Quel souvenir doux veux-tu garder precieusement ?',
      },
      {
        id: 'prompt-magic-wand',
        type: 'textarea',
        label: 'Si j\'avais une baguette magique, qu\'est-ce que je changerais dans cette journee ?',
        placeholder: 'Note ce qui te vient spontanément…',
      },
    ],
  },
  {
    id: 'abundance-affirmations',
    icon: '💰',
    title: '3. Affirmations pour attirer l\'argent et l\'abondance',
    accent: '#f3efff',
    description: 'Invite la prosperite dans ton esprit avec des mots qui vibrent pour toi.',
    helper: 'Choisis-en 3 a 5 ou ecris les tiennes.',
    fields: [
      {
        id: 'prompt-money-affirmations',
        type: 'checkboxes',
        label: 'Ce que je souhaite repeter',
        options: [
          'L\'argent circule vers moi facilement et en abondance.',
          'Je merite la richesse sous toutes ses formes.',
          'Chaque jour, je deviens un aimant a opportunites financieres.',
          'Je suis reconnaissant(e) pour tout l\'argent qui entre dans ma vie.',
          'Mes actions attirent la prosperite naturellement.',
        ],
      },
      {
        id: 'prompt-money-custom',
        type: 'textarea',
        label: 'Tes mots magiques',
        placeholder: 'Compose tes propres affirmations lumineuses.',
      },
    ],
  },
  {
    id: 'confidence-affirmations',
    icon: '🌟',
    title: '4. Affirmations pour la confiance en soi',
    accent: '#fef3c7',
    description: 'Renforce ta confiance et ancre-toi dans ta valeur.',
    helper: 'Choisis-en 3 a 5 ou ecris les tiennes.',
    fields: [
      {
        id: 'prompt-confidence-affirmations',
        type: 'checkboxes',
        label: 'Ce que je me repete',
        options: [
          'Je crois en mes capacites et je suis fier(fiere) de moi.',
          'Je suis digne d\'amour, de succes et de respect.',
          'Je suis en securite d\'etre moi-meme.',
          'Chaque jour, je deviens plus sur(e) et plus fort(e).',
          'Ma presence a de la valeur.',
        ],
      },
      {
        id: 'prompt-confidence-custom',
        type: 'textarea',
        label: 'Tes declarations personnelles',
        placeholder: 'Ecris des mots doux qui te ressemblent.',
      },
    ],
  },
  {
    id: 'visualisation',
    icon: '🌙',
    title: '5. Visualisation / Intention',
    accent: '#e9f7f3',
    description: 'Projette-toi avec douceur vers demain.',
    fields: [
      {
        id: 'prompt-intention',
        type: 'textarea',
        label: 'Quelle est mon intention pour demain ?',
        placeholder: 'Pose ton intention la plus douce pour la suite.',
      },
      {
        id: 'prompt-feeling',
        type: 'textarea',
        label: 'Comment je veux me sentir demain ?',
        placeholder: 'Imagine l ambiance emotionnelle que tu souhaites vivre.',
      },
      {
        id: 'prompt-self-version',
        type: 'textarea',
        label: 'Quelle version de moi suis-je en train de devenir ?',
        placeholder: 'Decris la personne que tu nourris pas a pas.',
      },
    ],
  },
]

const createInitialPromptResponses = () => {
  const initial: Record<string, string> = {}
  journalingPromptSections.forEach((section) => {
    section.fields.forEach((field) => {
      if (field.type === 'textarea') {
        initial[field.id] = ''
      }
    })
  })
  return initial
}

const createInitialPromptSelections = () => {
  const initial: Record<string, string[]> = {}
  journalingPromptSections.forEach((section) => {
    section.fields.forEach((field) => {
      if (field.type === 'checkboxes') {
        initial[field.id] = []
      }
    })
  })
  return initial
}

const JournalingPage = () => {
  const [entries, setEntries] = usePersistentState<JournalEntry[]>('planner.journal.entries', () => initialEntries)
  const [draft, setDraft] = useState({
    date: getTodayISO(),
    mood: 'Equilibree',
    content: '',
    feeling: feelings[0]?.value ?? 'happy',
    feelingReason: '',
  })
  const [promptResponses, setPromptResponses] = useState<Record<string, string>>(() => createInitialPromptResponses())
  const [promptSelections, setPromptSelections] = useState<Record<string, string[]>>(() => createInitialPromptSelections())

  useEffect(() => {
    document.body.classList.add('planner-page--white')
    return () => {
      document.body.classList.remove('planner-page--white')
    }
  }, [])

  useEffect(() => {
    setPromptResponses((previous) => {
      if (previous[DATE_PROMPT_FIELD_ID] === draft.date) {
        return previous
      }
      return {
        ...previous,
        [DATE_PROMPT_FIELD_ID]: draft.date,
      }
    })
  }, [draft.date])

  const handleDraftChange = <Field extends keyof typeof draft>(field: Field, value: typeof draft[Field]) => {
    setDraft((previous) => ({
      ...previous,
      [field]: value,
    }))
  }

  const handlePromptResponseChange = (fieldId: string, value: string) => {
    setPromptResponses((previous) => ({
      ...previous,
      [fieldId]: value,
    }))
  }

  const handlePromptSelectionToggle = (fieldId: string, option: string) => {
    setPromptSelections((previous) => {
      const current = previous[fieldId] ?? []
      const exists = current.includes(option)
      const next = exists ? current.filter((item) => item !== option) : [...current, option]
      return {
        ...previous,
        [fieldId]: next,
      }
    })
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const promptSectionsForEntry = journalingPromptSections
      .map<PromptEntrySection | null>((section) => {
        const answers: PromptAnswer[] = []

        section.fields.forEach((field) => {
          if (field.type === 'textarea') {
            const value = (promptResponses[field.id] ?? '').trim()
            if (value.length > 0) {
              answers.push({
                label: field.label,
                type: 'text',
                value,
              })
            }
          } else if (field.type === 'checkboxes') {
            const selected = promptSelections[field.id] ?? []
            if (selected.length > 0) {
              answers.push({
                label: field.label,
                type: 'list',
                items: selected,
              })
            }
          }
        })

        if (answers.length === 0) {
          return null
        }

        return {
          id: section.id,
          title: section.title,
          answers,
        }
      })
      .filter((section): section is PromptEntrySection => section !== null)

    const freeWriting = draft.content.trim()

    if (promptSectionsForEntry.length === 0 && freeWriting.length === 0) {
      return
    }

    const promptSummaryText = promptSectionsForEntry
      .map((section) => {
        const parts = section.answers.map((answer) => {
          if (answer.type === 'list') {
            return `${answer.label}\n${answer.items.map((item) => `- ${item}`).join('\n')}`
          }
          return `${answer.label}\n${answer.value}`
        })
        return `${section.title}\n${parts.join('\n\n')}`
      })
      .join('\n\n')

    const combinedContent = [promptSummaryText, freeWriting].filter((value) => value.length > 0).join('\n\n')

    const newEntry: JournalEntry = {
      id: `entry-${Date.now()}`,
      date: draft.date,
      mood: draft.mood,
      content: combinedContent,
      feeling: draft.feeling,
      feelingReason: draft.feelingReason.trim(),
      prompts: promptSectionsForEntry.length > 0 ? promptSectionsForEntry : undefined,
      freeWriting: freeWriting.length > 0 ? freeWriting : undefined,
    }

    setEntries((previous) => [newEntry, ...previous])
    setDraft((previous) => ({ ...previous, content: '', feelingReason: '' }))
    setPromptResponses(createInitialPromptResponses())
    setPromptSelections(createInitialPromptSelections())
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

  const totalEntries = entries.length
  const activeDays = entriesByDate.length
  const latestEntry = entries[0]
  const highlightedFeeling =
    feelings.find((option) => option.value === (latestEntry?.feeling ?? draft.feeling)) ?? feelings[0]

  const journalingStats = [
    { id: 'pages', label: 'Pages ecrites', value: totalEntries.toString() },
    { id: 'days', label: 'Jours actifs', value: activeDays.toString() },
    {
      id: 'feeling',
      label: 'Humeur du moment',
      value: latestEntry?.mood ?? draft.mood,
      hint: highlightedFeeling.emoji,
    },
  ]

  return (
    <div className="journaling-page aesthetic-page">
      <div className="journaling-page__breadcrumb">journal</div>
      <div className="journaling-page__accent-bar" aria-hidden="true" />
      <section className="journaling-hero">
        <div className="journaling-hero__text">
          <span className="journaling-hero__tag">Rituel du jour</span>
          <h1>Mon journal pastel</h1>
          <p>Prends un instant pour respirer, ecrire et manifester ta vie de reve.</p>
          <div className="journaling-hero__stats">
            {journalingStats.map((stat) => (
              <article key={stat.id}>
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
                {stat.hint && <small>{stat.hint}</small>}
              </article>
            ))}
          </div>
          <div className="journaling-hero__date-card">
            <span>Date du jour</span>
            <time>{draft.date}</time>
          </div>
        </div>
        <div className="journaling-hero__visual">
          <div className="journaling-hero__visual-main">
            <img src={journalingIllustration} alt="Carnet pastel accompagne de fleurs sechees" />
          </div>
        </div>
      </section>

      <section className="journaling-prompts">
        <header className="journaling-prompts__header">
          <div>
            <h2>Journal de manifestation et d’abondance</h2>
            <p>Choisis les sections qui te parlent et laisse-toi guider par les questions.</p>
          </div>
        </header>
        <div className="journaling-prompts__grid">
          {journalingPromptSections.map((section) => {
            const cardStyle = {
              background: `linear-gradient(160deg, ${section.accent} 0%, rgba(255, 255, 255, 0.95) 100%)`,
            }
            return (
              <article key={section.id} className="journaling-prompts__card" style={cardStyle}>
                <header className="journaling-prompts__card-header">
                  <span aria-hidden="true" className="journaling-prompts__icon">
                    {section.icon}
                  </span>
                  <div>
                    <h3>{section.title}</h3>
                    {section.description && <p>{section.description}</p>}
                  </div>
                </header>
                {section.helper && <p className="journaling-prompts__helper">{section.helper}</p>}
                <div className="journaling-prompts__fields">
                  {section.fields.map((field) => {
                    if (field.type === 'textarea') {
                      return (
                        <label key={field.id} className="journaling-prompts__field">
                          <span>{field.label}</span>
                          <textarea
                            value={promptResponses[field.id] ?? ''}
                            onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                              handlePromptResponseChange(field.id, event.target.value)
                            }
                            placeholder={field.placeholder}
                            rows={field.id === DATE_PROMPT_FIELD_ID ? 2 : 3}
                          />
                        </label>
                      )
                    }

                    const selected = promptSelections[field.id] ?? []
                    return (
                      <fieldset key={field.id} className="journaling-prompts__choices">
                        <legend>{field.label}</legend>
                        <span className="journaling-prompts__choices-count">{selected.length} selection(s)</span>
                        <div className="journaling-prompts__options">
                          {field.options.map((option) => {
                            const isSelected = selected.includes(option)
                            return (
                              <label
                                key={option}
                                className={
                                  isSelected ? 'journaling-prompts__option is-selected' : 'journaling-prompts__option'
                                }
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handlePromptSelectionToggle(field.id, option)}
                                />
                                <span>{option}</span>
                              </label>
                            )
                          })}
                        </div>
                      </fieldset>
                    )
                  })}
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="journaling-editor">
        <h2>Ecriture libre</h2>
        <p>Laisse venir les mots qui reflètent ton état intérieur.</p>
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

          <fieldset className="journaling-editor__feelings journaling-editor__field journaling-editor__field--full">
            <legend>Comment t\'es-tu sentie aujourd\'hui ?</legend>
            <div className="journaling-editor__feelings-options">
              {feelings.map((option) => (
                <label key={option.value} className="journaling-editor__feeling-option">
                  <input
                    type="radio"
                    name="journal-feeling"
                    value={option.value}
                    checked={draft.feeling === option.value}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      handleDraftChange('feeling', event.target.value as JournalFeeling)
                    }
                  />
                  <div className="journaling-editor__feeling-content">
                    <span aria-hidden="true" className="journaling-editor__feeling-emoji">
                      {option.emoji}
                    </span>
                    <span className="journaling-editor__feeling-label">{option.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="journaling-editor__field journaling-editor__field--full">
            <span>Pourquoi ?</span>
            <textarea
              value={draft.feelingReason}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) => handleDraftChange('feelingReason', event.target.value)}
              placeholder="Qu\'est-ce qui a colore ta journee ?"
              rows={3}
            />
          </label>

          <label className="journaling-editor__field journaling-editor__field--full">
            <span>Texte libre</span>
            <textarea
              value={draft.content}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) => handleDraftChange('content', event.target.value)}
              placeholder="Raconte ici tout ce que tu veux ajouter."
              rows={6}
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
                {items.map((entry) => {
                  const feelingOption = feelings.find((option) => option.value === entry.feeling)
                  const freeWritingText =
                    entry.freeWriting ??
                    (entry.prompts && entry.prompts.length > 0 ? '' : entry.content)

                  return (
                    <li key={entry.id}>
                      <div className="journaling-history__feeling">
                        <span aria-hidden="true" className="journaling-history__feeling-emoji">
                          {feelingOption?.emoji ?? '🌸'}
                        </span>
                        <div className="journaling-history__feeling-info">
                          <span className="journaling-history__feeling-label">
                            {feelingOption?.label ?? entry.feeling}
                          </span>
                          <span className="journaling-history__mood">{entry.mood}</span>
                        </div>
                      </div>
                      {entry.feelingReason.length > 0 && (
                        <p className="journaling-history__why">
                          <strong>Pourquoi :</strong> {entry.feelingReason}
                        </p>
                      )}
                      {entry.prompts && entry.prompts.length > 0 && (
                        <div className="journaling-history__prompts">
                          {entry.prompts.map((section) => (
                            <div key={section.id} className="journaling-history__prompt-section">
                              <h4>{section.title}</h4>
                              <ul>
                                {section.answers.map((answer) => {
                                  if (answer.type === 'list') {
                                    return (
                                      <li key={`${section.id}-${answer.label}`}>
                                        <strong>{answer.label}</strong>
                                        <ul>
                                          {answer.items.map((item) => (
                                            <li key={item}>{item}</li>
                                          ))}
                                        </ul>
                                      </li>
                                    )
                                  }

                                  return (
                                    <li key={`${section.id}-${answer.label}`}>
                                      <strong>{answer.label}</strong>
                                      <p>{answer.value}</p>
                                    </li>
                                  )
                                })}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                      {freeWritingText.length > 0 && (
                        <div className="journaling-history__freewrite">
                          <h4>Texte libre</h4>
                          {freeWritingText.split(/\n+/).map((paragraph, index) => (
                            <p key={`${entry.id}-paragraph-${index}`}>{paragraph}</p>
                          ))}
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <div className="journaling-page__footer-bar" aria-hidden="true" />
    </div>
  )
}

export default JournalingPage
