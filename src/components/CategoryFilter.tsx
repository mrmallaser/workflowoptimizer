import React from 'react';
import { Tags, X, Check } from 'lucide-react';

interface CategoryFilterProps {
  categories: string[];
  selectedCategories: string[];
  onSelectCategories: (categories: string[]) => void;
  onClose?: () => void;
}

export function CategoryFilter({ 
  categories, 
  selectedCategories, 
  onSelectCategories,
  onClose 
}: CategoryFilterProps) {
  if (categories.length === 0) return null;

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      onSelectCategories(selectedCategories.filter(c => c !== category));
    } else {
      onSelectCategories([...selectedCategories, category]);
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Tags className="h-5 w-5 text-blue-600 mr-2" />
          <h2 className="text-sm font-medium text-gray-900">Select Categories</h2>
        </div>
        {selectedCategories.length > 0 && (
          <button
            onClick={() => {
              onSelectCategories([]);
              onClose?.();
            }}
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
          >
            Clear all
            <X className="h-4 w-4 ml-1" />
          </button>
        )}
      </div>
      <div className="space-y-1 max-h-64 overflow-y-auto">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => toggleCategory(category)}
            className={`w-full px-3 py-2 text-sm text-left rounded-md transition-colors flex items-center justify-between ${
              selectedCategories.includes(category)
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span>{category}</span>
            {selectedCategories.includes(category) && (
              <Check className="h-4 w-4 text-blue-600" />
            )}
          </button>
        ))}
      </div>
      {onClose && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      )}
    </div>
  );
}