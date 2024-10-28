import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileSpreadsheet, AlertCircle, Loader2 } from 'lucide-react';
import { parseExcelData } from './utils/excelParser';
import { AvailabilityData } from './types';
import toast from 'react-hot-toast';

interface Props {
  onDataUploaded: (data: AvailabilityData[]) => void;
}

export function AvailabilityUploader({ onDataUploaded }: Props) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const data = await parseExcelData(file);
      onDataUploaded(data);
      toast.success(`Successfully loaded ${data.length} days of availability data`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process file';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [onDataUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1,
    disabled: isProcessing,
    noClick: isProcessing
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Upload Availability Data</h2>
      
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${isProcessing ? 'opacity-50' : 'cursor-pointer'}`}
      >
        <input {...getInputProps()} />
        
        {isProcessing ? (
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
            <p className="mt-4 text-sm text-gray-600">Processing file...</p>
          </div>
        ) : (
          <>
            <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                {isDragActive
                  ? 'Drop the Excel file here'
                  : 'Drag and drop your Excel file here, or click to browse'}
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Only .xlsx and .xls files are supported
              </p>
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-100">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-2" />
            <div className="text-sm text-red-700">
              <p className="font-medium">Error processing file:</p>
              <p>{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5 mr-2" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Excel File Requirements:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>First row: Employee names (headers)</li>
              <li>First column: Dates</li>
              <li>Mark availability with "x" in cells</li>
              <li>Empty cells indicate unavailability</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}