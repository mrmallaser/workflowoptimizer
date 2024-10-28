import { read, utils } from 'xlsx';
import { Availability } from '../types';

export const parseAvailabilityFile = async (file: File): Promise<Availability[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = utils.sheet_to_json(worksheet, { header: 1 });

        const availabilities: Availability[] = [];
        const dateRegex = /^(\w+), (\d+)\. (\w+) (\d{4})$/;

        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || !row[0]) continue;

          const dateMatch = dateRegex.exec(row[0]);
          if (!dateMatch) {
            throw new Error(`Invalid date format in row ${i + 1}: ${row[0]}`);
          }

          const [_, weekday, day, month, year] = dateMatch;
          const date = new Date(`${month} ${day}, ${year}`);

          if (isNaN(date.getTime())) {
            throw new Error(`Invalid date in row ${i + 1}: ${row[0]}`);
          }

          const availability: Availability = {
            date,
            employees: {}
          };

          // Start from column B (index 1)
          for (let j = 1; j < row.length; j++) {
            const employeeName = jsonData[0][j];
            if (employeeName) {
              availability.employees[employeeName] = row[j] === 'x' || row[j] === 'X';
            }
          }

          availabilities.push(availability);
        }

        resolve(availabilities);
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        reject(new Error('Failed to parse availability data'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsArrayBuffer(file);
  });
};