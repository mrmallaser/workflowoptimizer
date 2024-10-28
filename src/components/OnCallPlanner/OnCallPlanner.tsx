import React, { useState } from 'react';
import { FileSpreadsheet, ArrowLeft } from 'lucide-react';
import { ScheduleAssignment, AvailabilityData, ScheduleRule, CustomShiftWeight } from './types';
import { AvailabilityUploader } from './AvailabilityUploader';
import { ScheduleRules } from './ScheduleRules';
import { OnCallScheduleView } from './OnCallScheduleView';
import { generateSchedule } from './utils/scheduleGenerator';
import toast from 'react-hot-toast';

export function OnCallPlanner({ onBack }: { onBack: () => void }) {
  const [availabilityData, setAvailabilityData] = useState<AvailabilityData[]>([]);
  const [schedule, setSchedule] = useState<ScheduleAssignment[]>([]);
  const [showSchedule, setShowSchedule] = useState(false);
  const [rules, setRules] = useState<ScheduleRule[]>([]);
  const [customWeights, setCustomWeights] = useState<CustomShiftWeight[]>([]);

  const handleAvailabilityUploaded = (data: AvailabilityData[]) => {
    setAvailabilityData(data);
    toast.success('Availability data loaded successfully');
  };

  const handleRulesChange = (updatedRules: ScheduleRule[]) => {
    setRules(updatedRules);
  };

  const handleCustomWeightsChange = (updatedWeights: CustomShiftWeight[]) => {
    setCustomWeights(updatedWeights);
  };

  const handleGenerateSchedule = () => {
    try {
      const generatedSchedule = generateSchedule(availabilityData, rules, customWeights);
      setSchedule(generatedSchedule);
      setShowSchedule(true);
      toast.success('Schedule generated successfully');
    } catch (error) {
      console.error('Error generating schedule:', error);
      toast.error('Failed to generate schedule');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">On-Call Duty Planner</h1>
          </div>
        </div>

        {!showSchedule ? (
          <div className="space-y-6">
            <AvailabilityUploader onDataUploaded={handleAvailabilityUploaded} />
            
            {availabilityData.length > 0 && (
              <>
                <ScheduleRules 
                  onRulesChange={handleRulesChange}
                  onCustomWeightsChange={handleCustomWeightsChange}
                />
                <div className="flex justify-center">
                  <button
                    onClick={handleGenerateSchedule}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Generate Schedule
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <OnCallScheduleView 
            schedule={schedule}
            onBack={() => setShowSchedule(false)}
          />
        )}
      </div>
    </div>
  );
}