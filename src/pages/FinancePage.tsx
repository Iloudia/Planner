import type { FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import usePersistentState from '../hooks/usePersistentState'
import financeMood01 from '../assets/planner-04.jpg'
import financeMood02 from '../assets/planner-07.jpg'
import financeMood03 from '../assets/planner-02.jpg'

type ExpenseCategory =
  | 'food'
  | 'housing'
  | 'transport'
  | 'clothing'
  | 'beauty'
  | 'leisure'
  | 'health'
  | 'friends'

type FlowDirection = 'in' | 'out'

type StoredFinanceEntry = {
  id: string
  label: string
  amount: number
  date: string
  category?: ExpenseCategory
  direction?: FlowDirection
}

type FinanceEntry = {
  id: string
  label: string
  amount: number
  date: string
  direction: FlowDirection
  category?: ExpenseCategory
}

type FinanceDraft = {
  label: string
  amount: string
  category: ExpenseCategory
  date: string
  direction: FlowDirection
}

type MonthlySnapshot = {
  startingAmount: number
}

type PieSegment = {
  label: string
  value: number
  color: string
}

type BalanceTimelinePoint = {
  date: string
  label: string
  balance: number
}

const categoryDefinitions: Record<ExpenseCategory, { label: string; color: string }> = {
  food: { label: 'Courses et alimentation', color: '#FECACA' },
  housing: { label: 'Logement et charges', color: '#FBCFE8' },
  transport: { label: 'Abonnements', color: '#C7D2FE' },
  clothing: { label: 'Shopping', color: '#FDE68A' },
  beauty: { label: 'Restaurants et bars', color: '#FBCFE8' },
  leisure: { label: 'Loisirs', color: '#BBF7D0' },
  health: { label: 'Taxes et impots', color: '#BFDBFE' },
  friends: { label: 'Amis', color: '#FCA5A5' },
}

const financeMoodboard = [
  { src: financeMood01, alt: 'Moodboard budget' },
  { src: financeMood02, alt: 'Carnet d\'épargne inspiré' },
  { src: financeMood03, alt: 'Planification creative' },
] as const

const financeInspirationImage = financeMoodboard[1]

const euroFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
})

const percentFormatter = new Intl.NumberFormat('fr-FR', {
  maximumFractionDigits: 1,
})

const monthFormatter = new Intl.DateTimeFormat('fr-FR', {
  month: 'long',
  year: 'numeric',
})

const formatDateToISO = (date: Date) => {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getTodayISO = () => formatDateToISO(new Date())

const getMonthKeyFromDate = (date: Date) => `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}`

const getMonthKeyFromISO = (value: string) => (value.length >= 7 ? value.slice(0, 7) : '')

const capitalize = (value: string) => (value.length === 0 ? value : value[0].toUpperCase() + value.slice(1))

const parseMonthKeyToDate = (monthKey: string) => {
  const [yearString, monthString] = monthKey.split('-')
  const year = Number(yearString)
  const month = Number(monthString)
  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    return new Date()
  }
  return new Date(year, month - 1, 1)
}

const formatMonthKey = (monthKey: string) => capitalize(monthFormatter.format(parseMonthKeyToDate(monthKey)))

const getDefaultDateForMonth = (monthKey: string) => {
  const today = new Date()
  if (getMonthKeyFromDate(today) === monthKey) {
    return getTodayISO()
  }
  return `${monthKey}-01`
}

const roundCurrency = (value: number) => Math.round(value * 100) / 100

const formatSignedCurrency = (value: number) => {
  if (value === 0) {
    return euroFormatter.format(0)
  }
  const formatted = euroFormatter.format(Math.abs(value))
  return value > 0 ? `+${formatted}` : `-${formatted}`
}

const formatSignedPercentage = (value: number) => {
  if (!Number.isFinite(value) || value === 0) {
    return '0 %'
  }
  const formatted = percentFormatter.format(Math.abs(value))
  return value > 0 ? `+${formatted} %` : `-${formatted} %`
}

const buildPieGradient = (segments: PieSegment[]) => {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0)
  if (total <= 0) {
    return 'conic-gradient(#e2e8f0 0deg, #e2e8f0 360deg)'
  }
  let startAngle = 0
  const stops = segments.map((segment) => {
    const angle = (segment.value / total) * 360
    const endAngle = startAngle + angle
    const stop = `${segment.color} ${startAngle.toFixed(2)}deg ${endAngle.toFixed(2)}deg`
    startAngle = endAngle
    return stop
  })
  return `conic-gradient(${stops.join(', ')})`
}

const createEmptyCategoryTotals = (): Record<ExpenseCategory, number> => ({
  food: 0,
  housing: 0,
  transport: 0,
  clothing: 0,
  beauty: 0,
  leisure: 0,
  health: 0,
  friends: 0,
})

const EXPENSES_STORAGE_KEY = 'planner.finance.expenses'
const MONTHLY_SNAPSHOT_STORAGE_KEY = 'planner.finance.monthlySnapshots'

const FinancePage = () => {
  const [storedEntries, setStoredEntries] = usePersistentState<StoredFinanceEntry[]>(EXPENSES_STORAGE_KEY, () => [])
  const [monthlySnapshots, setMonthlySnapshots] = usePersistentState<Record<string, MonthlySnapshot>>(
    MONTHLY_SNAPSHOT_STORAGE_KEY,
    () => ({}),
  )

  const [draft, setDraft] = useState<FinanceDraft>(() => ({
    label: '',
    amount: '',
    category: 'food',
    date: getTodayISO(),
    direction: 'out',
  }))
  const [showFullHistory, setShowFullHistory] = useState(false)

  useEffect(() => {
    document.body.classList.add('planner-page--white')
    return () => {
      document.body.classList.remove('planner-page--white')
    }
  }, [])

  const entries = useMemo<FinanceEntry[]>(
    () =>
      storedEntries.map((entry) => ({
        ...entry,
        direction: entry.direction ?? 'out',
      })),
    [storedEntries],
  )

  const currentDate = useMemo(() => new Date(), [])
  const currentMonthKey = useMemo(() => getMonthKeyFromDate(currentDate), [currentDate])

  const monthOptions = useMemo(() => {
    const keySet = new Set<string>()
    entries.forEach((entry) => {
      const key = getMonthKeyFromISO(entry.date)
      if (key) {
        keySet.add(key)
      }
    })
    Object.keys(monthlySnapshots).forEach((key) => {
      if (key) {
        keySet.add(key)
      }
    })
    keySet.add(currentMonthKey)
    return Array.from(keySet).sort((a, b) => b.localeCompare(a))
  }, [entries, monthlySnapshots, currentMonthKey])

  const [selectedMonthKey, setSelectedMonthKey] = useState(() => currentMonthKey)

  useEffect(() => {
    if (monthOptions.length === 0) {
      return
    }
    if (!monthOptions.includes(selectedMonthKey)) {
      setSelectedMonthKey(monthOptions[0] ?? currentMonthKey)
    }
  }, [monthOptions, selectedMonthKey, currentMonthKey])

  const selectedMonthLabel = useMemo(() => formatMonthKey(selectedMonthKey), [selectedMonthKey])

  useEffect(() => {
    setDraft((previous) => {
      const previousMonthKey = getMonthKeyFromISO(previous.date)
      if (previousMonthKey === selectedMonthKey && previous.date) {
        return previous
      }
      return {
        ...previous,
        date: getDefaultDateForMonth(selectedMonthKey),
      }
    })
  }, [selectedMonthKey])

  const selectedMonthEntries = useMemo(() => {
    const filtered = entries.filter((entry) => getMonthKeyFromISO(entry.date) === selectedMonthKey)
    return filtered.sort((a, b) => {
      if (a.date === b.date) {
        return b.id.localeCompare(a.id)
      }
      return b.date.localeCompare(a.date)
    })
  }, [entries, selectedMonthKey])

  const monthlyOutflows = useMemo(
    () => selectedMonthEntries.filter((entry) => entry.direction === 'out'),
    [selectedMonthEntries],
  )

  const monthlyInflows = useMemo(
    () => selectedMonthEntries.filter((entry) => entry.direction === 'in'),
    [selectedMonthEntries],
  )

  const totals = useMemo(() => {
    return monthlyOutflows.reduce<Record<ExpenseCategory, number>>((accumulator, entry) => {
      if (!entry.category) {
        return accumulator
      }
      accumulator[entry.category] = (accumulator[entry.category] ?? 0) + entry.amount
      return accumulator
    }, createEmptyCategoryTotals())
  }, [monthlyOutflows])

  const totalSpent = useMemo(
    () => roundCurrency(monthlyOutflows.reduce((sum, entry) => sum + entry.amount, 0)),
    [monthlyOutflows],
  )

  const totalIncome = useMemo(
    () => roundCurrency(monthlyInflows.reduce((sum, entry) => sum + entry.amount, 0)),
    [monthlyInflows],
  )

  const netCashflow = useMemo(
    () => roundCurrency(totalIncome - totalSpent),
    [totalIncome, totalSpent],
  )

  const topCategories = useMemo(() => {
    return Object.entries(totals)
      .filter(([, amount]) => amount > 0)
      .sort(([, amountA], [, amountB]) => amountB - amountA)
      .slice(0, 3)
  }, [totals])

  const savingsIdea = useMemo(() => {
    if (topCategories.length === 0) {
      return null
    }
    const [categoryKey, amount] = topCategories[0]
    const definition = categoryDefinitions[categoryKey as ExpenseCategory]
    const target = amount * 0.9
    return {
      label: definition.label,
      current: amount,
      target,
    }
  }, [topCategories])

  const selectedSnapshot = monthlySnapshots[selectedMonthKey]
  const startingAmountValue = selectedSnapshot?.startingAmount ?? 0

  const endingAmount = useMemo(
    () => roundCurrency(startingAmountValue + netCashflow),
    [startingAmountValue, netCashflow],
  )

  const savedAmount = useMemo(
    () => roundCurrency(endingAmount - startingAmountValue),
    [endingAmount, startingAmountValue],
  )

  const savingsPercentage = useMemo(() => {
    if (startingAmountValue <= 0) {
      return 0
    }
    return (savedAmount / startingAmountValue) * 100
  }, [savedAmount, startingAmountValue])

  const pieSegments = useMemo<PieSegment[]>(
    () =>
      (Object.entries(totals) as Array<[ExpenseCategory, number]>)
        .filter(([, value]) => value > 0)
        .map(([category, value]) => ({
          label: categoryDefinitions[category].label,
          value,
          color: categoryDefinitions[category].color,
        })),
    [totals],
  )

  const pieBackground = useMemo(() => buildPieGradient(pieSegments), [pieSegments])
  const hasPieData = pieSegments.length > 0

  const balanceTimeline = useMemo<BalanceTimelinePoint[]>(() => {
    const monthStart = parseMonthKeyToDate(selectedMonthKey)
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0)
    const dailyChanges = new Map<string, number>()

    selectedMonthEntries.forEach((entry) => {
      const delta = entry.direction === 'in' ? entry.amount : -entry.amount
      const existing = dailyChanges.get(entry.date) ?? 0
      dailyChanges.set(entry.date, roundCurrency(existing + delta))
    })

    const points: BalanceTimelinePoint[] = []
    let runningBalance = startingAmountValue

    points.push({
      date: formatDateToISO(monthStart),
      label: 'Début',
      balance: runningBalance,
    })

    for (let day = new Date(monthStart); day <= monthEnd; day.setDate(day.getDate() + 1)) {
      const key = formatDateToISO(day)
      const change = dailyChanges.get(key)
      if (change) {
        runningBalance = roundCurrency(runningBalance + change)
      }
      points.push({
        date: key,
        label: day.getDate().toString(),
        balance: runningBalance,
      })
    }

    return points
  }, [selectedMonthEntries, selectedMonthKey, startingAmountValue])

  const [startingAmountDraft, setStartingAmountDraft] = useState(() =>
    selectedSnapshot?.startingAmount !== undefined ? selectedSnapshot.startingAmount.toString() : '',
  )

  useEffect(() => {
    if (selectedSnapshot?.startingAmount !== undefined) {
      setStartingAmountDraft(selectedSnapshot.startingAmount.toString())
    } else {
      setStartingAmountDraft('')
    }
  }, [selectedSnapshot, selectedMonthKey])

  useEffect(() => {
    setShowFullHistory(false)
  }, [selectedMonthKey])

  const visibleHistory = useMemo(
    () => (showFullHistory ? selectedMonthEntries : selectedMonthEntries.slice(0, 5)),
    [selectedMonthEntries, showFullHistory],
  )

  const hasHistoryToggle = selectedMonthEntries.length > 5

  const handleDraftChange = <Field extends keyof FinanceDraft>(field: Field, value: FinanceDraft[Field]) => {
    setDraft((previous) => ({
      ...previous,
      [field]: value,
    }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const amountValue = parseFloat(draft.amount.replace(',', '.'))
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      return
    }

    const trimmedLabel = draft.label.trim()
    const nextEntry: StoredFinanceEntry = {
      id: `finance-${Date.now()}`,
      label: trimmedLabel.length > 0 ? trimmedLabel : draft.direction === 'in' ? 'Revenus' : 'Dépense',
      amount: roundCurrency(amountValue),
      date: draft.date,
      direction: draft.direction,
      ...(draft.direction === 'out' ? { category: draft.category } : {}),
    }

    setStoredEntries((previous) => {
      const nextEntries = [nextEntry, ...previous]
      return nextEntries.sort((a, b) => {
        if (a.date === b.date) {
          return b.id.localeCompare(a.id)
        }
        return b.date.localeCompare(a.date)
      })
    })
    setDraft((previous) => ({
      ...previous,
      label: '',
      amount: '',
    }))
  }

  const handleStartingAmountSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedValue = startingAmountDraft.replace(',', '.').trim()
    if (normalizedValue.length === 0) {
      setMonthlySnapshots((previous) => {
        const next = { ...previous }
        delete next[selectedMonthKey]
        return next
      })
      return
    }
    const parsed = parseFloat(normalizedValue)
    if (!Number.isFinite(parsed) || parsed < 0) {
      return
    }
    const rounded = roundCurrency(parsed)
    setMonthlySnapshots((previous) => ({
      ...previous,
      [selectedMonthKey]: {
        startingAmount: rounded,
      },
    }))
  }

  return (
    <div className="finance-page aesthetic-page">
      <div className="finance-page__breadcrumb">finances</div>
      <div className="finance-page__accent-bar" aria-hidden="true" />

      <section className="finance-hero dashboard-panel">
        <div className="finance-hero__content">
          <span className="finance-hero__eyebrow">tableau finances</span>
          <h1>Mon panorama budget</h1>

          <div className="finance-hero__stats">
            <article>
              <span>Total dépenses du mois</span>
              <strong>{euroFormatter.format(totalSpent)}</strong>
            </article>
            <article>
              <span>Variation nette</span>
              <strong>{formatSignedCurrency(netCashflow)}</strong>
            </article>
            <article>
              <span>Economies</span>
              <strong>{formatSignedCurrency(savedAmount)}</strong>
            </article>
          </div>

          <div className="finance-hero__period">
            <span className="finance-hero__badge">{selectedMonthLabel}</span>
            {monthOptions.length > 0 && (
              <select
                className="finance-hero__select"
                value={selectedMonthKey}
                onChange={(event) => setSelectedMonthKey(event.target.value)}
              >
                {monthOptions.map((monthKey) => (
                  <option key={monthKey} value={monthKey}>
                    {formatMonthKey(monthKey)}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="finance-hero__gallery" aria-hidden="true">
          {financeMoodboard.map((image, index) => (
            <div key={image.src} className={`finance-hero__photo finance-hero__photo--${index + 1}`}>
              <img src={image.src} alt={image.alt} />
            </div>
          ))}
        </div>
      </section>

      <section className="finance-dashboard">
        <div className="finance-dashboard__main">
          <section className="finance-summary dashboard-panel">
            <header className="finance-section-header">
              <span className="finance-section-header__eyebrow">couleurs de dépenses</span>
              <div>
                <h2>Répartition par catégorie</h2>
                <p>Visualise où part ton énergie financière avec une palette ultra douce.</p>
              </div>
            </header>
            <div className="finance-summary__grid">
              {Object.entries(totals).map(([categoryKey, amount]) => {
                const definition = categoryDefinitions[categoryKey as ExpenseCategory]
                return (
                  <article
                    key={categoryKey}
                    className="finance-summary__card"
                    style={{ borderColor: definition.color, boxShadow: `0 32px 60px ${definition.color}33` }}
                  >
                    <span className="finance-summary__label">{definition.label}</span>
                    <strong className="finance-summary__value">{euroFormatter.format(amount)}</strong>
                  </article>
                )
              })}
            </div>
          </section>

          {savingsIdea && (
            <section className="finance-tip dashboard-panel">
              <header className="finance-section-header">
                <span className="finance-section-header__eyebrow">idée douceur</span>
                <h2>Astuce épargne</h2>
              </header>
              <p>
                En visant {euroFormatter.format(savingsIdea.target)} pour {savingsIdea.label}, tu économises{' '}
                {euroFormatter.format(savingsIdea.current - savingsIdea.target)} ce mois-ci.
              </p>
            </section>
          )}

          <section className="finance-form dashboard-panel">
            <header className="finance-section-header">
              <span className="finance-section-header__eyebrow">ajoute ton mouvement</span>
              <h2>Ajouter une dépense</h2>
            </header>
            <form onSubmit={handleSubmit} className="finance-form__grid">
              <label className="finance-form__field">
                <span>Intitule</span>
                <input
                  type="text"
                  value={draft.label}
                  onChange={(event) => handleDraftChange('label', event.target.value)}
                  placeholder="Ex: Courses semaine"
                />
              </label>
              <label className="finance-form__field">
                <span>Montant</span>
                <input
                  type="text"
                  value={draft.amount}
                  onChange={(event) => handleDraftChange('amount', event.target.value)}
                  placeholder="Ex: 45.90"
                  required
                />
              </label>
              <label className="finance-form__field">
                <span>Type</span>
                <select
                  value={draft.direction}
                  onChange={(event) => handleDraftChange('direction', event.target.value as FlowDirection)}
                >
                  <option value="out">Dépense</option>
                  <option value="in">Revenus</option>
                </select>
              </label>
              {draft.direction === 'out' && (
                <label className="finance-form__field">
                  <span>Categorie</span>
                  <select
                    value={draft.category}
                    onChange={(event) => handleDraftChange('category', event.target.value as ExpenseCategory)}
                  >
                    {Object.entries(categoryDefinitions).map(([value, definition]) => (
                      <option key={value} value={value}>
                        {definition.label}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <label className="finance-form__field">
                <span>Date</span>
                <input
                  type="date"
                  value={draft.date}
                  onChange={(event) => handleDraftChange('date', event.target.value)}
                  required
                />
              </label>
              <button type="submit" className="finance-form__submit">
                Ajouter
              </button>
            </form>
          </section>

          <section className="finance-inspiration dashboard-panel">
            <img src={financeInspirationImage.src} alt={financeInspirationImage.alt} />
          </section>
        </div>

        <aside className="finance-dashboard__aside">
          <section className="finance-balance dashboard-panel">
            <header className="finance-section-header finance-section-header--vertical">
              <span className="finance-section-header__eyebrow">suivi du mois</span>
              <div>
                <h2>Balance du mois</h2>
                <p>Configure ton montant initial pour suivre au plus pres tes mouvements.</p>
              </div>
            </header>
            <form className="finance-balance__form" onSubmit={handleStartingAmountSubmit}>
              <label className="finance-balance__field">
                <span>Argent au début du mois</span>
                <input
                  type="text"
                  value={startingAmountDraft}
                  onChange={(event) => setStartingAmountDraft(event.target.value)}
                  placeholder="Ex: 1200"
                />
              </label>
              <button type="submit" className="finance-balance__action">
                Enregistrer
              </button>
            </form>
            <div className="finance-balance__stats">
              <article className="finance-balance__stat">
                <span>Argent au début</span>
                <strong>{euroFormatter.format(startingAmountValue)}</strong>
              </article>
              <article className="finance-balance__stat">
                <span>Revenus</span>
                <strong>{formatSignedCurrency(totalIncome)}</strong>
              </article>
              <article className="finance-balance__stat">
                <span>Dépenses</span>
                <strong>{formatSignedCurrency(-totalSpent)}</strong>
              </article>
              <article className="finance-balance__stat">
                <span>Argent à la fin</span>
                <strong>{euroFormatter.format(endingAmount)}</strong>
                <small>
                  Economies: {formatSignedCurrency(savedAmount)} ({formatSignedPercentage(savingsPercentage)})
                </small>
              </article>
            </div>
            <div className="finance-balance__charts">
              <div className="finance-balance__chart-card">
                <h3>Diagramme en fromage</h3>
                {hasPieData ? (
                  <div className="finance-pie">
                    <div className="finance-pie__figure" style={{ backgroundImage: pieBackground }} />
                    <ul className="finance-pie__legend">
                      {pieSegments.map((segment) => (
                        <li key={segment.label}>
                          <span className="finance-pie__swatch" style={{ backgroundColor: segment.color }} />
                          <span className="finance-pie__label">{segment.label}</span>
                          <span className="finance-pie__value">{euroFormatter.format(segment.value)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="finance-balance__empty">Ajoute une dépense pour visualiser la répartition.</p>
                )}
              </div>
              <div className="finance-balance__chart-card">
                <h3>Diagramme en lignes</h3>
                <BalanceLineChart points={balanceTimeline} />
                <p className="finance-line-chart__caption">Variation nette: {formatSignedCurrency(netCashflow)}</p>
              </div>
            </div>
          </section>
        </aside>
      </section>

      <section className="finance-history dashboard-panel">
        <header className="finance-section-header">
          <span className="finance-section-header__eyebrow">mémoire du mois</span>
          <h2>Historique du mois</h2>
        </header>
        {selectedMonthEntries.length === 0 ? (
          <p className="finance-history__empty">Aucun mouvement enregistré pour {selectedMonthLabel}.</p>
        ) : (
          <>
            <ul className="finance-history__list">
              {visibleHistory.map((entry) => {
                const definition = entry.category ? categoryDefinitions[entry.category] : undefined
                const amountValue = entry.direction === 'out' ? -entry.amount : entry.amount
                const amountColor = entry.direction === 'in' ? '#16a34a' : definition?.color ?? '#1e1b4b'
                const categoryLabel = entry.direction === 'in' ? 'Revenus' : definition?.label ?? 'Dépense'
                return (
                  <li key={entry.id} className="finance-history__item">
                    <div className="finance-history__meta">
                      <span className="finance-history__label">{entry.label}</span>
                      <span className="finance-history__date">{entry.date}</span>
                    </div>
                    <div className="finance-history__amount" style={{ color: amountColor }}>
                      {formatSignedCurrency(amountValue)}
                    </div>
                    <span className="finance-history__category">{categoryLabel}</span>
                  </li>
                )
              })}
            </ul>
            {hasHistoryToggle && (
              <button
                type="button"
                className="finance-history__more"
                onClick={() => setShowFullHistory((previous) => !previous)}
              >
                {showFullHistory ? 'Afficher moins' : 'Afficher tout'}
              </button>
            )}
          </>
        )}
      </section>

      <div className="finance-page__footer-bar" aria-hidden="true" />
    </div>
  )
}

type BalanceLineChartProps = {
  points: BalanceTimelinePoint[]
}

const BalanceLineChart = ({ points }: BalanceLineChartProps) => {
  if (points.length === 0) {
    return <div className="finance-line-chart finance-line-chart--empty">Pas de données disponibles</div>
  }

  const values = points.map((point) => point.balance)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const rawRange = maxValue - minValue
  const safeRange = rawRange === 0 ? 1 : rawRange
  const verticalPadding = 12
  const horizontalStep = points.length > 1 ? 100 / (points.length - 1) : 0

  const coordinates = points.map((point, index) => {
    const x = points.length === 1 ? 50 : index * horizontalStep
    const y =
      rawRange === 0
        ? 50
        : verticalPadding + ((maxValue - point.balance) / safeRange) * (100 - verticalPadding * 2)
    return { x, y, point }
  })

  const firstX = coordinates[0]?.x ?? 0
  const lastX = coordinates[coordinates.length - 1]?.x ?? firstX
  const polylinePoints = coordinates.map(({ x, y }) => `${x},${y}`).join(' ')
  const areaPoints = [`${firstX},100`, ...coordinates.map(({ x, y }) => `${x},${y}`), `${lastX},100`].join(' ')

  const yTicks =
    rawRange === 0
      ? [{ value: maxValue, position: 50 }]
      : Array.from({ length: 5 }, (_, index) => {
          const value = maxValue - (index / 4) * rawRange
          const position =
            verticalPadding + ((maxValue - value) / safeRange) * (100 - verticalPadding * 2)
          return { value, position }
        })

  const labelStep = points.length > 1 ? Math.ceil(points.length / 6) : 1

  return (
    <div className="finance-line-chart">
      <div className="finance-line-chart__canvas">
        <svg className="finance-line-chart__svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          {yTicks.map((tick, index) => (
            <line
              key={`grid-${index}`}
              className="finance-line-chart__grid-line"
              x1="0"
              x2="100"
              y1={tick.position}
              y2={tick.position}
            />
          ))}
          <polygon className="finance-line-chart__area" points={areaPoints} />
          <polyline className="finance-line-chart__line" points={polylinePoints} />
          {coordinates.map(({ x, y, point }) => (
            <circle key={point.date} className="finance-line-chart__dot" cx={x} cy={y} r="1.6" />
          ))}
        </svg>
        <div className="finance-line-chart__y-labels">
          {yTicks.map((tick, index) => (
            <span key={`label-${index}`} style={{ top: `${tick.position}%` }}>
              {euroFormatter.format(roundCurrency(tick.value))}
            </span>
          ))}
        </div>
      </div>
      <div className="finance-line-chart__x-labels">
        {coordinates.map(({ x, point }, index) => {
          if (index !== 0 && index !== coordinates.length - 1 && index % labelStep !== 0) {
            return null
          }
          const label = index === 0 ? 'Début' : index === coordinates.length - 1 ? 'Fin' : point.label
          return (
            <span key={point.date} style={{ left: `${x}%` }}>
              {label}
            </span>
          )
        })}
      </div>
    </div>
  )
}

export default FinancePage



