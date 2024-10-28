import React, { useState, useEffect } from 'react';
import { Check, Hash, FileText, Tags } from 'lucide-react';
import toast from 'react-hot-toast';

interface NewSnippetFormProps {
  onSubmit: (name: string, content: string, categories: string[]) => Promise<void>;
  isOpen: boolean;
}

export function NewSnippetForm({ onSubmit, isOpen }: NewSnippetFormProps) {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [categoryInput, setCategoryInput] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setName('');
      setContent('');
      setCategoryInput('');
    }
  }, [isOpen]);

  const parseCategories = (input: string): string[] => {
    return input
      .split('#')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) {
      toast.error('Name and content are required');
      return;
    }
    const categories = parseCategories(categoryInput);
    await onSubmit(name.trim(), content.trim(), categories);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="relative">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <div className="relative rounded-lg shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Hash className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter snippet name"
              required
              autoFocus
            />
          </div>
        </div>

        <div className="relative">
          <label htmlFor="categories" className="block text-sm font-medium text-gray-700 mb-1">
            Categories (separate with #)
          </label>
          <div className="relative rounded-lg shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Tags className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="categories"
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
              className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="#javascript #react #snippets"
            />
          </div>
          {categoryInput && (
            <div className="mt-2 flex flex-wrap gap-2">
              {parseCategories(categoryInput).map((category, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  #{category}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Content
          </label>
          <div className="relative rounded-lg shadow-sm">
            <div className="absolute left-0 top-3 pl-3 flex items-start pointer-events-none">
              <FileText className="h-5 w-5 text-gray-400" />
            </div>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm transition-colors"
              placeholder="Enter snippet content"
              required
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Check className="h-4 w-4 mr-2" />
          Add Snippet
        </button>
      </div>
    </form>
  );
}