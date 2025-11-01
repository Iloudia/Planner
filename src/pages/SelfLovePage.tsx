import type { ChangeEvent, FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import usePersistentState from '../hooks/usePersistentState'

type SelfLovePhotoSlot = {
  id: string
  dataUrl: string | null
}

type SelfLoveQuality = {
  id: string
  text: string
}

type SelfLoveThought = {
  id: string
  text: string
}

type SelfLoveJournalEntry = {
  id: string
  text: string
  createdAt: string
}

type SelfLoveState = {
  certificatePhoto: string | null
  photos: SelfLovePhotoSlot[]
  qualities: SelfLoveQuality[]
  thoughts: SelfLoveThought[]
  journal: SelfLoveJournalEntry[]
}

const PHOTO_SLOT_COUNT = 6

const createDefaultState = (): SelfLoveState => ({
  certificatePhoto: null,
  photos: Array.from({ length: PHOTO_SLOT_COUNT }, (_, index) => ({
    id: `photo-${index}`,
    dataUrl: null,
  })),
  qualities: [
    { id: 'quality-1', text: 'Mon sourire illumine les gens.' },
    { id: 'quality-2', text: "J'ai une force tranquille." },
    { id: 'quality-3', text: 'Je sais écouter avec le cœur.' },
  ],
  thoughts: [
    { id: 'thought-1', text: 'Je ne suis pas assez.' },
    { id: 'thought-2', text: 'Je dois tout contrôler.' },
    { id: 'thought-3', text: "Je ne mérite pas ce que j'ai." },
  ],
  journal: [],
})

const affirmations = [
  "Je m'offre la même douceur que je donne aux autres.",
  'Je suis déjà assez et je le reste à chaque souffle.',
  'Ma présence est un cadeau pour ce monde.',
  "Je choisis de me regarder avec de l'amour aujourd'hui.",
  'Je laisse ma lumière briller sans me cacher.',
  'Je suis digne de tendresse, de joie et de paix.',
]

const inspiringQuotes = [
  '"S’aimer soi-même est le début d’une histoire d’amour qui dure toute la vie." — Oscar Wilde',
  '"Tu es ton propre refuge. Tu es ton propre soleil."',
  '"Tu es le résultat de l’amour de toutes les femmes qui t’ont précédée."',
  '"N’oublie pas de t’émerveiller de ta force douce."',
  '"Tu es une œuvre en mouvement, magnifique à chaque étape."',
]

const STORAGE_KEY = 'planner.selfLove'

const formatDate = (value: string) => {
  const date = new Date(value)
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const SelfLovePage = () => {
  const [state, setState] = usePersistentState<SelfLoveState>(STORAGE_KEY, createDefaultState)
  const [qualityDraft, setQualityDraft] = useState('')
  const [thoughtDraft, setThoughtDraft] = useState('')
  const [journalDraft, setJournalDraft] = useState('')
  const [releasingThoughtIds, setReleasingThoughtIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    document.body.classList.add('self-love-page--gradient')
    return () => document.body.classList.remove('self-love-page--gradient')
  }, [])

  const certificateImage = useMemo(() => {
    if (state.certificatePhoto) {
      return state.certificatePhoto
    }
    return state.photos.find((photo) => photo.dataUrl)?.dataUrl ?? null
  }, [state.certificatePhoto, state.photos])

  const affirmationOfDay = useMemo(() => {
    const todayKey = new Date().toISOString().slice(0, 10)
    const hash = todayKey
      .split('')
      .reduce((accumulator, character) => accumulator + character.charCodeAt(0), 0)
    return affirmations[hash % affirmations.length]
  }, [])

  const quoteOfDay = useMemo(() => {
    const todayKey = new Date().toISOString().slice(0, 10)
    const hash = todayKey
      .split('')
      .reverse()
      .reduce((accumulator, character) => accumulator + character.charCodeAt(0), 0)
    return inspiringQuotes[hash % inspiringQuotes.length]
  }, [])

  const handlePhotoChange = (slotId: string, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : null
      setState((previous) => ({
        ...previous,
        photos: previous.photos.map((photo) =>
          photo.id === slotId ? { ...photo, dataUrl: result } : photo,
        ),
      }))
    }
    reader.readAsDataURL(file)
  }

  const handleClearPhoto = (slotId: string) => {
    setState((previous) => ({
      ...previous,
      photos: previous.photos.map((photo) =>
        photo.id === slotId ? { ...photo, dataUrl: null } : photo,
      ),
    }))
  }

  const handleAddQuality = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = qualityDraft.trim()
    if (trimmed.length === 0) {
      return
    }
    setState((previous) => ({
      ...previous,
      qualities: [{ id: `quality-${Date.now()}`, text: trimmed }, ...previous.qualities],
    }))
    setQualityDraft('')
  }

  const handleRemoveQuality = (qualityId: string) => {
    setState((previous) => ({
      ...previous,
      qualities: previous.qualities.filter((quality) => quality.id !== qualityId),
    }))
  }

  const handleAddThought = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = thoughtDraft.trim()
    if (trimmed.length === 0) {
      return
    }
    setState((previous) => ({
      ...previous,
      thoughts: [...previous.thoughts, { id: `thought-${Date.now()}`, text: trimmed }],
    }))
    setThoughtDraft('')
  }

  const handleReleaseThought = (thoughtId: string) => {
    setReleasingThoughtIds((previous) => new Set(previous).add(thoughtId))
    window.setTimeout(() => {
      setState((previous) => ({
        ...previous,
        thoughts: previous.thoughts.filter((thought) => thought.id !== thoughtId),
      }))
      setReleasingThoughtIds((previous) => {
        const next = new Set(previous)
        next.delete(thoughtId)
        return next
      })
    }, 620)
  }

  const handleAddJournalEntry = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = journalDraft.trim()
    if (trimmed.length === 0) {
      return
    }
    const entry: SelfLoveJournalEntry = {
      id: `entry-${Date.now()}`,
      text: trimmed,
      createdAt: new Date().toISOString(),
    }
    setState((previous) => ({
      ...previous,
      journal: [entry, ...previous.journal].slice(0, 12),
    }))
    setJournalDraft('')
  }

  const handleCertificatePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : null
      setState((previous) => ({ ...previous, certificatePhoto: result }))
    }
    reader.readAsDataURL(file)
  }

  const handleClearCertificatePhoto = () => {
    setState((previous) => ({ ...previous, certificatePhoto: null }))
  }

  const handleShareCertificate = async () => {
    const qualities = state.qualities.map((quality) => `• ${quality.text}`).join('\n')
    const shareText = [
      '✨ Certificat de pure beauté ✨',
      '',
      'Je célèbre la personne que je suis :',
      qualities.length > 0 ? qualities : "• Je m'aime pour qui je suis.",
      '',
      affirmationOfDay,
    ]
      .filter(Boolean)
      .join('\n')

    try {
      await navigator.clipboard.writeText(shareText)
      window.alert('Ton certificat a été copié. Partage-le avec amour !')
    } catch (error) {
      console.error('Clipboard share failed', error)
      window.prompt('Copie ton certificat :', shareText)
    }
  }

  return (
    <div className="self-love-page">
      <header className="self-love-hero">
        <div className="self-love-hero__copy">
          <span className="self-love-hero__eyebrow">moment douceur</span>
          <h1>S'aimer soi-même</h1>
          <p>Tu es déjà assez. Prends un moment pour te célébrer.</p>
        </div>
        <div className="self-love-hero__glow" aria-hidden="true" />
      </header>

      <section className="self-love-section self-love-section--photos">
        <div className="self-love-section__header">
          <h2>Aime-toi !</h2>
          <p>Aime-toi ! Regarde-toi avec bienveillance et choisis six souvenirs où tu rayonnes.</p>
        </div>
        <div className="self-love-photos-frame">
          <div className="self-love-photos">
            {state.photos.map((photo, index) => (
              <div key={photo.id} className="self-love-photo-card">
                <label className="self-love-photo-card__drop">
                  {photo.dataUrl ? (
                    <img src={photo.dataUrl} alt={`Souvenir ${index + 1}`} />
                  ) : (
                    <span className="self-love-photo-card__placeholder">
                      <span role="img" aria-label="mirror">
                        🪞
                      </span>
                      Souvenir {index + 1}
                    </span>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => handlePhotoChange(photo.id, event)}
                  />
                </label>
                {photo.dataUrl ? (
                  <button type="button" onClick={() => handleClearPhoto(photo.id)}>
                    Changer la photo
                  </button>
                ) : (
                  <span className="self-love-photo-card__hint">Ajoute un souvenir lumineux</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="self-love-section self-love-section--qualities">
        <div className="self-love-section__header">
          <h2>Ce que j'aime chez moi</h2>
          <p>Note tes qualités, tes victoires, tout ce qui te rend fière.</p>
        </div>
        <form className="self-love-form-row" onSubmit={handleAddQuality}>
          <input
            type="text"
            placeholder="Ajoute une qualité qui te rend fière"
            value={qualityDraft}
            onChange={(event) => setQualityDraft(event.target.value)}
          />
          <button type="submit">+ Ajouter une qualité</button>
        </form>
        <ul className="self-love-list">
          {state.qualities.map((quality) => (
            <li key={quality.id}>
              <span>{quality.text}</span>
              <button type="button" onClick={() => handleRemoveQuality(quality.id)}>
                Retirer
              </button>
            </li>
          ))}
          {state.qualities.length === 0 ? (
            <li className="self-love-list__empty">
              Commence par noter une seule phrase douce. Le reste suivra.
            </li>
          ) : null}
        </ul>
      </section>

      <section className="self-love-section self-love-section--thoughts">
        <div className="self-love-section__header">
          <h2>Pensées négatives à oublier</h2>
          <p>Clique sur une pensée pour la laisser s'envoler.</p>
        </div>
        <form className="self-love-form-row" onSubmit={handleAddThought}>
          <input
            type="text"
            placeholder="Ex. Je dois être parfait·e."
            value={thoughtDraft}
            onChange={(event) => setThoughtDraft(event.target.value)}
          />
          <button type="submit">Ajouter</button>
        </form>
        <div className="self-love-thoughts">
          {state.thoughts.map((thought) => {
            const releasing = releasingThoughtIds.has(thought.id)
            return (
              <button
                type="button"
                key={thought.id}
                className={
                  releasing ? 'self-love-thought self-love-thought--releasing' : 'self-love-thought'
                }
                onClick={() => handleReleaseThought(thought.id)}
              >
                <span>{thought.text}</span>
                <em>Clique pour la dissoudre</em>
              </button>
            )
          })}
          {state.thoughts.length === 0 ? (
            <div className="self-love-thought self-love-thought--empty">
              <span>Plus aucune pensée limitante ici. Bravo !</span>
            </div>
          ) : null}
        </div>
      </section>

      <section className="self-love-section self-love-section--extras">
        <div className="self-love-extras">
          <article className="self-love-card self-love-card--affirmation">
            <h3>Affirmation du jour</h3>
            <p>{affirmationOfDay}</p>
          </article>
          <article className="self-love-card self-love-card--quote">
            <h3>Inspiration</h3>
            <p>{quoteOfDay}</p>
          </article>
          <article className="self-love-card self-love-card--journal">
            <h3>Journal d'amour-propre</h3>
            <form onSubmit={handleAddJournalEntry}>
              <textarea
                rows={3}
                placeholder="Écris une phrase de gratitude envers toi-même..."
                value={journalDraft}
                onChange={(event) => setJournalDraft(event.target.value)}
              />
              <button type="submit">Ajouter</button>
            </form>
            <ul>
              {state.journal.map((entry) => (
                <li key={entry.id}>
                  <span>{formatDate(entry.createdAt)}</span>
                  <p>{entry.text}</p>
                </li>
              ))}
              {state.journal.length === 0 ? (
                <li className="self-love-card__empty">Écris ta première lettre d'amour.</li>
              ) : null}
            </ul>
          </article>
          <article className="self-love-card self-love-card--music">
            <h3>Ambiance bien-être</h3>
            <p>Laisse cette playlist t'accompagner dans ta bulle de douceur.</p>
            <iframe
              title="Playlist bien-être"
              src="https://open.spotify.com/embed/playlist/37i9dQZF1DX3rxVfibe1L0?utm_source=generator"
              width="100%"
              height="152"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            />
          </article>
        </div>
      </section>

      <section className="self-love-section self-love-section--certificate">
        <div className="self-love-certificate">
          <h2>✨ Certifiée Pure Beauté ✨</h2>
          <p className="self-love-certificate__subtitle">
            Savoure ton éclat. Cette image est ton rappel que tu es déjà assez.
          </p>
          <div className="self-love-certificate__canvas">
            {certificateImage ? (
              <img src={certificateImage} alt="Portrait célébré" />
            ) : (
              <div className="self-love-certificate__placeholder">
                <span role="img" aria-label="sparkles">
                  ✨
                </span>
                <p>Ajoute une photo pour rayonner en grand.</p>
              </div>
            )}
          </div>
          <div className="self-love-certificate__controls">
            <label className="self-love-certificate__upload">
              <input type="file" accept="image/*" onChange={handleCertificatePhotoChange} />
              <span>Choisir une photo</span>
            </label>
            {state.certificatePhoto ? (
              <button type="button" onClick={handleClearCertificatePhoto}>
                Retirer
              </button>
            ) : null}
          </div>
          <button type="button" className="self-love-certificate__share" onClick={handleShareCertificate}>
            Partager mon certificat d'amour de soi
          </button>
        </div>
      </section>
    </div>
  )
}

export default SelfLovePage
