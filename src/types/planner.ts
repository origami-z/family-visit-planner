export interface FamilyMember {
  id: string
  name: string
  color: string
  warnings: Array<WarningRule>
}

export interface Trip {
  id: string
  memberIds: Array<string>
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

export interface HighlightTrip {
  trip: Trip
  refDate: string
  daysInYear: number
  isOverLimit: boolean
}

export interface MemberStats {
  memberId: string
  name: string
  color: string
  currentStatus: 'present' | 'away'
  /** The trip that is currently active (overlaps today), if any */
  currentTrip?: Trip
  /** Trips within 1yr in the past and in the future, with over limit indication */
  highlightTrips: Array<HighlightTrip>
  nextTrip?: Trip
  activeWarnings: Array<string>
}
