import { read, utils } from 'xlsx';
import { AvailabilityData } from '../types';

function excelDateToJSDate(serial: number): Date {
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);
  return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate());
}

function getGermanWeekday(date: Date): string {
  const weekdays = [
    'Sonntag', 'Montag', 'Dienstag', 'Mittwoch',
    'Donnerstag', 'Freitag', 'Samstag'
  ];
  return weekdays[date.getDay()];
}

export async function parseExcelData(file: File): Promise<AvailabilityData[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = read(data, { 
          type: 'array',
          cellDates: false // Keep dates as serial numbers
        });

        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = utils.sheet_to_json<any[]>(worksheet, {
          header: 1,
          raw: true,
          defval: ''
        });

        // Get employee names from header (skip first "Date" column)
        const employees = jsonData[0].slice(1).filter(Boolean);
        const availabilityData: AvailabilityData[] = [];

        // Process each row starting from row 2 (skip header)
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || !row[0]) continue;

          let date: Date;
          const rawDate = row[0];

          // Handle Excel serial date number
          if (typeof rawDate === 'number') {
            date = excelDateToJSDate(rawDate);
          } else {
            // Skip invalid dates
            continue;
          }

          const weekday = getGermanWeekday(date);
          const employeeAvailability: Record<string, boolean> = {};

          // Map availability for each employee
          employees.forEach((employee, index) => {
            const cellValue = row[index + 1];
            employeeAvailability[employee] = cellValue?.toString().toLowerCase() === 'x';
          });

          availabilityData.push({
            date,
            weekday,
            employees: employeeAvailability
          });
        }

        if (availabilityData.length === 0) {
          throw new Error('No valid data found in Excel file');
        }

        // Sort by date
        availabilityData.sort((a, b) => a.date.getTime() - b.date.getTime());
        resolve(availabilityData);

      } catch (error) {
        reject(error instanceof Error ? error : new Error('Failed to parse Excel file'));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}