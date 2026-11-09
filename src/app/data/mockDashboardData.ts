// Mock data for FY26 Q1 Performance Dashboard

export interface ProgramCapacity {
  id: string;
  programName: string;
  occupancyPercent: number;
  bedsAvailable: number;
  totalBeds: number;
}

export interface MonthlyMoveIn {
  month: string;
  moveIns: number;
}

export interface FunnelStage {
  stage: string;
  count: number;
  color: string;
}

export const PROGRAM_CAPACITY: ProgramCapacity[] = [
  { id: '1', programName: 'Couderc', occupancyPercent: 98.8, bedsAvailable: 1, totalBeds: 85 },
  { id: '2', programName: 'Kelly', occupancyPercent: 87.5, bedsAvailable: 5, totalBeds: 40 },
  { id: '3', programName: 'West Loop', occupancyPercent: 73.8, bedsAvailable: 11, totalBeds: 42 },
  { id: '4', programName: 'Walsh', occupancyPercent: 66.7, bedsAvailable: 18, totalBeds: 54 },
  { id: '5', programName: 'Mahoney', occupancyPercent: 47.1, bedsAvailable: 9, totalBeds: 17 },
  { id: '6', programName: 'Advocacy', occupancyPercent: 82.4, bedsAvailable: 3, totalBeds: 17 },
];

export const MONTHLY_MOVE_INS: MonthlyMoveIn[] = [
  { month: 'July', moveIns: 18 },
  { month: 'Aug', moveIns: 16 },
  { month: 'Sept', moveIns: 15 },
];

export const FUNNEL_DATA: FunnelStage[] = [
  { stage: 'Initial Contacts', count: 455, color: '#0176D3' },
  { stage: 'Info Sessions', count: 52, color: '#1B96FF' },
  { stage: 'Assessments', count: 18, color: '#57B9FF' },
  { stage: 'Move Ins', count: 15, color: '#90D0FF' },
];

export const KPI_DATA = {
  occupancy: {
    overall: 85.2,
    goal: 80,
    walsh: 82.5,
    westLoop: 87.3,
  },
  moveIns: {
    q1Total: 15,
    trend: 'down', // up, down, stable
  },
  initialContacts: {
    total: 455,
    conversionRate: 3.3,
  },
};

// Geo Location Data by Zip Code
export interface ZipCodeData {
  zipCode: string;
  neighborhood: string;
  referrals: number;
  candidates: number;
  latitude: number;
  longitude: number;
}

export const ZIP_CODE_DATA: ZipCodeData[] = [
  { zipCode: '60607', neighborhood: 'West Loop', referrals: 45, candidates: 12, latitude: 41.8756, longitude: -87.6478 },
  { zipCode: '60613', neighborhood: 'Lakeview', referrals: 38, candidates: 9, latitude: 41.9542, longitude: -87.6566 },
  { zipCode: '60624', neighborhood: 'North Lawndale', referrals: 52, candidates: 15, latitude: 41.8603, longitude: -87.7208 },
  { zipCode: '60612', neighborhood: 'Near West Side', referrals: 41, candidates: 11, latitude: 41.8789, longitude: -87.6742 },
  { zipCode: '60621', neighborhood: 'Englewood', referrals: 48, candidates: 13, latitude: 41.7794, longitude: -87.6478 },
  { zipCode: '60619', neighborhood: 'Chatham', referrals: 36, candidates: 8, latitude: 41.7392, longitude: -87.6061 },
  { zipCode: '60629', neighborhood: 'Gage Park', referrals: 29, candidates: 7, latitude: 41.7922, longitude: -87.6983 },
  { zipCode: '60644', neighborhood: 'Austin', referrals: 55, candidates: 16, latitude: 41.8897, longitude: -87.7656 },
  { zipCode: '60617', neighborhood: 'South Chicago', referrals: 32, candidates: 6, latitude: 41.7250, longitude: -87.5561 },
  { zipCode: '60628', neighborhood: 'Roseland', referrals: 27, candidates: 5, latitude: 41.6928, longitude: -87.6161 },
  { zipCode: '60632', neighborhood: 'Brighton Park', referrals: 24, candidates: 4, latitude: 41.8192, longitude: -87.7031 },
  { zipCode: '60623', neighborhood: 'Little Village', referrals: 39, candidates: 10, latitude: 41.8525, longitude: -87.7161 },
  { zipCode: '60649', neighborhood: 'South Shore', referrals: 31, candidates: 7, latitude: 41.7661, longitude: -87.5683 },
  { zipCode: '60620', neighborhood: 'Auburn Gresham', referrals: 43, candidates: 12, latitude: 41.7439, longitude: -87.6522 },
  { zipCode: '60625', neighborhood: 'Albany Park', referrals: 22, candidates: 5, latitude: 41.9736, longitude: -87.7139 },
];