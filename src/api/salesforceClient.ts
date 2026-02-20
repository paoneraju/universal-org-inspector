/**
 * Typed Salesforce REST API client with token injection and refresh on 401
 */

import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import * as tokenManager from '../auth/tokenManager';
import { refreshToken, logout } from '../auth/oauthService';
import type {
  SObjectListResponse,
  SObjectDescribe,
  ApiVersionItem,
  OrgIdentity,
} from '../types';

let apiVersion = 'v60.0';

export function setApiVersion(version: string): void {
  apiVersion = version;
}

export function getApiVersion(): string {
  return apiVersion;
}

function createClient(): AxiosInstance {
  const instance = axios.create({
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' },
  });

  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const tokens = tokenManager.getTokens();
    const baseUrl = tokenManager.getInstanceUrl();
    if (!tokens || !baseUrl) {
      return Promise.reject(new Error('Not authenticated'));
    }
    config.headers.Authorization = `Bearer ${tokens.access_token}`;
    if (config.url?.startsWith('/')) {
      config.baseURL = `${baseUrl}/services/data/${apiVersion}`;
    }
    return config;
  });

  let refreshing = false;
  let refreshPromise: Promise<unknown> | null = null;

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const original = error.config;
      if (error.response?.status === 401 && !original?._retry) {
        original._retry = true;
        if (!refreshing) {
          refreshing = true;
          refreshPromise = refreshToken().catch((e) => {
            tokenManager.clearTokens();
            logout('/login');
            throw e;
          });
        }
        try {
          await refreshPromise;
          const header = tokenManager.getAuthHeader();
          if (header) original.headers.Authorization = header;
          return instance(original);
        } finally {
          refreshing = false;
          refreshPromise = null;
        }
      }
      const message = error.response?.data?.message ?? error.response?.data?.[0]?.message ?? error.message ?? 'Request failed';
      return Promise.reject(new Error(typeof message === 'string' ? message : 'Request failed'));
    }
  );

  return instance;
}

const client = createClient();

export async function getAvailableApiVersions(): Promise<ApiVersionItem[]> {
  const base = tokenManager.getInstanceUrl();
  if (!base) throw new Error('Not authenticated');
  const { data } = await axios.get<{ version: string }[]>(`${base}/services/data/`, {
    headers: { Authorization: tokenManager.getAuthHeader() ?? '' },
    timeout: 15000,
  });
  return (Array.isArray(data) ? data : []).map((v) => ({
    version: v.version,
    label: `v${v.version}`,
    url: `${base}/services/data/v${v.version}`,
  }));
}

export async function getSObjectList(version: string): Promise<SObjectListResponse> {
  setApiVersion(version);
  const { data } = await client.get<SObjectListResponse>(`/sobjects/`);
  return data;
}

export async function describeSObject(version: string, objectApiName: string): Promise<SObjectDescribe> {
  setApiVersion(version);
  const { data } = await client.get<SObjectDescribe>(`/sobjects/${encodeURIComponent(objectApiName)}/describe`);
  return data;
}

interface IdentityResponse {
  user_id?: string;
  organization_id?: string;
  preferred_username?: string;
  email?: string;
  display_name?: string;
  urls?: Record<string, string>;
  [key: string]: unknown;
}

export async function getIdentity(): Promise<OrgIdentity> {
  const tokens = tokenManager.getTokens();
  if (!tokens?.id) throw new Error('No identity URL');
  const { data } = await axios.get<IdentityResponse>(tokens.id, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
    timeout: 10000,
  });
  return {
    user_id: data.user_id ?? '',
    organization_id: data.organization_id ?? '',
    username: data.preferred_username,
    display_name: data.display_name,
    email: data.email ?? data.preferred_username,
    urls: data.urls ?? {},
  };
}
