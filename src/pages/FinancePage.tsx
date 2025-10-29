import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'

type ExpenseCategory =
  | 'food'
  | 'housing'
  | 'transport'
  | 'clothing'
  | 'beauty'
  | 'leisure'
  | 'health'

type Expense = {
  id: string
  label: string
  amount: number
  category: ExpenseCategory
  date: string
}

type ExpenseDraft = {
  label: string
  amount: string
  category: ExpenseCategory
  date: string
}

const categoryDefinitions: Record<ExpenseCategory, { label: string; color: string }> = {
  food: { label: 'Nourriture', color: '#FECACA' },
  housing: { label: 'Logement', color: '#FBCFE8' },
  transport: { label: 'Transport', color: '#C7D2FE' },
  clothing: { label: 'Vetements', color: '#FDE68A' },
  beauty: { label: 'Produits de beaute', color: '#FBCFE8' },
  leisure: { label: 'Loisirs', color: '#BBF7D0' },
  health: { label: 'Sante', color: '#BFDBFE' },
}

const euroFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
})

const getTodayISO = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = `${today.getMonth() + 1}`.padStart(2, '0')
  const day = `${today.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

const initialExpenses: Expense[] = []

const FinancePage = () => {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses)
  const [draft, setDraft] = useState<ExpenseDraft>(() => ({
    label: '',
    amount: '',
    category: 'food',
    date: getTodayISO(),
  }))

  const totals = useMemo(() => {
    return expenses.reduce<Record<ExpenseCategory, number>>((accumulator, expense) => {
      accumulator[expense.category] = (accumulator[expense.category] ?? 0) + expense.amount
      return accumulator
    }, {
      food: 0,
      housing: 0,
      transport: 0,
      clothing: 0,
      beauty: 0,
      leisure: 0,
      health: 0,
    })
  }, [expenses])

  const totalSpent = useMemo(
    () => expenses.reduce((sum, expense) => sum + expense.amount, 0),
    [expenses],
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

  const handleDraftChange = <Field extends keyof ExpenseDraft>(field: Field, value: ExpenseDraft[Field]) => {
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

    const nextExpense: Expense = {
      id: `expense-${Date.now()}`,
      label: draft.label.trim().length > 0 ? draft.label.trim() : 'Depense',
      amount: Math.round(amountValue * 100) / 100,
      category: draft.category,
      date: draft.date,
    }

    setExpenses((previous) => [nextExpense, ...previous])
    setDraft({ label: '', amount: '', category: draft.category, date: draft.date })
  }

  return (
    <div className="finance-page">
      <header className="finance-header">
        <div>
          <h1>Tableau finances</h1>
          <p>Observe tes depenses et garde le cap sur ton plan d'epargne.</p>
        </div>
        <div className="finance-total">
          <span>Total depenses ce mois</span>
          <strong>{euroFormatter.format(totalSpent)}</strong>
        </div>
      </header>

      <section className="finance-summary">
        <h2>Repartition par categorie</h2>
        <div className="finance-summary__grid">
          {Object.entries(totals).map(([categoryKey, amount]) => {
            const definition = categoryDefinitions[categoryKey as ExpenseCategory]
            return (
              <article key={categoryKey} className="finance-summary__card" style={{ borderColor: definition.color }}>
                <span className="finance-summary__label">{definition.label}</span>
                <strong className="finance-summary__value">{euroFormatter.format(amount)}</strong>
              </article>
            )
          })}
        </div>
      </section>

      {savingsIdea && (
        <section className="finance-tip">
          <h2>Astuce epargne</h2>
          <p>
            En visant {euroFormatter.format(savingsIdea.target)} pour {savingsIdea.label}, tu economises{' '}
            {euroFormatter.format(savingsIdea.current - savingsIdea.target)} ce mois-ci.
          </p>
        </section>
      )}

      <section className="finance-form">
        <h2>Ajouter une depense</h2>
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

      <section className="finance-history">
        <h2>Historique du mois</h2>
        {expenses.length === 0 ? (
          <p className="finance-history__empty">Aucune depense enregistree pour le moment.</p>
        ) : (
          <ul className="finance-history__list">
            {expenses.map((expense) => {
              const definition = categoryDefinitions[expense.category]
              return (
                <li key={expense.id} className="finance-history__item">
                  <div className="finance-history__meta">
                    <span className="finance-history__label">{expense.label}</span>
                    <span className="finance-history__date">{expense.date}</span>
                  </div>
                  <div className="finance-history__amount" style={{ color: definition.color }}>
                    {euroFormatter.format(expense.amount)}
                  </div>
                  <span className="finance-history__category">{definition.label}</span>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}

export default FinancePage
