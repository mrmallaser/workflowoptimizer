import { AvailabilityData, ScheduleAssignment, ScheduleRule, CustomWeight, EMPLOYEE_INFO } from '../types';

interface EmployeeShifts {
  [key: string]: number;
}

export function generateSchedule(
  availabilityData: AvailabilityData[],
  rules: ScheduleRule[],
  customWeights: CustomWeight[]
): ScheduleAssignment[] {
  try {
    const schedule: ScheduleAssignment[] = [];
    const shiftsPerEmployee: EmployeeShifts = {};
    
    // Initialize shift counts for all employees
    const allEmployees = new Set<string>();
    availabilityData.forEach(day => {
      Object.keys(day.employees).forEach(employee => {
        allEmployees.add(employee);
        shiftsPerEmployee[employee] = 0;
      });
    });

    // Sort dates chronologically
    const sortedData = [...availabilityData].sort((a, b) => 
      a.date.getTime() - b.date.getTime()
    );

    // Get weekend weight from rules
    const weekendRule = rules.find(r => r.id === 'weekend-weight');
    const weekendWeight = weekendRule?.enabled ? (weekendRule.weight || 2) : 1;

    // Calculate total points and target per employee
    let totalPoints = 0;
    sortedData.forEach(day => {
      const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6;
      const customWeight = customWeights.find(w => 
        w.date.getTime() === day.date.getTime()
      );
      const dayWeight = customWeight ? customWeight.weight : 
                       isWeekend ? weekendWeight : 1;
      totalPoints += dayWeight;
    });

    const targetPointsPerEmployee = Math.floor(totalPoints / allEmployees.size);

    // Assign shifts
    for (const dayData of sortedData) {
      const availableEmployees = Object.entries(dayData.employees)
        .filter(([_, isAvailable]) => isAvailable)
        .map(([employee]) => employee);

      if (availableEmployees.length === 0) {
        console.warn(`No available employees for ${dayData.date.toLocaleDateString()}`);
        continue;
      }

      const isWeekend = dayData.date.getDay() === 0 || dayData.date.getDay() === 6;
      const customWeight = customWeights.find(w => 
        w.date.getTime() === dayData.date.getTime()
      );
      const dayWeight = customWeight ? customWeight.weight : 
                       isWeekend ? weekendWeight : 1;

      // Sort employees by current points
      availableEmployees.sort((a, b) => {
        const pointsDiff = shiftsPerEmployee[a] - shiftsPerEmployee[b];
        if (Math.abs(pointsDiff) > 0.1) return pointsDiff;
        
        // If points are equal, check target
        const aDistance = Math.abs(shiftsPerEmployee[a] - targetPointsPerEmployee);
        const bDistance = Math.abs(shiftsPerEmployee[b] - targetPointsPerEmployee);
        if (Math.abs(aDistance - bDistance) > 0.1) return aDistance - bDistance;
        
        // If still equal, randomize
        return Math.random() - 0.5;
      });

      const assignedEmployee = availableEmployees[0];
      shiftsPerEmployee[assignedEmployee] += dayWeight;

      // Find employee info to get phone number
      const employeeInfo = EMPLOYEE_INFO.find(e => e.name === assignedEmployee);

      schedule.push({
        date: dayData.date,
        weekday: dayData.date.toLocaleDateString('de-DE', { weekday: 'long' }),
        assignedEmployee,
        phone: employeeInfo?.phone || ''
      });
    }

    // Validate final distribution
    const points = Object.values(shiftsPerEmployee);
    const maxDiff = Math.max(...points) - Math.min(...points);
    if (maxDiff > 2) {
      console.warn('Uneven distribution detected:', shiftsPerEmployee);
    }

    return schedule.sort((a, b) => a.date.getTime() - b.date.getTime());
  } catch (error) {
    console.error('Error in schedule generation:', error);
    throw error;
  }
}