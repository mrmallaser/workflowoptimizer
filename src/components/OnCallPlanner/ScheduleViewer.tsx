import React from 'react';
import { Calendar as CalendarIcon, Clock, User, Phone } from 'lucide-react';
import { OnCallData } from './types';

interface ScheduleViewerProps {
  data: OnCallData;
}

export function ScheduleViewer({ data }: ScheduleViewerProps) {
  const { employees, availabilities, schedule } = data;

  return (
    <div className="space-y-6">
      {/* Employee List */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Team Members ({employees.length})
          </h3>
        </div>
        <div className="bg-white divide-y divide-gray-200">
          {employees.map((employee, index) => (
            <div key={index} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{employee.name}</p>
                    {employee.position && (
                      <p className="text-sm text-gray-500">{employee.position}</p>
                    )}
                  </div>
                </div>
                {employee.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-sm text-gray-500">{employee.phone}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Availability Calendar */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Availability Calendar
          </h3>
        </div>
        <div className="bg-white divide-y divide-gray-200">
          {availabilities.map((availability, index) => (
            <div key={index} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <p className="text-sm font-medium text-gray-900">
                    {availability.date.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {availability.employees.map((employee, empIndex) => (
                    <span
                      key={empIndex}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                    >
                      {employee}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Generated Schedule */}
      {schedule && (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Generated Schedule
            </h3>
          </div>
          <div className="bg-white divide-y divide-gray-200">
            {schedule.map((shift, index) => (
              <div key={index} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <p className="text-sm font-medium text-gray-900">
                      {shift.date.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-2" />
                    <p className="text-sm text-gray-500">{shift.employee.name}</p>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-gray-400 mr-2" />
                    <p className="text-sm text-gray-500">24h shift</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}