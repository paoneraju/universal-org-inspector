/**
 * OAuth 2.0 Authorization Code Flow with PKCE for Salesforce.
 * Redirect URI: http://localhost:5173/auth/callback (adjust for production)
 */

import axios from 'axios';
import {
  generateCodeVerifier,
  generateState,
  computeCodeChallenge,
  buildAuthorizeUrl,
} from './pkce';
import * as tokenManager from './tokenManager';
import type { AuthTokens } from '../types';

const REDIRECT_URI = 'http://localhost:5173/auth/callback';
const PKCE_STATE_KEY = 'sf_org_inspector_oauth_state';
const PKCE_VERIFIER_KEY = 'sf_org_inspector_oauth_verifier';
const LOGIN_URL_KEY = 'sf_org_inspector_login_url';

function getClientId(): string {
  const id = import.meta.env.VITE_SF_CLIENT_ID;
  if (typeof id !== 'string' || !id.trim()) {
    throw new Error('VITE_SF_CLIENT_ID is not set. Configure it in .env');
  }
  return id.trim();
}

function persistPkceState(state: string, verifier: string, loginUrl: string): void {
  try {
    sessionStorage.setItem(PKCE_STATE_KEY, state);
    sessionStorage.setItem(PKCE_VERIFIER_KEY, verifier);
    sessionStorage.setItem(LOGIN_URL_KEY, loginUrl);
  } catch {
    throw new Error('Could not store OAuth state');
  }
}

function getStoredPkce(): { state: string; verifier: string; loginUrl: string } | null {
  try {
    const state = sessionStorage.getItem(PKCE_STATE_KEY);
    const verifier = sessionStorage.getItem(PKCE_VERIFIER_KEY);
    const loginUrl = sessionStorage.getItem(LOGIN_URL_KEY);
    if (state && verifier && loginUrl) return { state, verifier, loginUrl };
  } catch {
    // ignore
  }
  return null;
}

function clearPkceStorage(): void {
  try {
    sessionStorage.removeItem(PKCE_STATE_KEY);
    sessionStorage.removeItem(PKCE_VERIFIER_KEY);
    sessionStorage.removeItem(LOGIN_URL_KEY);
  } catch {
    // ignore
  }
}

export interface LoginParams {
  loginUrl: string;
}

/**
 * Start OAuth flow: generate PKCE, store in sessionStorage, redirect to Salesforce
 */
export async function startLogin(params: LoginParams): Promise<void> {
  const clientId = getClientId();
  const loginBase = params.loginUrl.replace(/\/$/, '');
  const verifier = generateCodeVerifier();
  const state = generateState();
  const codeChallenge = await computeCodeChallenge(verifier);
  persistPkceState(state, verifier, loginBase);
  const url = buildAuthorizeUrl({
    loginBaseUrl: loginBase,
    clientId,
    redirectUri: REDIRECT_URI,
    state,
    codeChallenge,
  });
  window.location.assign(url);
}

export interface CallbackParams {
  code: string;
  state: string;
}

export interface CallbackResult {
  tokens: AuthTokens;
}

/**
 * Handle redirect: validate state, exchange code for tokens
 */
export async function handleCallback(params: CallbackParams): Promise<CallbackResult> {
  const stored = getStoredPkce();
  if (!stored) {
    throw new Error('No OAuth state found. Please start login again.');
  }
  if (stored.state !== params.state) {
    clearPkceStorage();
    throw new Error('Invalid state. Possible CSRF. Please try again.');
  }
  clearPkceStorage();

  const tokenUrl = `${stored.loginUrl}/services/oauth2/token`;
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: params.code,
    redirect_uri: REDIRECT_URI,
    code_verifier: stored.verifier,
    client_id: getClientId(),
  });

  const response = await axios.post<AuthTokens>(tokenUrl, body, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    timeout: 30000,
    validateStatus: (s) => s === 200,
  });

  if (response.status !== 200 || !response.data.access_token) {
    const msg = (response.data as { error_description?: string })?.error_description ?? 'Token exchange failed';
    throw new Error(msg);
  }

  const tokens = response.data;
  tokenManager.setTokens(tokens);
  return { tokens };
}

/**
 * Refresh access token using refresh_token
 */
export async function refreshToken(): Promise<AuthTokens> {
  const tokens = tokenManager.getTokens();
  if (!tokens?.refresh_token) {
    throw new Error('No refresh token');
  }
  const loginUrl = getStoredLoginUrlFromTokens(tokens);
  const tokenUrl = `${loginUrl}/services/oauth2/token`;
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: tokens.refresh_token,
    client_id: getClientId(),
  });

  const response = await axios.post<AuthTokens>(tokenUrl, body, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    timeout: 30000,
    validateStatus: (s) => s === 200,
  });

  if (response.status !== 200 || !response.data.access_token) {
    const msg = (response.data as { error_description?: string })?.error_description ?? 'Token refresh failed';
    throw new Error(msg);
  }

  const newTokens = { ...tokens, ...response.data };
  tokenManager.updateTokens(newTokens);
  return newTokens;
}

function getStoredLoginUrlFromTokens(tokens: AuthTokens): string {
  const id = tokens.id;
  if (id && id.startsWith('https://')) {
    try {
      const u = new URL(id);
      return `${u.protocol}//${u.hostname}`;
    } catch {
      // fallback
    }
  }
  return 'https://login.salesforce.com';
}

/**
 * Logout: clear tokens and PKCE, then navigate to login
 */
export function logout(loginPath: string = '/login'): void {
  tokenManager.clearTokens();
  clearPkceStorage();
  window.location.href = loginPath;
}

export { REDIRECT_URI };
