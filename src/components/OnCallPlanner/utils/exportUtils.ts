import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { utils, writeFile } from 'xlsx';
import { createEvents } from 'ics';
import { ScheduleAssignment } from '../types';

interface EmployeeInfo {
  name: string;
  position: string;
  phone: string;
}

const EMPLOYEE_INFO: EmployeeInfo[] = [
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

function getMonthYear(schedule: ScheduleAssignment[]): string {
  if (schedule.length === 0) return '';
  
  const date = schedule[0].date;
  return date.toLocaleDateString('de-DE', {
    month: 'long',
    year: 'numeric'
  });
}

export async function exportToExcel(schedule: ScheduleAssignment[], filename: string) {
  try {
    const scheduleData = schedule.map(assignment => {
      const employeeInfo = EMPLOYEE_INFO.find(e => e.name === assignment.assignedEmployee);
      return {
        Date: assignment.date.toLocaleDateString('de-DE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }),
        Weekday: assignment.weekday,
        'Assigned Employee': assignment.assignedEmployee,
        'Phone': employeeInfo?.phone || ''
      };
    });

    const ws = utils.json_to_sheet(scheduleData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Schedule');

    // Auto-size columns
    const colWidths = [
      { wch: 12 }, // Date
      { wch: 10 }, // Weekday
      { wch: 25 }, // Assigned Employee
      { wch: 20 }, // Phone
    ];
    ws['!cols'] = colWidths;

    writeFile(wb, `${filename}.xlsx`);
  } catch (error) {
    console.error("Error exporting excel:", error);
    throw error;
  }
}

export async function exportToPDF(schedule: ScheduleAssignment[], filename: string) {
  try {
    const doc = new jsPDF();
    const monthYear = getMonthYear(schedule);
    
    // Title and date
    doc.setFontSize(14);
    doc.text(`Rufbereitschaft ${monthYear}`, 14, 10);
    doc.setFontSize(8);
    doc.text(`aktueller Stand: ${new Date().toLocaleDateString('de-DE')}`, 14, 15);

    // Schedule table data with phone numbers
    const scheduleData = schedule.map(assignment => {
      const employeeInfo = EMPLOYEE_INFO.find(e => e.name === assignment.assignedEmployee);
      return [
        assignment.date.toLocaleDateString('de-DE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }),
        assignment.weekday,
        assignment.assignedEmployee,
        employeeInfo?.phone || ''
      ];
    });

    // Add schedule table
    (doc as any).autoTable({
      startY: 20,
      head: [['Date', 'Weekday', 'Employee', 'Phone']],
      body: scheduleData,
      theme: 'grid',
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold',
        cellPadding: 1,
        minCellHeight: 6
      },
      styles: {
        fontSize: 7,
        cellPadding: 1,
        minCellHeight: 4
      },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 20 },
        2: { cellWidth: 35 },
        3: { cellWidth: 25 }
      },
      didParseCell: function(data: any) {
        const weekday = data.row.raw?.[1];
        if (weekday === 'Samstag' || weekday === 'Sonntag') {
          data.cell.styles.fillColor = [198, 239, 206];
        }
      }
    });

    // Employee info table
    const employeeData = EMPLOYEE_INFO.map(emp => [
      emp.name,
      emp.position,
      emp.phone
    ]);

    (doc as any).autoTable({
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [['Name', 'Position', 'Phone']],
      body: employeeData,
      theme: 'grid',
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold',
        cellPadding: 1,
        minCellHeight: 6
      },
      styles: {
        fontSize: 7,
        cellPadding: 1,
        minCellHeight: 4
      },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 40 },
        2: { cellWidth: 25 }
      }
    });

    const noteY = (doc as any).lastAutoTable.finalY + 5;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.text('* In case of serious incidents try numbers in descending order', 14, noteY);

    doc.save(`${filename}.pdf`);
  } catch (error) {
    console.error("Error exporting pdf:", error);
    throw error;
  }
}

export async function exportToICS(schedule: ScheduleAssignment[], filename: string) {
  try {
    // Group events by employee
    const employeeEvents = new Map<string, ScheduleAssignment[]>();
    schedule.forEach(assignment => {
      const events = employeeEvents.get(assignment.assignedEmployee) || [];
      events.push(assignment);
      employeeEvents.set(assignment.assignedEmployee, events);
    });

    // Create separate ICS file for each employee
    for (const [employee, assignments] of employeeEvents.entries()) {
      const events = assignments.map(assignment => {
        const startDate = new Date(assignment.date);
        const endDate = new Date(assignment.date);
        endDate.setDate(endDate.getDate() + 1);

        return {
          start: [
            startDate.getFullYear(),
            startDate.getMonth() + 1,
            startDate.getDate(),
            0,
            0
          ],
          end: [
            endDate.getFullYear(),
            endDate.getMonth() + 1,
            endDate.getDate(),
            0,
            0
          ],
          title: `Rufbereitschaft Condor - ${employee}`,
          description: 'Bitte Leitfaden Rufbereitschaft nutzen: https://flycondor.sharepoint.com/:b:/r/sites/CondorFlightSafety/Freigegebene%20Dokumente/General/Rufbereitschaft/Leitfaden_Rufbereitschaft%20V1.7_ausfuellbar.pdf?csf=1&web=1&e=tbqrN8',
          status: 'CONFIRMED',
          busyStatus: 'BUSY',
          alarms: [{
            action: 'display',
            trigger: { hours: 6, before: true }
          }]
        };
      });

      const { error, value } = createEvents(events);
      if (error) {
        throw error;
      }

      const employeeFilename = `${employee}_${filename}.ics`;
      const blob = new Blob([value || ''], { type: 'text/calendar;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = employeeFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error("Error exporting ics:", error);
    throw error;
  }
}