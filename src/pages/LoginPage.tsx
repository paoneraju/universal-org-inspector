import { useState } from 'react';
import { useAuthContext } from '../contexts/AuthContext';

const LOGIN_SALESFORCE = 'https://login.salesforce.com';
const TEST_SALESFORCE = 'https://test.salesforce.com';

export function LoginPage() {
  const { login } = useAuthContext();
  const [customUrl, setCustomUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (url: string) => {
    setError(null);
    setLoading(true);
    try {
      await login({ loginUrl: url });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-sm p-6">
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
          Universal Org Inspector
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
          Connect to any Salesforce org using OAuth 2.0 (PKCE). No backend required.
        </p>

        <div className="space-y-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleLogin(LOGIN_SALESFORCE)}
            className="w-full py-2.5 px-4 rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-600 disabled:opacity-50"
          >
            Production (login.salesforce.com)
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleLogin(TEST_SALESFORCE)}
            className="w-full py-2.5 px-4 rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-600 disabled:opacity-50"
          >
            Sandbox (test.salesforce.com)
          </button>

          <div className="pt-2">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Custom My Domain
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://mycompany.my.salesforce.com"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                className="flex-1 py-2 px-3 rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 text-sm"
              />
              <button
                type="button"
                disabled={loading || !customUrl.trim()}
                onClick={() => handleLogin(customUrl.trim())}
                className="py-2 px-4 rounded border border-neutral-300 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-600 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-500 disabled:opacity-50"
              >
                Connect
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 text-sm">
            {error}
          </div>
        )}

        <p className="mt-6 text-xs text-neutral-500 dark:text-neutral-400">
          Ensure your Connected App has Redirect URI: <code className="font-mono bg-neutral-100 dark:bg-neutral-700 px-1 rounded">http://localhost:5173/auth/callback</code> and that PKCE is enabled. Do not use a client secret.
        </p>
      </div>
    </div>
  );
}
