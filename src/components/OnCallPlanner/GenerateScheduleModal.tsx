import React from 'react';
import { Modal } from '../Modal';
import { Calendar, Loader2 } from 'lucide-react';

interface GenerateScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export function GenerateScheduleModal({
  isOpen,
  onClose,
  onGenerate,
  isGenerating
}: GenerateScheduleModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate Schedule">
      <div className="space-y-6">
        <div className="text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            Generate On-Call Schedule
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            This will create a new schedule based on the uploaded availability data.
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Generating...
              </>
            ) : (
              'Generate Schedule'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}