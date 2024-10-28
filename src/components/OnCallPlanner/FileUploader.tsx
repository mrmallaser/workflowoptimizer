import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet } from 'lucide-react';

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
}

export function FileUploader({ onFileUpload }: FileUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false
  });

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        {...getRootProps()}
        className={`w-full max-w-2xl p-12 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-4 text-sm text-gray-600">
          {isDragActive ? (
            'Drop the Excel file here'
          ) : (
            <>
              Drag and drop your availability Excel file here, or{' '}
              <span className="text-blue-600">browse</span>
            </>
          )}
        </p>
        <p className="mt-2 text-xs text-gray-500">
          Only .xlsx and .xls files are supported
        </p>
      </div>
    </div>
  );
}