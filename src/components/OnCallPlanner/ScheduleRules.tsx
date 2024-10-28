import React, { useState } from 'react';
import { Settings, Info, Plus, X, Calendar } from 'lucide-react';
import { ScheduleRule, CustomShiftWeight } from './types';
import toast from 'react-hot-toast';

interface ScheduleRulesProps {
  rules: ScheduleRule[];
  onRulesChange: (rules: ScheduleRule[]) => void;
  customWeights: CustomShiftWeight[];
  onCustomWeightsChange: (weights: CustomShiftWeight[]) => void;
}

const defaultRules: ScheduleRule[] = [
  {
    id: 'weekend-weight',
    name: 'Weekend Weight',
    description: 'Weekend shifts count as multiple regular shifts for fair distribution',
    enabled: true,
    weight: 2
  },
  {
    id: 'fair-distribution',
    name: 'Fair Distribution',
    description: 'Ensure shifts are distributed evenly among available employees',
    enabled: true,
    weight: 1
  }
];

export function ScheduleRules({ 
  rules = defaultRules,
  onRulesChange,
  customWeights = [],
  onCustomWeightsChange
}: ScheduleRulesProps) {
  const [newWeight, setNewWeight] = useState<CustomShiftWeight>({
    date: new Date(),
    weight: 1
  });

  const toggleRule = (ruleId: string) => {
    const updatedRules = rules.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    );
    onRulesChange(updatedRules);
  };

  const updateRuleWeight = (ruleId: string, weight: number) => {
    const updatedRules = rules.map(rule =>
      rule.id === ruleId ? { ...rule, weight: Math.max(1, weight) } : rule
    );
    onRulesChange(updatedRules);
  };

  const handleAddWeight = () => {
    try {
      if (!newWeight.date || isNaN(newWeight.weight) || newWeight.weight < 1) {
        toast.error('Please enter a valid date and weight (minimum 1)');
        return;
      }

      // Check if date already exists
      const existingWeight = customWeights.find(w => 
        w.date.toDateString() === newWeight.date.toDateString()
      );

      if (existingWeight) {
        toast.error('A weight for this date already exists');
        return;
      }

      const updatedWeights = [
        ...customWeights,
        {
          date: new Date(newWeight.date),
          weight: Math.max(1, newWeight.weight)
        }
      ].sort((a, b) => a.date.getTime() - b.date.getTime());

      onCustomWeightsChange(updatedWeights);
      setNewWeight({ date: new Date(), weight: 1 });
      toast.success('Custom weight added successfully');
    } catch (error) {
      console.error('Error adding custom weight:', error);
      toast.error('Failed to add custom weight');
    }
  };

  const removeCustomWeight = (date: Date) => {
    const updatedWeights = customWeights.filter(w => 
      w.date.toDateString() !== date.toDateString()
    );
    onCustomWeightsChange(updatedWeights);
    toast.success('Custom weight removed');
  };

  const formatDate = (date: Date): string => {
    try {
      return new Date(date).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center space-x-2 mb-4">
        <Settings className="h-5 w-5 text-gray-500" />
        <h2 className="text-lg font-medium text-gray-900">Schedule Rules</h2>
      </div>

      <div className="space-y-6">
        {/* Standard Rules */}
        <div className="space-y-4">
          {rules.map(rule => (
            <div key={rule.id} className="flex items-start space-x-4">
              <div className="flex-shrink-0 pt-0.5">
                <input
                  type="checkbox"
                  checked={rule.enabled}
                  onChange={() => toggleRule(rule.id)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <div className="flex-grow">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-medium text-gray-900">{rule.name}</h3>
                  <Info className="h-4 w-4 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">{rule.description}</p>
                {rule.id === 'weekend-weight' && rule.enabled && (
                  <div className="mt-2">
                    <label className="text-sm text-gray-600">Weight factor:</label>
                    <input
                      type="number"
                      min="1"
                      value={rule.weight}
                      onChange={(e) => updateRuleWeight(rule.id, parseInt(e.target.value))}
                      className="ml-2 w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Custom Weights */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900">Custom Day Weights</h3>
            {customWeights.length > 0 && (
              <span className="text-sm text-gray-500">
                {customWeights.length} custom weight{customWeights.length !== 1 ? 's' : ''} defined
              </span>
            )}
          </div>
          
          <div className="flex items-end space-x-4 mb-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Date</label>
              <input
                type="date"
                value={newWeight.date instanceof Date ? newWeight.date.toISOString().split('T')[0] : ''}
                onChange={(e) => setNewWeight({
                  ...newWeight,
                  date: new Date(e.target.value)
                })}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Weight</label>
              <input
                type="number"
                min="1"
                value={newWeight.weight}
                onChange={(e) => setNewWeight({
                  ...newWeight,
                  weight: parseInt(e.target.value)
                })}
                className="w-20 px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <button
              onClick={handleAddWeight}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </button>
          </div>

          {/* Custom Weights List */}
          {customWeights.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">Date</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">Weight</th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {customWeights.map((weight, index) => (
                    <tr key={index} className="text-sm">
                      <td className="py-2 text-gray-900">{formatDate(weight.date)}</td>
                      <td className="py-2 text-blue-600 font-medium">{weight.weight}x</td>
                      <td className="py-2 text-right">
                        <button
                          onClick={() => removeCustomWeight(weight.date)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Remove custom weight"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}