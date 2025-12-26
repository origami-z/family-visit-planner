export interface FamilyMember {
  id: string;
  name: string;
  color: string;
  warnings: WarningRule[];
}

export interface Trip {
  id: string;
  memberId: string;
  entryDate: string;
  departureDate: string;
  notes?: string;
}

export interface WarningRule {
  id: string;
  type: 'flight-days' | 'stay-limit' | 'custom';
  criteria: {
    days?: number[];
    limit?: number;
    message: string;
  };
  enabled: boolean;
}

export interface GlobalSettings {
  warnings: {
    enabled: boolean;
    rules: WarningRule[];
  };
  yearLimit: number;
}

export interface PlannerState {
  members: FamilyMember[];
  trips: Trip[];
  globalSettings: GlobalSettings;
}

export interface EmptyPeriod {
  startDate: string;
  endDate: string;
  duration: number;
}

export interface MemberStats {
  memberId: string;
  name: string;
  color: string;
  currentStatus: 'present' | 'away';
  daysInYear: number;
  isOverLimit: boolean;
  nextTrip?: Trip;
  activeWarnings: string[];
}