import React, { useRef, useState } from 'react';
import { Modal } from './Modal';
import { Upload, FileSpreadsheet, Loader2 } from 'lucide-react';
import { read, utils } from 'xlsx';
import toast from 'react-hot-toast';
import { Snippet } from '../types';

interface ImportSnippetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (snippets: Omit<Snippet, 'id' | 'createdAt' | 'userId'>[]) => Promise<void>;
}

export function ImportSnippetsModal({ isOpen, onClose, onImport }: ImportSnippetsModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState<{ name: string; category: string; content: string }[]>([]);

  const resetState = () => {
    setPreview([]);
    setImporting(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processFile = async (file: File) => {
    try {
      const data = await file.arrayBuffer();
      const workbook = read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json<any>(worksheet, { header: 1, raw: false });

      // Skip header row and filter out empty rows
      const rows = jsonData.slice(1).filter(row => row && row.length >= 3);

      const snippets = rows.map(row => ({
        name: String(row[0] || '').trim(),
        category: String(row[1] || '').trim(),
        content: String(row[2] || '').trim()
      })).filter(snippet => snippet.name && snippet.content);

      if (snippets.length === 0) {
        toast.error('No valid snippets found in file');
        return;
      }

      setPreview(snippets);
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Error processing file. Please check the format.');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'text/csv' || file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        processFile(file);
      } else {
        toast.error('Please upload a CSV or Excel file');
      }
    }
  };

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      if (file.type === 'text/csv' || file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        processFile(file);
      } else {
        toast.error('Please upload a CSV or Excel file');
      }
    }
  };

  const handleImport = async () => {
    if (preview.length === 0) {
      toast.error('No valid snippets to import');
      return;
    }

    try {
      setImporting(true);
      await onImport(preview);
      resetState();
      onClose();
    } catch (error) {
      console.error('Error importing snippets:', error);
      toast.error('Failed to import snippets');
    } finally {
      setImporting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => {
      resetState();
      onClose();
    }} title="Import Snippets">
      <div className="space-y-6">
        {/* File Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".csv,.xlsx"
            onChange={handleFileChange}
          />
          <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Drag and drop your CSV or Excel file here, or{' '}
              <span className="text-blue-600 hover:text-blue-500 cursor-pointer">browse</span>
            </p>
            <p className="mt-2 text-xs text-gray-500">
              File should have columns: Title, Category, Content
            </p>
          </div>
        </div>

        {/* Preview Area */}
        {preview.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Preview ({preview.length} snippets)
              </h3>
              <button
                onClick={handleImport}
                disabled={importing}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
              >
                {importing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Import All
                  </>
                )}
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Content Preview
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {preview.map((snippet, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {snippet.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {snippet.category || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="max-w-xs truncate font-mono">
                          {snippet.content}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}