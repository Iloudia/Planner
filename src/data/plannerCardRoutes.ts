export const plannerCardRoutes = [
  { id: 'card-1', title: 'Activit\u00e9s', path: '/activites' },
  { id: 'card-2', title: 'Finances', path: '/finances' },
  { id: 'card-3', title: 'Journaling', path: '/journaling' },
  { id: 'card-4', title: 'Routine (soir & matin)', path: '/routine' },
  { id: 'card-5', title: 'Revue du mois', path: '/revue-du-mois' },
  { id: 'card-6', title: 'Calendrier mensuel', path: '/calendrier-mensuel' },
  { id: 'card-7', title: 'Choses \u00e0 regarder', path: '/choses-a-regarder' },
  { id: 'card-8', title: 'Wishlist', path: '/wishlist' },
  { id: 'card-9', title: 'Th\u00e9rapie', path: '/therapie' },
  { id: 'card-10', title: 'S\'aimer soi-m\u00eame', path: '/self-love' },
] as const

export const plannerCardRouteById = plannerCardRoutes.reduce<Record<string, string>>(
  (accumulator, route) => {
    accumulator[route.id] = route.path
    return accumulator
  },
  {},
)
