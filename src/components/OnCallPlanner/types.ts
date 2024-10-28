export interface AvailabilityData {
  date: Date;
  employees: Record<string, boolean>;
}

export interface ScheduleAssignment {
  date: Date;
  weekday: string;
  assignedEmployee: string;
  phone?: string;
}

export interface ScheduleRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  weight: number;
}

export interface CustomWeight {
  date: Date;
  weight: number;
}

export interface Employee {
  name: string;
  position: string;
  phone: string;
}

export const EMPLOYEE_INFO: Employee[] = [
  { name: 'Pierre Atlihan', position: 'Safety Manager Ops', phone: '0151 – 58900 561' },
  { name: 'Klaus Gabler', position: 'Stellv. Safety Manager OPS, SM CAMO', phone: '0151 – 58945 528' },
  { name: 'Malte Sommer', position: 'Senior Safety Officer', phone: '0170 – 6866 126' },
  { name: 'Björn Freitag', position: 'Senior Safety Officer FDM', phone: '0151 – 58900 327' },
  { name: 'Chris Wolkensinger', position: 'Safety Officer', phone: '0151 – 58900 347' },
  { name: 'Moritz Hanusch', position: 'Safety Officer', phone: '0151 – 58945 172' },
  { name: 'Johannes Hädicke', position: 'Safety Officer', phone: '0173 – 6135 054' },
  { name: 'Max Pickan', position: 'Safety Officer', phone: '0173 – 3272 932' },
  { name: 'Max Haas', position: 'Safety Officer', phone: '0173 – 5748 811' }
];