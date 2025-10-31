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
  profilePhoto: string | null
  profileName: string
  profileLine2: string
  profileLine3: string
  profileBio: string
  profilePinterest: string
  profileSpotify: string
  likesNote: string
  dislikesNote: string
  certificatePhoto: string | null
  photos: SelfLovePhotoSlot[]
  qualities: SelfLoveQuality[]
  thoughts: SelfLoveThought[]
  journal: SelfLoveJournalEntry[]
}

const PHOTO_SLOT_COUNT = 6

const createDefaultState = (): SelfLoveState => ({
  profilePhoto: null,
  profileName: 'Ton pseudo',
  profileLine2: '',
  profileLine3: '',
  profileBio: 'Quelques mots pour te d\u00e9crire avec amour.',
  profilePinterest: '',
  profileSpotify: '',
  likesNote: '',
  dislikesNote: '',
  certificatePhoto: null,
  photos: Array.from({ length: PHOTO_SLOT_COUNT }, (_, index) => ({
    id: `photo-${index}`,
    dataUrl: null,
  })),
  qualities: [
    { id: 'quality-1', text: 'Mon sourire illumine les gens.' },
    { id: 'quality-2', text: 'Je rayonne de douceur.' },
    { id: 'quality-3', text: 'Je sais écouter avec le cœur.' },
  ],
  thoughts: [
    { id: 'thought-1', text: 'Je ne suis pas assez.' },
    { id: 'thought-2', text: 'Je dois tout contrôler.' },
    { id: 'thought-3', text: 'Je ne mérite pas ce que j'ai.' },
  ],
  journal: [],
})

const affirmations = [
  "Je m'offre la mÃªme douceur que je donne aux autres.",
  'Je suis dÃ©jÃ  assez et je le reste Ã  chaque souffle.',
  'Ma prÃ©sence est un cadeau pour ce monde.',
  "Je choisis de me regarder avec de l'amour aujourd'hui.",
  'Je laisse ma lumiÃ¨re briller sans me cacher.',
  'Je suis digne de tendresse, de joie et de paix.',
]

const inspiringQuotes = [
  'â€œS"aimer soi-mÃªme est le dÃ©but d"une histoire d"amour qui dure toute la vie.â€ \u2014 Oscar Wilde',
  'â€œTu es ton propre refuge. Tu es ton propre soleil.â€',
  'â€œTu es le r\u00e9sultat de l\u2019amour de toutes les femmes qui t\u2019ont pr\u00e9c\u00e9d\u00e9e.â€',
  'â€œN\u2019oublie pas de t\u2019\u00e9merveiller de ta force douce.â€',
  'â€œTu es une oeuvre en mouvement, magnifique \u00e0 chaque \u00e9tape.â€',
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

  const hasPinterestLink = state.profilePinterest.trim().length > 0
  const hasSpotifyLink = state.profileSpotify.trim().length > 0

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

  const handleProfilePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : null
      setState((previous) => ({ ...previous, profilePhoto: result }))
    }
    reader.readAsDataURL(file)
  }

  const handleClearProfilePhoto = () => {
    setState((previous) => ({ ...previous, profilePhoto: null }))
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

  const handleLikesChange = (value: string) => {
    setState((previous) => ({ ...previous, likesNote: value }))
  }

  const handleDislikesChange = (value: string) => {
    setState((previous) => ({ ...previous, dislikesNote: value }))
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

  const normaliseLink = (value: string) => {
    if (!value) {
      return ''
    }
    const trimmed = value.trim()
    if (trimmed.length === 0) {
      return ''
    }
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  }

  const handleOpenLink = (value: string) => {
    const href = normaliseLink(value)
    if (href.length === 0) {
      return
    }
    window.open(href, '_blank', 'noopener')
  }

  const handleShareCertificate = async () => {
    const qualities = state.qualities.map((quality) => `\u2022 ${quality.text}`).join('\n')
    const shareText = [
      'âœ¨ Certificat de pure beaut\u00e9 âœ¨',
      '',
      'Je c\u00e9l\u00e8bre la personne que je suis :',
      qualities.length > 0 ? qualities : "\u2022 Je m'aime pour qui je suis.",
      '',
      affirmationOfDay,
    ]
      .filter(Boolean)
      .join('\n')

    try {
      await navigator.clipboard.writeText(shareText)
      window.alert('Ton certificat a \u00e9t\u00e9 copi\u00e9. Partage-le avec amour !')
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
          <h1>S'aimer soi-mÃªme</h1>
          <p>Tu es dÃ©jÃ  assez. Prends un moment pour te cÃ©lÃ©brer.</p>
        </div>
        <div className="self-love-hero__glow" aria-hidden="true" />
      </header>

            <section className="self-love-profile">
        <div className="self-love-profile__card">
          <div className="self-love-profile__avatar">
            {state.profilePhoto ? (
              <img src={state.profilePhoto} alt="Portrait de profil" />
            ) : (
              <span role="img" aria-label="profile" className="self-love-profile__placeholder">
                🌸
              </span>
            )}
            <label className="self-love-profile__upload">
              <input type="file" accept="image/*" onChange={handleProfilePhotoChange} />
              <span>Changer la photo</span>
            </label>
            {state.profilePhoto ? (
              <button type="button" onClick={handleClearProfilePhoto}>
                Retirer
              </button>
            ) : null}
          </div>
          <div className="self-love-profile__identity">
            <label>
              <span>Pseudo</span>
              <input
                type="text"
                value={state.profileName}
                onChange={(event) => {
                  const value = event.target.value
                  setState((previous) => ({ ...previous, profileName: value }))
                }}
                placeholder="Ton surnom"
              />
            </label>
            <label>
              <span>Ligne douceur</span>
              <input
                type="text"
                value={state.profileLine2}
                onChange={(event) => {
                  const value = event.target.value
                  setState((previous) => ({ ...previous, profileLine2: value }))
                }}
                placeholder="18 juillet 2002"
              />
            </label>
            <label>
              <span>Ligne astro ou mood</span>
              <input
                type="text"
                value={state.profileLine3}
                onChange={(event) => {
                  const value = event.target.value
                  setState((previous) => ({ ...previous, profileLine3: value }))
                }}
                placeholder="Cancer · Soleil levant"
              />
            </label>
          </div>
          <label className="self-love-profile__bio">
            <span>Mini description</span>
            <textarea
              rows={3}
              value={state.profileBio}
              onChange={(event) => {
                const value = event.target.value
                setState((previous) => ({ ...previous, profileBio: value }))
              }}
              placeholder="Partage un petit mantra ou une phrase qui te ressemble."
            />
          </label>
          <div className="self-love-profile__links">
            <label>
              <span>Lien Pinterest</span>
              <input
                type="url"
                value={state.profilePinterest}
                onChange={(event) => {
                  const value = event.target.value
                  setState((previous) => ({ ...previous, profilePinterest: value }))
                }}
                placeholder="https://..."
              />
            </label>
            <label>
              <span>Lien Spotify</span>
              <input
                type="url"
                value={state.profileSpotify}
                onChange={(event) => {
                  const value = event.target.value
                  setState((previous) => ({ ...previous, profileSpotify: value }))
                }}
                placeholder="https://..."
              />
            </label>
            <div className="self-love-profile__buttons">
              <button
                type="button"
                className={state.profilePinterest.trim().length > 0 ? 'self-love-profile__button' : 'self-love-profile__button disabled'}
                onClick={() => handleOpenLink(state.profilePinterest)}
              >
                Pinterest
              </button>
              <button
                type="button"
                className={state.profileSpotify.trim().length > 0 ? 'self-love-profile__button' : 'self-love-profile__button disabled'}
                onClick={() => handleOpenLink(state.profileSpotify)}
              >
                Spotify
              </button>
            </div>
          </div>
        </div>

        <div className="self-love-profile__notes">
          <article className="self-love-note">
            <h3>J'aime</h3>
            <textarea
              rows={5}
              value={state.likesNote}
              onChange={(event) => handleLikesChange(event.target.value)}
              placeholder="Ce qui te fait vibrer, ce qui te donne le sourire..."
            />
          </article>
          <article className="self-love-note">
            <h3>Je n'aime pas</h3>
            <textarea
              rows={5}
              value={state.dislikesNote}
              onChange={(event) => handleDislikesChange(event.target.value)}
              placeholder="Ce que tu choisis de laisser derrière toi."
            />
          </article>
        </div>
      </section>
<section className="self-love-section self-love-section--photos">
        <div className="self-love-section__header">
          <h2>Aime-toi !</h2>
          <p>Regarde-toi avec bienveillance et choisis 6 moments ou tu te sens rayonnante.</p>
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
                        ðŸªž
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
                  <span className="self-love-photo-card__hint">Ajoute ton sourire</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="self-love-duo">
        <div className="self-love-section self-love-section--qualities">
          <div className="self-love-section__header">
            <h2>Ce que j'aime chez moi</h2>
            <p>Note tes qualités, tes victoires, tout ce qui te rend fière.</p>
          </div>
          <form className="self-love-form-row" onSubmit={handleAddQuality}>
            <input
              type="text"
              placeholder="Ex. Ma douceur rassure les autres"
              value={qualityDraft}
              onChange={(event) => setQualityDraft(event.target.value)}
            />
            <button type="submit">+ Ajouter une qualite</button>
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
        </div>

        <div className="self-love-section self-love-section--thoughts">
          <div className="self-love-section__header">
            <h2>Pensées a oublier</h2>
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
                placeholder="Ecris une phrase de gratitude envers toi-m\u00eame..."
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
                <li className="self-love-card__empty">Ecris ta premiÃ¨re lettre d'amour.</li>
              ) : null}
            </ul>
          </article>
          <article className="self-love-card self-love-card--music">
            <h3>Ambiance bien-Ãªtre</h3>
            <p>Laisse cette playlist t'accompagner dans ta bulle de douceur.</p>
            <iframe
              title="Playlist bien-\u00eatre"
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
          <h2>âœ¨ CertifiÃ©e pure beautÃ©e âœ¨</h2>
          <div className="self-love-certificate__canvas">
            {certificateImage ? (
              <img src={certificateImage} alt="Portrait c\u00e9l\u00e9br\u00e9" />
            ) : (
              <div className="self-love-certificate__placeholder">
                <span role="img" aria-label="sparkles">
                  âœ¨
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











