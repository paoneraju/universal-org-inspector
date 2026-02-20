/**
 * Auth hook: login, logout, tokens, identity. Hydrates from session on mount.
 */

import { useCallback, useEffect, useState } from 'react';
import * as tokenManager from '../auth/tokenManager';
import { startLogin, logout as oauthLogout } from '../auth/oauthService';
import { getIdentity } from '../api/salesforceClient';
import type { AuthTokens, OrgIdentity } from '../types';

export interface UseAuthReturn {
  isAuthenticated: boolean;
  tokens: AuthTokens | null;
  identity: OrgIdentity | null;
  identityLoading: boolean;
  login: (params: { loginUrl: string }) => Promise<void>;
  logout: () => void;
  setIdentity: (identity: OrgIdentity | null) => void;
}

export function useAuth(): UseAuthReturn {
  const [tokens, setTokensState] = useState<AuthTokens | null>(() => tokenManager.getTokens());
  const [identity, setIdentityState] = useState<OrgIdentity | null>(null);
  const [identityLoading, setIdentityLoading] = useState(false);

  useEffect(() => {
    const t = tokenManager.getTokens();
    if (!t) {
      const hydrated = tokenManager.hydrateFromSession();
      if (hydrated) setTokensState(hydrated);
    }
  }, []);

  useEffect(() => {
    if (!tokens?.access_token) return;
    setIdentityLoading(true);
    getIdentity()
      .then(setIdentityState)
      .catch(() => setIdentityState(null))
      .finally(() => setIdentityLoading(false));
  }, [tokens?.access_token]);

  const login = useCallback(async (params: { loginUrl: string }) => {
    await startLogin({ loginUrl: params.loginUrl });
  }, []);

  const logout = useCallback(() => {
    setTokensState(null);
    setIdentityState(null);
    oauthLogout('/login');
  }, []);

  const setIdentity = useCallback((v: OrgIdentity | null) => {
    setIdentityState(v);
  }, []);

  const isAuthenticated = Boolean(tokens?.access_token);

  return {
    isAuthenticated,
    tokens,
    identity,
    identityLoading,
    login,
    logout,
    setIdentity,
  };
}
