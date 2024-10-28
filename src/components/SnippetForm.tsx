import React, { useState, useEffect } from 'react';
import { Plus, Save, X, Loader2 } from 'lucide-react';
import { Snippet } from '../types';
import toast from 'react-hot-toast';

interface SnippetFormProps {
  onSubmit: (name: string, content: string, category?: string) => void;
  editingSnippet: Snippet | null;
  onCancel: () => void;
  isLoading?: boolean;
}

export function SnippetForm({ onSubmit, editingSnippet, onCancel, isLoading }: SnippetFormProps) {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    if (editingSnippet) {
      setName(editingSnippet.name);
      setContent(editingSnippet.content);
      setCategory(editingSnippet.category || '');
    } else {
      setName('');
      setContent('');
      setCategory('');
    }
  }, [editingSnippet]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) {
      toast.error('Name and content are required');
      return;
    }
    onSubmit(name.trim(), content.trim(), category.trim() || undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">
          {editingSnippet ? 'Edit Snippet' : 'New Snippet'}
        </h2>
        {editingSnippet && (
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full transition-colors"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50"
          placeholder="Enter snippet name"
          disabled={isLoading}
          required
        />
      </div>
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Category (optional)
        </label>
        <input
          type="text"
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50"
          placeholder="Enter category"
          disabled={isLoading}
        />
      </div>
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
          Content
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 font-mono"
          placeholder="Enter snippet content"
          disabled={isLoading}
          required
        />
      </div>
      <button
        type="submit"
        className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {editingSnippet ? 'Updating...' : 'Adding...'}
          </>
        ) : editingSnippet ? (
          <>
            <Save className="h-4 w-4 mr-2" />
            Update Snippet
          </>
        ) : (
          <>
            <Plus className="h-4 w-4 mr-2" />
            Add Snippet
          </>
        )}
      </button>
    </form>
  );
}