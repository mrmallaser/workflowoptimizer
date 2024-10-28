import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Snippet, SnippetStore } from './types';
import { 
  addSnippet as firebaseAddSnippet, 
  updateSnippet as firebaseUpdateSnippet, 
  deleteSnippet as firebaseDeleteSnippet,
  loadUserSnippets as firebaseLoadUserSnippets,
  subscribeToUserSnippets,
  auth,
  addBatchSnippets
} from './lib/firebase';

export const useSnippetStore = create<SnippetStore>()(
  persist(
    (set, get) => ({
      snippets: [],
      loadUserSnippets: async (userId: string) => {
        try {
          // Initial load
          const snippets = await firebaseLoadUserSnippets(userId);
          set({ snippets });

          // Set up real-time subscription
          const unsubscribe = subscribeToUserSnippets(userId, (updatedSnippets) => {
            set({ snippets: updatedSnippets });
          });

          // Cleanup subscription when component unmounts
          return unsubscribe;
        } catch (error) {
          console.error('Error loading snippets:', error);
          throw error;
        }
      },
      addSnippet: async (newSnippet) => {
        if (!auth.currentUser) throw new Error('User not authenticated');
        
        const tempId = crypto.randomUUID();
        const createdAt = Date.now();
        
        // Ensure categories is always an array
        const categories = Array.isArray(newSnippet.categories) ? newSnippet.categories : [];
        
        // Optimistically add the snippet to local state
        const tempSnippet = {
          ...newSnippet,
          categories,
          id: tempId,
          createdAt,
          userId: auth.currentUser.uid
        };
        
        set((state) => ({
          snippets: [tempSnippet, ...state.snippets]
        }));
        
        try {
          // Add to Firebase
          const snippetId = await firebaseAddSnippet({
            ...newSnippet,
            categories
          });
          
          // Update local state with real ID
          set((state) => ({
            snippets: state.snippets.map(s => 
              s.id === tempId ? { ...s, id: snippetId } : s
            )
          }));
          
          return snippetId;
        } catch (error) {
          // Rollback on error
          set((state) => ({
            snippets: state.snippets.filter(s => s.id !== tempId)
          }));
          throw error;
        }
      },
      addBatchSnippets: async (newSnippets) => {
        if (!auth.currentUser) throw new Error('User not authenticated');
        
        try {
          await addBatchSnippets(newSnippets);
        } catch (error) {
          console.error('Error adding batch snippets:', error);
          throw error;
        }
      },
      deleteSnippet: async (id) => {
        const previousSnippets = get().snippets;
        
        set((state) => ({
          snippets: state.snippets.filter((s) => s.id !== id)
        }));
        
        try {
          await firebaseDeleteSnippet(id);
        } catch (error) {
          // Rollback on error
          set({ snippets: previousSnippets });
          throw error;
        }
      },
      updateSnippet: async (id, updatedSnippet) => {
        const previousSnippets = get().snippets;
        
        // Ensure categories is always an array when updating
        const updates = {
          ...updatedSnippet,
          categories: Array.isArray(updatedSnippet.categories) ? updatedSnippet.categories : []
        };
        
        set((state) => ({
          snippets: state.snippets.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          )
        }));
        
        try {
          await firebaseUpdateSnippet(id, updates);
        } catch (error) {
          // Rollback on error
          set({ snippets: previousSnippets });
          throw error;
        }
      }
    }),
    {
      name: 'snippet-storage',
      partialize: (state) => ({ snippets: state.snippets })
    }
  )
);