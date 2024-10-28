import { utils, read } from 'xlsx';

export interface Employee {
  name: string;
  availability: boolean;
}

export interface DaySchedule {
  date: Date;
  weekday: string;
  employees: Employee[];
}

const germanMonths: Record<string, number> = {
  'Januar': 0,
  'Februar': 1,
  'März': 2,
  'April': 3,
  'Mai': 4,
  'Juni': 5,
  'Juli': 6,
  'August': 7,
  'September': 8,
  'Oktober': 9,
  'November': 10,
  'Dezember': 11
};

const parseGermanDate = (dateStr: string): Date | null => {
  try {
    const match = dateStr.match(/([A-Za-zäöüß]+),\s*(\d+)\.\s*([A-Za-zäöüß]+)\s*(\d{4})/);
    if (!match) {
      console.error(`Invalid date format: ${dateStr}`);
      return null;
    }

    const [_, weekday, day, month, year] = match;
    const monthIndex = germanMonths[month];
    
    if (monthIndex === undefined) {
      console.error(`Invalid month: ${month}`);
      return null;
    }

    return new Date(parseInt(year), monthIndex, parseInt(day));
  } catch (error) {
    console.error('Error parsing date:', dateStr, error);
    return null;
  }
};

export const parseExcelFile = async (file: File): Promise<DaySchedule[]> => {
  try {
    const buffer = await file.arrayBuffer();
    const workbook = read(buffer, { type: 'array' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = utils.sheet_to_json<string[]>(worksheet, { header: 1 });

    if (!rawData || rawData.length < 2) {
      throw new Error('Invalid Excel file format: No data found');
    }

    // Get employee names from header (skip first date column)
    const employeeNames = rawData[0].slice(1).filter(Boolean);

    // Process each row
    const schedule: DaySchedule[] = [];
    for (let i = 1; i < rawData.length; i++) {
      const row = rawData[i];
      if (!row || !row[0]) continue;

      const date = parseGermanDate(row[0]);
      if (!date) {
        console.error(`Skipping row ${i + 1}: Invalid date format`);
        continue;
      }

      const weekday = row[0].split(',')[0].trim();
      const employees: Employee[] = employeeNames.map((name, index) => ({
        name,
        availability: row[index + 1]?.toLowerCase() === 'x'
      }));

      schedule.push({
        date,
        weekday,
        employees
      });
    }

    if (schedule.length === 0) {
      throw new Error('No valid schedule data found in the Excel file');
    }

    return schedule.sort((a, b) => a.date.getTime() - b.date.getTime());
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Failed to parse Excel file. Please check the format.'
    );
  }
};