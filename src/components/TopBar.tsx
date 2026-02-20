import { useAuthContext } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useApiVersion } from '../hooks/useApiVersion';
import { useQuery } from '@tanstack/react-query';
import { getAvailableApiVersions } from '../api/salesforceClient';
import { Button } from './Button';
import { Select } from './Select';

export function TopBar() {
  const { identity, logout } = useAuthContext();
  const { theme, toggleDark } = useTheme();
  const { apiVersion, setApiVersion } = useApiVersion();

  const instanceUrl = identity?.urls?.custom_domain ?? identity?.urls?.partner ?? '';

  const { data: versions = [] } = useQuery({
    queryKey: ['apiVersions'],
    queryFn: getAvailableApiVersions,
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const options = versions.map((v) => ({ value: v.version, label: v.label }));

  return (
    <header className="h-12 flex items-center justify-between px-4 border-b border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-sm shrink-0">
      <div className="flex items-center gap-4">
        <span className="font-semibold text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
          Universal Org Inspector
        </span>
        {instanceUrl && (
          <span className="text-sm text-neutral-600 dark:text-neutral-400 truncate max-w-[200px]" title={instanceUrl}>
            {instanceUrl.replace(/^https?:\/\//, '')}
          </span>
        )}
        {identity?.email && (
          <span className="text-sm text-neutral-600 dark:text-neutral-400 truncate max-w-[180px]" title={identity.email}>
            {identity.email}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Select
          options={options.length ? options : [{ value: apiVersion, label: apiVersion }]}
          value={apiVersion}
          onChange={(e) => setApiVersion(e.target.value)}
          className="w-28"
        />
        <Button variant="ghost" size="sm" onClick={toggleDark} title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
          {theme === 'dark' ? '☀' : '🌙'}
        </Button>
        <Button variant="secondary" size="sm" onClick={logout}>
          Logout
        </Button>
      </div>
    </header>
  );
}
