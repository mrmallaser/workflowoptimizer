import { Timestamp } from 'firebase/firestore';

export interface Folder {
  id: string;
  name: string;
  userId: string;
  createdAt: number;
  parentId?: string | null;
}

export interface Snippet {
  id: string;
  name: string;
  content: string;
  categories: string[];
  createdAt: number;
  userId: string;
  folderId?: string | null;
}

export interface SnippetUpdate {
  name?: string;
  content?: string;
  categories?: string[];
  folderId?: string | null;
}

export interface SnippetStore {
  snippets: Snippet[];
  folders: Folder[];
  loadUserSnippets: (userId: string) => Promise<void>;
  loadUserFolders: (userId: string) => Promise<void>;
  addSnippet: (snippet: Omit<Snippet, 'id' | 'createdAt' | 'userId'>) => Promise<void>;
  deleteSnippet: (id: string) => Promise<void>;
  updateSnippet: (id: string, updates: SnippetUpdate) => Promise<void>;
  addFolder: (name: string, parentId?: string) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  updateFolder: (id: string, name: string) => Promise<void>;
  moveSnippet: (snippetId: string, folderId: string | null) => Promise<void>;
  moveFolder: (folderId: string, newParentId: string | null) => Promise<void>;
}