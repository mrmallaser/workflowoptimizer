import React, { useState } from 'react';
import { Trash2, Copy, Tags, Clock, Edit2, X, Check, CheckSquare, Square } from 'lucide-react';
import { Snippet, SnippetUpdate } from '../types';
import toast from 'react-hot-toast';

interface SnippetListProps {
  snippets: Snippet[];
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, updates: SnippetUpdate) => Promise<void>;
}

export function SnippetList({ snippets, onDelete, onUpdate }: SnippetListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, SnippetUpdate>>({});
  const [selectedSnippets, setSelectedSnippets] = useState<Set<string>>(new Set());

  const handleCopy = async (content: string, e: React.MouseEvent) => {
    if (
      e.target instanceof HTMLButtonElement ||
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement ||
      (e.target instanceof HTMLElement && e.target.closest('button'))
    ) {
      return;
    }

    try {
      await navigator.clipboard.writeText(content);
      toast.success('Copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy text');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this snippet?')) return;
    
    try {
      await onDelete(id);
      toast.success('Snippet deleted!');
      const newEditValues = { ...editValues };
      delete newEditValues[id];
      setEditValues(newEditValues);
    } catch (error) {
      toast.error('Failed to delete snippet');
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedSnippets.size} snippets?`)) return;

    try {
      const deletePromises = Array.from(selectedSnippets).map(id => onDelete(id));
      await Promise.all(deletePromises);
      toast.success(`${selectedSnippets.size} snippets deleted!`);
      setSelectedSnippets(new Set());
    } catch (error) {
      toast.error('Failed to delete some snippets');
    }
  };

  const toggleSnippetSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelected = new Set(selectedSnippets);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedSnippets(newSelected);
  };

  const toggleAllSelection = () => {
    if (selectedSnippets.size === snippets.length) {
      setSelectedSnippets(new Set());
    } else {
      setSelectedSnippets(new Set(snippets.map(s => s.id)));
    }
  };

  const startEditing = (snippet: Snippet) => {
    setEditingId(snippet.id);
    setEditValues({
      ...editValues,
      [snippet.id]: {
        name: snippet.name,
        content: snippet.content,
        categories: Array.isArray(snippet.categories) ? snippet.categories : []
      }
    });
  };

  const handleInputChange = async (id: string, field: keyof SnippetUpdate, value: string | string[]) => {
    if (field === 'categories') {
      const categories = (value as string)
        .replace(/^#/, '')
        .split('#')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const newValues = {
        ...editValues[id],
        categories
      };
      
      setEditValues({
        ...editValues,
        [id]: newValues
      });

      try {
        await onUpdate(id, { categories });
      } catch (error) {
        toast.error('Failed to update categories');
      }
    } else {
      const newValues = {
        ...editValues[id],
        [field]: value
      };
      
      setEditValues({
        ...editValues,
        [id]: newValues
      });

      try {
        await onUpdate(id, { [field]: value });
      } catch (error) {
        toast.error('Failed to update snippet');
      }
    }
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getCategoriesString = (categories: string[] | undefined): string => {
    if (!categories || !Array.isArray(categories)) return '';
    return categories.map(cat => `#${cat}`).join(' ');
  };

  return (
    <div className="space-y-4">
      {/* Selection Toolbar */}
      {selectedSnippets.size > 0 && (
        <div className="sticky top-0 z-10 bg-white shadow-md rounded-lg p-4 border border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleAllSelection}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
            >
              {selectedSnippets.size === snippets.length ? (
                <CheckSquare className="h-5 w-5" />
              ) : (
                <Square className="h-5 w-5" />
              )}
              <span className="text-sm font-medium">
                {selectedSnippets.size} selected
              </span>
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleBulkDelete}
              className="flex items-center px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Snippets List */}
      <div className="grid grid-cols-1 gap-6">
        {snippets.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500">No snippets found</p>
          </div>
        ) : (
          snippets.map((snippet) => {
            const currentEditValues = editValues[snippet.id] || {
              name: snippet.name,
              content: snippet.content,
              categories: Array.isArray(snippet.categories) ? snippet.categories : []
            };
            
            return (
              <div
                key={snippet.id}
                onClick={(e) => handleCopy(currentEditValues.content || '', e)}
                className={`group bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 ${
                  editingId === snippet.id ? '' : 'cursor-pointer'
                } ${selectedSnippets.has(snippet.id) ? 'ring-2 ring-blue-500' : ''}`}
              >
                <div className="px-6 py-4 border-b border-gray-100">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={(e) => toggleSnippetSelection(snippet.id, e)}
                        className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                      >
                        {selectedSnippets.has(snippet.id) ? (
                          <CheckSquare className="h-5 w-5 text-blue-500" />
                        ) : (
                          <Square className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                      <div className="flex-grow space-y-1">
                        <div className={`text-lg font-semibold text-gray-900 ${
                          editingId === snippet.id ? 'px-2 -mx-2' : ''
                        }`}>
                          {editingId === snippet.id ? (
                            <input
                              type="text"
                              value={currentEditValues.name || ''}
                              onChange={(e) => handleInputChange(snippet.id, 'name', e.target.value)}
                              onBlur={cancelEditing}
                              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          ) : (
                            <span>{currentEditValues.name}</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center text-gray-500">
                            <Tags className="h-4 w-4 mr-1.5" />
                            {editingId === snippet.id ? (
                              <input
                                type="text"
                                value={getCategoriesString(currentEditValues.categories)}
                                onChange={(e) => handleInputChange(snippet.id, 'categories', e.target.value)}
                                onBlur={cancelEditing}
                                placeholder="Add categories (#javascript #react)"
                                className="bg-gray-50 border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {Array.isArray(currentEditValues.categories) && currentEditValues.categories.map((category, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                  >
                                    #{category}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center text-gray-400">
                            <Clock className="h-4 w-4 mr-1.5" />
                            <span className="text-sm">{formatDate(snippet.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      {editingId === snippet.id ? (
                        <button
                          onClick={cancelEditing}
                          className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg transition-colors"
                          title="Done editing"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditing(snippet);
                            }}
                            className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                            title="Edit snippet"
                          >
                            <Edit2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(snippet.id);
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete snippet"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {editingId === snippet.id ? (
                    <textarea
                      value={currentEditValues.content || ''}
                      onChange={(e) => handleInputChange(snippet.id, 'content', e.target.value)}
                      onBlur={cancelEditing}
                      className="w-full rounded-lg p-4 text-sm font-mono text-gray-800 min-h-[100px] resize-y bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={4}
                    />
                  ) : (
                    <pre className="w-full rounded-lg p-4 text-sm font-mono text-gray-800 bg-gray-50 whitespace-pre-wrap">
                      {currentEditValues.content}
                    </pre>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}