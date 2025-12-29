import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type {
  FamilyMember,
  GlobalSettings,
  PlannerState,
  Trip,
} from '@/types/planner'

interface FamilyPlannerContextType {
  state: PlannerState
  addMember: (member: Omit<FamilyMember, 'id'>) => void
  updateMember: (id: string, member: Partial<FamilyMember>) => void
  deleteMember: (id: string) => void
  addTrip: (trip: Omit<Trip, 'id'>) => void
  updateTrip: (id: string, trip: Partial<Trip>) => void
  deleteTrip: (id: string) => void
  updateGlobalSettings: (settings: Partial<GlobalSettings>) => void
  importData: (data: PlannerState) => void
  exportData: () => PlannerState
}

const FamilyPlannerContext = createContext<FamilyPlannerContextType | null>(
  null,
)

const STORAGE_KEY = 'family-planner-data'

const defaultState: PlannerState = {
  members: [],
  trips: [],
  globalSettings: {
    warnings: {
      enabled: true,
      rules: [],
    },
    yearLimit: 180,
  },
}

function storeState(state: PlannerState) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function migrateData(oldData: any): PlannerState {
  let migratedData = false

  // Migrate Trip's memberId becomes memberIds
  if (oldData.trips) {
    oldData.trips = oldData.trips.map((trip: any) => {
      if (trip.memberId && !trip.memberIds) {
        migratedData = true
        delete trip.memberId
        return {
          ...trip,
          memberIds: [trip.memberId],
        }
      } else {
        return trip
      }
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (migratedData) {
    storeState(oldData as PlannerState)
  }

  return oldData as PlannerState
}

export function FamilyPlannerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PlannerState>(() => {
    if (typeof window === 'undefined') return defaultState

    const stored = localStorage.getItem(STORAGE_KEY)

    if (stored) {
      try {
        return migrateData(JSON.parse(stored))
      } catch {
        return defaultState
      }
    }
    return defaultState
  })

  useEffect(() => {
    storeState(state)
  }, [state])

  const addMember = (member: Omit<FamilyMember, 'id'>) => {
    const newMember: FamilyMember = {
      ...member,
      id: crypto.randomUUID(),
    }
    setState((prev) => ({
      ...prev,
      members: [...prev.members, newMember],
    }))
  }

  const updateMember = (id: string, updates: Partial<FamilyMember>) => {
    setState((prev) => ({
      ...prev,
      members: prev.members.map((m) =>
        m.id === id ? { ...m, ...updates } : m,
      ),
    }))
  }

  const deleteMember = (id: string) => {
    setState((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m.id !== id),
      trips: prev.trips
        .map((t) => ({
          ...t,
          memberIds: t.memberIds.filter((mid) => mid !== id),
        }))
        .filter((t) => t.memberIds.length > 0),
    }))
  }

  const addTrip = (trip: Omit<Trip, 'id'>) => {
    const newTrip: Trip = {
      ...trip,
      id: crypto.randomUUID(),
    }
    setState((prev) => ({
      ...prev,
      trips: [...prev.trips, newTrip],
    }))
  }

  const updateTrip = (id: string, updates: Partial<Trip>) => {
    setState((prev) => ({
      ...prev,
      trips: prev.trips.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }))
  }

  const deleteTrip = (id: string) => {
    setState((prev) => ({
      ...prev,
      trips: prev.trips.filter((t) => t.id !== id),
    }))
  }

  const updateGlobalSettings = (settings: Partial<GlobalSettings>) => {
    setState((prev) => ({
      ...prev,
      globalSettings: {
        ...prev.globalSettings,
        ...settings,
      },
    }))
  }

  const importData = (data: PlannerState) => {
    setState(data)
  }

  const exportData = () => state

  return (
    <FamilyPlannerContext.Provider
      value={{
        state,
        addMember,
        updateMember,
        deleteMember,
        addTrip,
        updateTrip,
        deleteTrip,
        updateGlobalSettings,
        importData,
        exportData,
      }}
    >
      {children}
    </FamilyPlannerContext.Provider>
  )
}

export function useFamilyPlanner() {
  const context = useContext(FamilyPlannerContext)
  if (!context) {
    throw new Error(
      'useFamilyPlanner must be used within FamilyPlannerProvider',
    )
  }
  return context
}
