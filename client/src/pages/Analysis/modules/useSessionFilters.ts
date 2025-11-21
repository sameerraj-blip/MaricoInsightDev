import { useEffect, useState } from 'react';
import { Session } from '../types';

interface UseSessionFiltersProps {
  sessions: Session[] | undefined;
  searchQuery: string;
  sortOrder: 'newest' | 'oldest';
}

/**
 * Custom hook for filtering and sorting sessions
 * Handles search and sort logic for the sessions list
 */
export const useSessionFilters = ({
  sessions,
  searchQuery,
  sortOrder,
}: UseSessionFiltersProps) => {
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);

  useEffect(() => {
    if (!sessions) {
      setFilteredSessions([]);
      return;
    }

    // Filter sessions by search query
    let filtered = sessions.filter(
      (session) =>
        session.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort sessions by lastUpdatedAt
    filtered = [...filtered].sort((a, b) => {
      if (sortOrder === 'newest') {
        return b.lastUpdatedAt - a.lastUpdatedAt; // Newest first
      } else {
        return a.lastUpdatedAt - b.lastUpdatedAt; // Oldest first
      }
    });

    setFilteredSessions(filtered);
  }, [sessions, searchQuery, sortOrder]);

  return filteredSessions;
};

