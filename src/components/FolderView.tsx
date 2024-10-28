import React, { useState } from 'react';
import { Folder, FolderOpen, ChevronRight, ChevronDown, Plus, Edit2, Trash2, MoreVertical } from 'lucide-react';
import { Folder as FolderType, Snippet } from '../types';
import toast from 'react-hot-toast';

interface FolderViewProps {
  folders: FolderType[];
  snippets: Snippet[];
  currentFolderId: string | null;
  onFolderSelect: (folderId: string | null) => void;
  onAddFolder: (name: string, parentId?: string) => Promise<void>;
  onDeleteFolder: (id: string) => Promise<void>;
  onUpdateFolder: (id: string, name: string) => Promise<void>;
  onMoveSnippet: (snippetId: string, folderId: string | null) => Promise<void>;
  onMoveFolder: (folderId: string, newParentId: string | null) => Promise<void>;
}

export function FolderView({
  folders,
  snippets,
  currentFolderId,
  onFolderSelect,
  onAddFolder,
  onDeleteFolder,
  onUpdateFolder,
  onMoveSnippet,
  onMoveFolder
}: FolderViewProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleAddFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error('Folder name cannot be empty');
      return;
    }
    try {
      await onAddFolder(newFolderName.trim(), currentFolderId);
      setNewFolderName('');
      setShowNewFolderInput(false);
      toast.success('Folder created');
    } catch (error) {
      toast.error('Failed to create folder');
    }
  };

  const handleUpdateFolder = async (id: string, name: string) => {
    if (!name.trim()) {
      toast.error('Folder name cannot be empty');
      return;
    }
    try {
      await onUpdateFolder(id, name.trim());
      setEditingFolderId(null);
      toast.success('Folder renamed');
    } catch (error) {
      toast.error('Failed to rename folder');
    }
  };

  const handleDeleteFolder = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this folder and all its contents?')) {
      return;
    }
    try {
      await onDeleteFolder(id);
      toast.success('Folder deleted');
    } catch (error) {
      toast.error('Failed to delete folder');
    }
  };

  const getFolderHierarchy = (parentId: string | null = null): FolderType[] => {
    return folders.filter(folder => folder.parentId === parentId);
  };

  const renderFolder = (folder: FolderType, level: number = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = currentFolderId === folder.id;
    const childFolders = getFolderHierarchy(folder.id);
    const folderSnippets = snippets.filter(s => s.folderId === folder.id);

    return (
      <div key={folder.id} style={{ marginLeft: `${level * 16}px` }}>
        <div
          className={`flex items-center p-2 rounded-lg ${
            isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
          }`}
        >
          <button
            onClick={() => toggleFolder(folder.id)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          
          <button
            onClick={() => onFolderSelect(folder.id)}
            className="flex-1 flex items-center space-x-2 px-2"
          >
            {isExpanded ? (
              <FolderOpen className="h-5 w-5 text-blue-500" />
            ) : (
              <Folder className="h-5 w-5 text-gray-400" />
            )}
            {editingFolderId === folder.id ? (
              <input
                type="text"
                value={folder.name}
                onChange={(e) => handleUpdateFolder(folder.id, e.target.value)}
                onBlur={() => setEditingFolderId(null)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleUpdateFolder(folder.id, e.currentTarget.value);
                  }
                }}
                className="flex-1 bg-white border border-gray-300 rounded px-2 py-1"
                autoFocus
              />
            ) : (
              <span className="text-sm text-gray-700">{folder.name}</span>
            )}
            <span className="text-xs text-gray-400">
              ({folderSnippets.length})
            </span>
          </button>

          <div className="flex space-x-1">
            <button
              onClick={() => setEditingFolderId(folder.id)}
              className="p-1 text-gray-400 hover:text-blue-600 rounded"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDeleteFolder(folder.id)}
              className="p-1 text-gray-400 hover:text-red-600 rounded"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-1">
            {childFolders.map(childFolder => renderFolder(childFolder, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Folders</h2>
        <button
          onClick={() => setShowNewFolderInput(true)}
          className="p-1 text-gray-400 hover:text-blue-600 rounded"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {showNewFolderInput && (
        <div className="mb-4 flex items-center space-x-2">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="New folder name"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddFolder();
              }
            }}
            autoFocus
          />
          <button
            onClick={handleAddFolder}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            Create
          </button>
          <button
            onClick={() => {
              setShowNewFolderInput(false);
              setNewFolderName('');
            }}
            className="px-3 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="space-y-1">
        <div
          className={`flex items-center p-2 rounded-lg ${
            currentFolderId === null ? 'bg-blue-50' : 'hover:bg-gray-50'
          }`}
        >
          <button
            onClick={() => onFolderSelect(null)}
            className="flex-1 flex items-center space-x-2"
          >
            <Folder className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-700">All Snippets</span>
            <span className="text-xs text-gray-400">
              ({snippets.length})
            </span>
          </button>
        </div>
        {getFolderHierarchy(null).map(folder => renderFolder(folder))}
      </div>
    </div>
  );
}