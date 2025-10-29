import { createContext, useCallback, useContext, useMemo } from 'react'
import type { ReactNode } from 'react'
import type { ScheduledTask } from '../data/sampleData'
import { scheduledTasks as defaultTasks } from '../data/sampleData'
import usePersistentState from '../hooks/usePersistentState'

type TasksContextValue = {
  tasks: ScheduledTask[]
  addTask: (task: ScheduledTask) => void
  updateTask: (taskId: string, updates: Partial<ScheduledTask>) => void
  removeTask: (taskId: string) => void
}

const TasksContext = createContext<TasksContextValue | undefined>(undefined)

const STORAGE_KEY = 'planner.tasks'

type TasksProviderProps = {
  children: ReactNode
}

export const TasksProvider = ({ children }: TasksProviderProps) => {
  const [tasks, setTasks] = usePersistentState<ScheduledTask[]>(STORAGE_KEY, () => defaultTasks)

  const addTask = useCallback((task: ScheduledTask) => {
    setTasks((previous) => [...previous, task])
  }, [setTasks])

  const updateTask = useCallback((taskId: string, updates: Partial<ScheduledTask>) => {
    setTasks((previous) =>
      previous.map((task) =>
        task.id === taskId
          ? { ...task, ...updates }
          : task,
      ),
    )
  }, [setTasks])

  const removeTask = useCallback((taskId: string) => {
    setTasks((previous) => previous.filter((task) => task.id !== taskId))
  }, [setTasks])

  const value = useMemo(() => ({ tasks, addTask, updateTask, removeTask }), [tasks, addTask, updateTask, removeTask])

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
}

export const useTasks = () => {
  const context = useContext(TasksContext)
  if (!context) {
    throw new Error('useTasks must be used within a TasksProvider')
  }
  return context
}
