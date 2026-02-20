/**
 * In-memory token store with optional sessionStorage mirror for page reload.
 * No localStorage usage.
 */

import type { AuthTokens } from '../types';

const SESSION_KEY = 'sf_org_inspector_tokens';

let memoryTokens: AuthTokens | null = null;

export function setTokens(tokens: AuthTokens): void {
  memoryTokens = tokens;
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(tokens));
  } catch {
    // sessionStorage full or unavailable
  }
}

export function getTokens(): AuthTokens | null {
  return memoryTokens;
}

export function clearTokens(): void {
  memoryTokens = null;
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

export function isAuthenticated(): boolean {
  return memoryTokens != null && Boolean(memoryTokens.access_token);
}

export function getAuthHeader(): string | null {
  const t = getTokens();
  return t ? `Bearer ${t.access_token}` : null;
}

export function getInstanceUrl(): string | null {
  const t = getTokens();
  return t ? t.instance_url : null;
}

/**
 * Restore tokens from sessionStorage on app load (e.g. after refresh)
 */
export function hydrateFromSession(): AuthTokens | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthTokens;
    if (parsed && typeof parsed.access_token === 'string' && typeof parsed.instance_url === 'string') {
      memoryTokens = parsed;
      return parsed;
    }
  } catch {
    // invalid or missing
  }
  memoryTokens = null;
  return null;
}

export function updateTokens(partial: Partial<AuthTokens>): void {
  if (!memoryTokens) return;
  memoryTokens = { ...memoryTokens, ...partial };
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(memoryTokens));
  } catch {
    // ignore
  }
}
