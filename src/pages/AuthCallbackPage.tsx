import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { handleCallback } from '../auth/oauthService';
import { useAuthContext } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setIdentity } = useAuthContext();
  const { addToast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code || !state) {
      setError('Missing code or state in callback URL.');
      setLoading(false);
      return;
    }

    handleCallback({ code, state })
      .then(() => {
        addToast('Connected successfully.', 'success');
        navigate('/app', { replace: true });
      })
      .catch((e) => {
        const msg = e instanceof Error ? e.message : 'Authentication failed';
        const ax = e as { isAxiosError?: boolean; response?: unknown; code?: string };
        const isCors =
          msg.includes('Network Error') ||
          msg.toLowerCase().includes('cors') ||
          ax.code === 'ERR_NETWORK' ||
          (ax.isAxiosError === true && ax.response == null);
        setError(isCors ? 'CORS_BLOCKED' : msg);
        addToast(isCors ? 'CORS: Add this origin in Salesforce' : 'Authentication failed', 'error');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [searchParams, navigate, addToast, setIdentity]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
        <p className="text-neutral-600 dark:text-neutral-400">Completing sign-in…</p>
      </div>
    );
  }

  if (error) {
    const isCorsHelp = error === 'CORS_BLOCKED';
    return (
      <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            Sign-in failed
          </h2>
          {isCorsHelp ? (
            <>
              <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                The browser was blocked by CORS when calling Salesforce’s token endpoint.
              </p>
              <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-3">
                In Salesforce, allow this app’s origin for OAuth:
              </p>
              <ol className="text-sm text-neutral-700 dark:text-neutral-300 list-decimal list-inside space-y-1 mb-4">
                <li>Setup → search for <strong>CORS</strong></li>
                <li>Open <strong>CORS Allowed Origins List</strong> (or “Allowed Origins List”)</li>
                <li>Add <strong>New</strong> and enter: <code className="font-mono bg-neutral-100 dark:bg-neutral-700 px-1 rounded break-all">http://localhost:5173</code></li>
                <li>In <strong>CORS Policy Settings</strong>, enable <strong>Enable CORS for OAuth endpoints</strong></li>
                <li>Save</li>
              </ol>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                Exact names may vary by org. If you don’t see CORS, check your Salesforce help for “CORS” and “OAuth”.
              </p>
            </>
          ) : (
            <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>
          )}
          <a
            href="/login"
            className="inline-block py-2 px-4 rounded border border-neutral-300 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-600"
          >
            Back to login
          </a>
        </div>
      </div>
    );
  }

  return null;
}
