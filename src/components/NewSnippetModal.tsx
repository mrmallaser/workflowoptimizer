import React from 'react';
import { Modal } from './Modal';
import { NewSnippetForm } from './NewSnippetForm';
import { Snippet } from '../types';
import toast from 'react-hot-toast';

interface NewSnippetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (snippet: Omit<Snippet, 'id' | 'createdAt' | 'userId'>) => Promise<void>;
}

export function NewSnippetModal({ isOpen, onClose, onSubmit }: NewSnippetModalProps) {
  const handleSubmit = async (name: string, content: string, categories: string[]) => {
    try {
      // Close modal immediately before the async operation
      onClose();
      
      // Add the snippet with categories
      await onSubmit({ name, content, categories });
      toast.success('Snippet added successfully!');
    } catch (error) {
      console.error('Error adding snippet:', error);
      toast.error('Failed to add snippet');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Snippet">
      <NewSnippetForm
        onSubmit={handleSubmit}
        isOpen={isOpen}
      />
    </Modal>
  );
}