declare module 'netlify-cms-oauth-provider-node' {
  export interface OAuthHandlers {
    begin: (params?: Record<string, string | null>) => Promise<string>;
    complete: (code: string, params?: Record<string, string>) => Promise<string>;
  }

  export function createHandlers(config: Record<string, string | string[]>): OAuthHandlers;
}
