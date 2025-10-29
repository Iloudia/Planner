import { useEffect, useState } from 'react'

type Initialiser<T> = () => T

const isBrowser = typeof window !== 'undefined'

const safeParse = <T,>(value: string): T | null => {
  try {
    return JSON.parse(value) as T
  } catch (error) {
    console.error('Failed to parse persisted state', error)
    return null
  }
}

const usePersistentState = <T,>(storageKey: string, getDefaultValue: Initialiser<T>) => {
  const [state, setState] = useState<T>(() => {
    if (!isBrowser) {
      return getDefaultValue()
    }

    const storedValue = window.localStorage.getItem(storageKey)
    if (storedValue !== null) {
      const parsed = safeParse<T>(storedValue)
      if (parsed !== null) {
        return parsed
      }
    }

    const defaultValue = getDefaultValue()
    window.localStorage.setItem(storageKey, JSON.stringify(defaultValue))
    return defaultValue
  })

  useEffect(() => {
    if (!isBrowser) {
      return
    }
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state))
    } catch (error) {
      console.error('Failed to persist state', error)
    }
  }, [state, storageKey])

  return [state, setState] as const
}

export default usePersistentState
