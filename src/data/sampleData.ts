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
  { id: 'morning-visualiser', title: 'Visualiser ta journée idéale pendant 1 minute' },
  { id: 'morning-lit', title: 'Faire mon lit' },
  { id: 'morning-ranger-espace', title: 'Ranger mon espace' },
  { id: 'morning-hydrate', title: 'Boire un grand verre d\'eau' },
  { id: 'morning-respiration', title: 'Faire 5 minutes de respiration' },
  { id: 'morning-gratitude', title: 'Écrire 3 choses positives ou de gratitude' },
  { id: 'morning-affirmations-confiance', title: 'Répéter 3 affirmations pour la confiance en soi' },
  { id: 'morning-affirmations-abondance', title: 'Répéter 3 affirmations pour attirer l\'abondance / l\'argent' },
  { id: 'morning-miroir', title: 'Se regarder dans le miroir et se sourire' },
  { id: 'morning-douche', title: 'Prendre une douche consciente (laisser partir les énergies lourdes)' },
  { id: 'morning-habits', title: 'S\'habiller proprement, même si je restes chez moi' },
  { id: 'morning-breakfast', title: 'Prendre un petit déjeuner nourrissant en pleine conscience' },
  { id: 'morning-no-phone', title: 'Éviter le téléphone pendant la première heure' },
]

export const eveningRoutine: RoutineItem[] = [
  { id: 'evening-ranger', title: 'Ranger rapidement mon espace / bureau' },
  { id: 'evening-lumiere', title: 'Tamiser la lumière ou allumer une bougie' },
  { id: 'evening-phone', title: 'Poser mon téléphone (au moins 30 min avant de dormir)' },
  { id: 'evening-hydrate', title: 'Boire un grand verre d\'eau' },
  { id: 'evening-douche', title: 'Prendre une douche relaxante ou se laver le visage' },
  { id: 'evening-soin', title: 'Faire ta petite routine soin (crème, cheveux, etc.)' },
  {
    id: 'evening-journal',
    title: 'Écrire ta journée dans ton journal',
    detail:
      'Ce que tu as aimé ou réussi aujourd\'hui\nCe que tu veux libérer / laisser partir\nCe dont tu es reconnaissant(e)',
  },
  { id: 'evening-affirmations', title: 'Écrire 3 affirmations positives pour demain' },
  { id: 'evening-visualiser', title: 'Visualiser ta vie idéale quelques minutes (imagine-toi déjà là)' },
  { id: 'evening-meditation', title: 'Faire 5 minutes de respiration, méditation ou silence' },
  { id: 'evening-lecture', title: 'Lire quelques pages d\'un livre inspirant (pas d\'écran)' },
  {
    id: 'evening-douceur',
    title: 'Te dire une phrase douce avant de dormir',
    detail: 'Exemple : "Je suis fier(e) de moi, je me rapproche chaque jour de mes rêves."',
  },
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
