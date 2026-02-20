import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSObjectList } from '../api/salesforceClient';

const STALE_TIME_MS = 5 * 60 * 1000;

export function useSObjects(apiVersion: string) {
  const [searchTerm, setSearchTerm] = useState('');
  const [includeStandard, setIncludeStandard] = useState(true);
  const [includeCustom, setIncludeCustom] = useState(true);

  const query = useQuery({
    queryKey: ['sobjects', apiVersion],
    queryFn: () => getSObjectList(apiVersion),
    staleTime: STALE_TIME_MS,
    refetchOnWindowFocus: false,
  });

  const filteredSObjects = useMemo(() => {
    const list = query.data?.sobjects ?? [];
    const term = searchTerm.trim().toLowerCase();
    return list.filter((o) => {
      if (!includeStandard && !o.custom) return false;
      if (!includeCustom && o.custom) return false;
      if (term && !o.name.toLowerCase().includes(term) && !o.label.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [query.data?.sobjects, searchTerm, includeStandard, includeCustom]);

  return {
    sobjects: filteredSObjects,
    allSObjects: query.data?.sobjects ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    searchTerm,
    setSearchTerm,
    includeStandard,
    setIncludeStandard,
    includeCustom,
    setIncludeCustom,
  };
}
