import React, { useState } from 'react';
import { ArrowLeft, Download, FileSpreadsheet, Calendar, FileText, Save, Edit2, X } from 'lucide-react';
import { ScheduleAssignment, EMPLOYEE_INFO } from './types';
import { exportToExcel, exportToPDF, exportToICS } from './utils/exportUtils';
import toast from 'react-hot-toast';

interface Props {
  schedule: ScheduleAssignment[];
  onBack: () => void;
}

export function OnCallScheduleView({ schedule: initialSchedule, onBack }: Props) {
  const [isExporting, setIsExporting] = useState(false);
  const [schedule, setSchedule] = useState(initialSchedule);
  const [editMode, setEditMode] = useState(false);
  const [editedSchedule, setEditedSchedule] = useState(initialSchedule);

  const handleExport = async (type: 'excel' | 'pdf' | 'ics') => {
    try {
      setIsExporting(true);
      const filename = `Rufbereitschaft_${new Date().toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}`;

      switch (type) {
        case 'excel':
          await exportToExcel(schedule, filename);
          break;
        case 'pdf':
          await exportToPDF(schedule, filename);
          break;
        case 'ics':
          await exportToICS(schedule, filename);
          break;
      }

      toast.success(`Schedule exported as ${type.toUpperCase()}`);
    } catch (error) {
      console.error(`Error exporting ${type}:`, error);
      toast.error(`Failed to export as ${type.toUpperCase()}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleEditToggle = () => {
    if (editMode) {
      setEditedSchedule(schedule);
    }
    setEditMode(!editMode);
  };

  const handleEmployeeChange = (index: number, value: string) => {
    const employeeInfo = EMPLOYEE_INFO.find(e => e.name === value);
    const newSchedule = [...editedSchedule];
    newSchedule[index] = { 
      ...newSchedule[index], 
      assignedEmployee: value,
      phone: employeeInfo?.phone || ''
    };
    setEditedSchedule(newSchedule);
  };

  const handleSaveChanges = () => {
    setSchedule(editedSchedule);
    setEditMode(false);
    toast.success('Schedule updated successfully');
  };

  const handleCancelEdit = () => {
    setEditedSchedule(schedule);
    setEditMode(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900">Generated Schedule</h2>
          </div>
          
          <div className="flex items-center space-x-2">
            {!editMode ? (
              <>
                <button
                  onClick={() => handleExport('excel')}
                  disabled={isExporting}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Excel
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  disabled={isExporting}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  PDF
                </button>
                <button
                  onClick={() => handleExport('ics')}
                  disabled={isExporting}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  iCal
                </button>
                <button
                  onClick={handleEditToggle}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSaveChanges}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Weekday
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(editMode ? editedSchedule : schedule).map((assignment, index) => (
                <tr 
                  key={index}
                  className={assignment.weekday === 'Samstag' || assignment.weekday === 'Sonntag' 
                    ? 'bg-green-50' 
                    : undefined
                  }
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {assignment.date.toLocaleDateString('de-DE', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {assignment.weekday}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {editMode ? (
                      <select
                        value={assignment.assignedEmployee}
                        onChange={(e) => handleEmployeeChange(index, e.target.value)}
                        className="border border-gray-300 rounded-md px-2 py-1 w-full"
                      >
                        {EMPLOYEE_INFO.map(emp => (
                          <option key={emp.name} value={emp.name}>
                            {emp.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      assignment.assignedEmployee
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {assignment.phone}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}