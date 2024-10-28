import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, X } from 'lucide-react';

interface AdvancedSearchProps {
  onSearch: (searchParams: SearchParams) => void;
}

export interface SearchParams {
  query: string;
  fields: {
    name: boolean;
    content: boolean;
    categories: boolean;
  };
}

export function AdvancedSearch({ onSearch }: AdvancedSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: '',
    fields: {
      name: true,
      content: true,
      categories: true
    }
  });

  const handleSearchChange = (query: string) => {
    const newParams = { ...searchParams, query };
    setSearchParams(newParams);
    onSearch(newParams);
  };

  const toggleField = (field: keyof SearchParams['fields']) => {
    const newFields = {
      ...searchParams.fields,
      [field]: !searchParams.fields[field]
    };
    
    // Ensure at least one field is selected
    if (Object.values(newFields).some(value => value)) {
      const newParams = {
        ...searchParams,
        fields: newFields
      };
      setSearchParams(newParams);
      onSearch(newParams);
    }
  };

  const clearSearch = () => {
    const newParams = {
      query: '',
      fields: {
        name: true,
        content: true,
        categories: true
      }
    };
    setSearchParams(newParams);
    onSearch(newParams);
  };

  return (
    <div className="w-full space-y-2">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchParams.query}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search snippets..."
          className="block w-full pl-10 pr-20 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 space-x-1">
          {searchParams.query && (
            <button
              onClick={clearSearch}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              title="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            title="Toggle advanced search"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-3">Search in:</div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => toggleField('name')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                searchParams.fields.name
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Title
            </button>
            <button
              onClick={() => toggleField('content')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                searchParams.fields.content
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Content
            </button>
            <button
              onClick={() => toggleField('categories')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                searchParams.fields.categories
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Categories
            </button>
          </div>
        </div>
      )}
    </div>
  );
}