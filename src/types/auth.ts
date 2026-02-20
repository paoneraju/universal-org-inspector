/**
 * OAuth token response from Salesforce /services/oauth2/token
 */
export interface AuthTokens {
  access_token: string;
  refresh_token?: string;
  instance_url: string;
  id: string;
  token_type: string;
  issued_at: string;
  signature: string;
  id_token?: string;
}

/**
 * Identity response from Salesforce identity URL (id claim or /id endpoint)
 */
export interface OrgIdentity {
  user_id: string;
  organization_id: string;
  username?: string;
  display_name?: string;
  email?: string;
  urls: Record<string, string>;
}
