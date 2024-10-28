import { Availability, Employee, OnCallSchedule, Shift } from '../types';

export const generateSchedule = (
  availabilities: Availability[],
  employees: Employee[]
): OnCallSchedule => {
  const shifts: Shift[] = [];
  const employeeShifts = new Map<string, number>();
  const employeePhones = new Map(employees.map(emp => [emp.name, emp.phone]));

  // Initialize shift counts
  employees.forEach(emp => employeeShifts.set(emp.name, 0));

  // Sort availabilities by date
  const sortedAvailabilities = [...availabilities].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  // Process each day
  sortedAvailabilities.forEach(availability => {
    const availableEmployees = Object.entries(availability.employees)
      .filter(([_, isAvailable]) => isAvailable)
      .map(([name]) => ({
        name,
        shifts: employeeShifts.get(name) || 0
      }))
      .sort((a, b) => a.shifts - b.shifts);

    if (availableEmployees.length > 0) {
      const selectedEmployee = availableEmployees[0];
      const weekday = availability.date.toLocaleDateString('de-DE', { weekday: 'short' });
      const isWeekend = weekday === 'Sa' || weekday === 'So';
      const shiftWeight = isWeekend ? 2 : 1;

      employeeShifts.set(
        selectedEmployee.name,
        (employeeShifts.get(selectedEmployee.name) || 0) + shiftWeight
      );

      shifts.push({
        date: availability.date,
        weekday,
        employee: selectedEmployee.name,
        phone: employeePhones.get(selectedEmployee.name) || ''
      });
    }
  });

  // Get month and year from the first availability
  const firstDate = sortedAvailabilities[0]?.date;
  const month = firstDate?.toLocaleString('de-DE', { month: 'long' });
  const year = firstDate?.getFullYear();

  return {
    month: month || '',
    year: year || new Date().getFullYear(),
    shifts: shifts.sort((a, b) => a.date.getTime() - b.date.getTime())
  };
};