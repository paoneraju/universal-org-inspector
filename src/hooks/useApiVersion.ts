import { useState, useCallback } from 'react';
import { getApiVersion, setApiVersion } from '../api/salesforceClient';

const DEFAULT_VERSION = 'v60.0';

export function useApiVersion() {
  const [version, setVersionState] = useState<string>(() => getApiVersion() || DEFAULT_VERSION);

  const setVersion = useCallback((v: string) => {
    setApiVersion(v);
    setVersionState(v);
  }, []);

  return { apiVersion: version, setApiVersion: setVersion };
}
