import { useQuery } from '@tanstack/react-query';
import { describeSObject } from '../api/salesforceClient';

const STALE_TIME_MS = 10 * 60 * 1000;

export function useSObjectDescribe(objectApiName: string | undefined, apiVersion: string) {
  const query = useQuery({
    queryKey: ['describe', apiVersion, objectApiName ?? ''],
    queryFn: () => describeSObject(apiVersion, objectApiName!),
    enabled: Boolean(objectApiName) && Boolean(apiVersion),
    staleTime: STALE_TIME_MS,
    refetchOnWindowFocus: false,
  });

  return {
    describe: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
