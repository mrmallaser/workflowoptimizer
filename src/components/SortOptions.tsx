import React from 'react';
import { ArrowDownAZ, ArrowUpAZ, Clock, Tags } from 'lucide-react';

interface SortOptionsProps {
  sortBy: 'date' | 'name' | 'category';
  sortOrder: 'asc' | 'desc';
  onSortByChange: (sortBy: 'date' | 'name' | 'category') => void;
  onSortOrderChange: (sortOrder: 'asc' | 'desc') => void;
}

export function SortOptions({
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderChange,
}: SortOptionsProps) {
  const getSortIcon = () => {
    if (sortOrder === 'asc') {
      switch (sortBy) {
        case 'name':
          return <ArrowDownAZ className="h-5 w-5" />;
        case 'category':
          return <Tags className="h-5 w-5" />;
        default:
          return <Clock className="h-5 w-5" />;
      }
    } else {
      switch (sortBy) {
        case 'name':
          return <ArrowUpAZ className="h-5 w-5" />;
        case 'category':
          return <Tags className="h-5 w-5 transform rotate-180" />;
        default:
          return <Clock className="h-5 w-5 transform rotate-180" />;
      }
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-500">Sort by:</span>
        <select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value as 'date' | 'name' | 'category')}
          className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="date">Date</option>
          <option value="name">Name</option>
          <option value="category">Category</option>
        </select>
      </div>
      <button
        onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
        className="inline-flex items-center p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-50"
        title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
      >
        {getSortIcon()}
      </button>
    </div>
  );
}