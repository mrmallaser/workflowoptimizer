import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileSpreadsheet, Upload, Loader2, AlertCircle } from 'lucide-react';
import { parseExcelFile } from './utils/excelParser';
import { DaySchedule } from './types';
import toast from 'react-hot-toast';

interface OnCallFileUploadProps {
  onFileProcessed: (data: DaySchedule[]) => void;
}

export function OnCallFileUpload({ onFileProcessed }: OnCallFileUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const data = await parseExcelFile(file);
      if (data.length === 0) {
        throw new Error('No valid schedule data found in the file');
      }
      onFileProcessed(data);
      toast.success('Schedule data processed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process file';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error processing file:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [onFileProcessed]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1,
    disabled: isProcessing
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${error ? 'border-red-300' : ''}`}
      >
        <input {...getInputProps()} disabled={isProcessing} />
        
        {isProcessing ? (
          <Loader2 className="mx-auto h-12 w-12 text-blue-500 animate-spin" />
        ) : error ? (
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        ) : (
          <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400" />
        )}

        <div className="mt-4">
          <p className="text-sm text-gray-600">
            {isProcessing ? (
              'Processing file...'
            ) : isDragActive ? (
              'Drop the Excel file here'
            ) : error ? (
              <span className="text-red-600">Error processing file. Click to try again.</span>
            ) : (
              <>
                Drag and drop your Excel file here, or{' '}
                <span className="text-blue-600 hover:text-blue-500">browse</span>
              </>
            )}
          </p>
          <p className="mt-2 text-xs text-gray-500">
            File should contain availability data in German date format (e.g., "Dienstag, 1. Oktober 2024")
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <div className="text-sm text-red-700">
              <p className="font-medium">Error Details:</p>
              <p>{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}