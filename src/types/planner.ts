export interface FamilyMember {
  id: string
  name: string
  color: string
  warnings: Array<WarningRule>
}

export interface Trip {
  id: string
  memberId: string
  entryDate: string
  departureDate: string
  notes?: string
}

export interface WarningRule {
  id: string
  type: 'flight-days' | 'stay-limit' | 'custom'
  criteria: {
    days?: Array<number>
    limit?: number
    message: string
  }
  enabled: boolean
}

export interface GlobalSettings {
  warnings: {
    enabled: boolean
    rules: Array<WarningRule>
  }
  yearLimit: number
}

export interface PlannerState {
  members: Array<FamilyMember>
  trips: Array<Trip>
  globalSettings: GlobalSettings
}

export interface EmptyPeriod {
  startDate: string
  endDate: string
  duration: number
}

export interface MemberStats {
  memberId: string
  name: string
  color: string
  currentStatus: 'present' | 'away'
  daysInYear: number
  isOverLimit: boolean
  nextTrip?: Trip
  activeWarnings: Array<string>
}
