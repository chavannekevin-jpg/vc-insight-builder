import { useState, useEffect, useCallback } from 'react';

export interface QueuedQuestion {
  id: string;
  section: string;
  question: string;
  placeholder?: string;
  answer?: string;
  suggestionTitle: string;
  impact: 'high' | 'medium';
}

interface ImprovementQueueState {
  companyId: string;
  questions: QueuedQuestion[];
  updatedAt: string;
}

const STORAGE_KEY = 'improvement_queue';

export function useImprovementQueue(companyId: string | null) {
  const [queue, setQueue] = useState<QueuedQuestion[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load queue from localStorage on mount
  useEffect(() => {
    if (!companyId) {
      setQueue([]);
      setIsLoaded(true);
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: ImprovementQueueState = JSON.parse(stored);
        // Only load if same company
        if (parsed.companyId === companyId) {
          setQueue(parsed.questions);
        } else {
          setQueue([]);
        }
      }
    } catch (e) {
      console.error('Failed to load improvement queue:', e);
      setQueue([]);
    }
    setIsLoaded(true);
  }, [companyId]);

  // Persist queue to localStorage
  const persistQueue = useCallback((questions: QueuedQuestion[]) => {
    if (!companyId) return;
    
    try {
      const state: ImprovementQueueState = {
        companyId,
        questions,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to persist improvement queue:', e);
    }
  }, [companyId]);

  const addQuestion = useCallback((question: Omit<QueuedQuestion, 'answer'>) => {
    setQueue(prev => {
      // Check if already exists
      if (prev.some(q => q.id === question.id)) {
        return prev;
      }
      const updated = [...prev, { ...question, answer: '' }];
      persistQueue(updated);
      return updated;
    });
  }, [persistQueue]);

  const removeQuestion = useCallback((questionId: string) => {
    setQueue(prev => {
      const updated = prev.filter(q => q.id !== questionId);
      persistQueue(updated);
      return updated;
    });
  }, [persistQueue]);

  const updateAnswer = useCallback((questionId: string, answer: string) => {
    setQueue(prev => {
      const updated = prev.map(q => 
        q.id === questionId ? { ...q, answer } : q
      );
      persistQueue(updated);
      return updated;
    });
  }, [persistQueue]);

  const clearQueue = useCallback(() => {
    setQueue([]);
    if (companyId) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [companyId]);

  const isInQueue = useCallback((questionId: string) => {
    return queue.some(q => q.id === questionId);
  }, [queue]);

  const getQueuedBySection = useCallback((section: string) => {
    return queue.filter(q => q.section === section);
  }, [queue]);

  const getSectionGroups = useCallback(() => {
    const groups: Record<string, QueuedQuestion[]> = {};
    queue.forEach(q => {
      if (!groups[q.section]) {
        groups[q.section] = [];
      }
      groups[q.section].push(q);
    });
    return groups;
  }, [queue]);

  return {
    queue,
    isLoaded,
    addQuestion,
    removeQuestion,
    updateAnswer,
    clearQueue,
    isInQueue,
    getQueuedBySection,
    getSectionGroups,
    queueCount: queue.length
  };
}
