/**
 * PKCE code verifier and code_challenge (S256) generation for OAuth 2.0
 */

const PKCE_LENGTH = 64;
const STATE_LENGTH = 32;
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';

function randomString(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => CHARS[b % CHARS.length]).join('');
}

/**
 * Generate a cryptographically random code_verifier (43-128 chars, per RFC 7636)
 */
export function generateCodeVerifier(): string {
  return randomString(PKCE_LENGTH);
}

/**
 * Generate a random state parameter for CSRF protection
 */
export function generateState(): string {
  return randomString(STATE_LENGTH);
}

/**
 * Compute code_challenge = BASE64URL(SHA256(code_verifier))
 */
export async function computeCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(digest));
}

function base64UrlEncode(buffer: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...buffer));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export interface BuildAuthorizeUrlParams {
  loginBaseUrl: string;
  clientId: string;
  redirectUri: string;
  state: string;
  codeChallenge: string;
  scope?: string;
}

/**
 * Build Salesforce OAuth 2.0 authorization URL with PKCE
 */
export function buildAuthorizeUrl(params: BuildAuthorizeUrlParams): string {
  const { loginBaseUrl, clientId, redirectUri, state, codeChallenge, scope = 'api id refresh_token' } = params;
  const base = loginBaseUrl.replace(/\/$/, '');
  const url = new URL(`${base}/services/oauth2/authorize`);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('state', state);
  url.searchParams.set('code_challenge', codeChallenge);
  url.searchParams.set('code_challenge_method', 'S256');
  url.searchParams.set('scope', scope);
  url.searchParams.set('prompt', 'login');
  return url.toString();
}
