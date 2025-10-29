export interface ScheduledTask {
  id: string
  title: string
  start: string
  end: string
  date: string
  color: string
  tag: string
}

export interface RoutineItem {
  id: string
  title: string
  detail?: string
}

export interface MonthlyReview {
  highlights: string[]
  lessons: string[]
  focusNextMonth: string[]
  metrics: Array<{ label: string; value: string }>
}

const now = new Date()
const currentYear = now.getFullYear()
const currentMonth = now.getMonth() + 1
const daysInMonth = new Date(currentYear, currentMonth, 0).getDate()

const pad = (value: number) => value.toString().padStart(2, '0')

const formatKey = (day: number) =>
  `${currentYear}-${pad(currentMonth)}-${pad(Math.min(day, daysInMonth))}`

const palette = ['#A5B4FC', '#7DD3FC', '#FBCFE8', '#BBF7D0', '#FDE68A']

const dayProfiles = [
  [
    { title: 'Sprint planning', start: '08:45', end: '09:30', tag: 'Strategie', color: palette[0] },
    { title: 'Bloc deep work', start: '10:00', end: '12:00', tag: 'Focus', color: palette[1] },
    { title: 'Coaching equipe', start: '15:00', end: '15:45', tag: 'Leadership', color: palette[2] },
  ],
  [
    { title: 'Revue hebdomadaire', start: '08:30', end: '09:00', tag: 'Rituel', color: palette[3] },
    { title: 'Dejeuner mentor', start: '12:30', end: '13:30', tag: 'Networking', color: palette[4] },
    { title: 'Preparation contenu', start: '17:00', end: '18:00', tag: 'Creation', color: palette[0] },
  ],
  [
    { title: 'Atelier innovation', start: '09:15', end: '11:00', tag: 'Workshop', color: palette[1] },
    { title: 'Suivi clients premium', start: '13:30', end: '14:30', tag: 'Client', color: palette[2] },
    { title: 'Session energie', start: '18:30', end: '19:30', tag: 'Vitalite', color: palette[3] },
  ],
  [
    { title: 'Routine administrative', start: '08:00', end: '09:00', tag: 'Organisation', color: palette[4] },
    { title: 'Point projet', start: '11:00', end: '11:45', tag: 'Projet', color: palette[0] },
    { title: 'Temps creatif', start: '16:00', end: '17:30', tag: 'Creation', color: palette[1] },
  ],
]

const candidateDays = Array.from(new Set([now.getDate(), 1, 4, 8, 12, 16, 20, 24, 28]))
  .filter((day) => day <= daysInMonth)
  .sort((a, b) => a - b)

export const scheduledTasks: ScheduledTask[] = candidateDays.flatMap((day, index) =>
  dayProfiles[index % dayProfiles.length].map((task, taskIndex) => ({
    ...task,
    id: `task-${day}-${taskIndex}`,
    date: formatKey(day),
  })),
)

export const morningRoutine: RoutineItem[] = [
  { id: 'morning-1', title: 'Hydratation et respiration consciente (5 min)' },
  { id: 'morning-2', title: 'Lecture rapide des objectifs du mois' },
  { id: 'morning-3', title: 'Planification des 3 priorites du jour' },
  { id: 'morning-4', title: 'Mouvement et stretching dynamique' },
]

export const eveningRoutine: RoutineItem[] = [
  { id: 'evening-1', title: 'Deconnexion numerique 60 minutes avant le coucher' },
  { id: 'evening-2', title: 'Revue des victoires et gratitude' },
  { id: 'evening-3', title: 'Preparation de la tenue et du sac pour demain' },
  { id: 'evening-4', title: 'Lecture legere ou meditation guidee' },
]

export const journalingPrompts = [
  'Quels sont les trois moments forts que je veux creer aujourd hui ?',
  'Quel obstacle pourrais-je transformer en opportunite ?',
  'Quelle micro-action rendrait ma journee memorable ?',
]

export const monthlyReview: MonthlyReview = {
  highlights: [
    '15 seances de deep work completees sur les priorites strategiques',
    '2 nouveaux clients signes via le reseau ambassadeur',
    'Routine matinale tenue 80 pour cent du temps',
  ],
  lessons: [
    'Anticiper davantage les imprevus sur la fin de journee',
    'Bloquer du temps dedie a la creativite avant 16h',
  ],
  focusNextMonth: [
    'Finaliser la preparation du lancement produit Q1',
    'Renforcer la delegation sur les taches repetitives',
    'Programmer 4 rendez-vous de suivi avec l equipe',
  ],
  metrics: [
    { label: 'Taches a haute valeur', value: '38 completees' },
    { label: 'Sessions de sport', value: '11 / 12 prevues' },
    { label: 'Soirees off-screen', value: '18 soirees' },
  ],
}

export const getDateKey = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
