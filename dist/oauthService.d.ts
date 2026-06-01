export type OAuthProviderName = "google" | "github" | "normal";
export type OAuthProviderPreset = {
    authorizeUrl: string;
    tokenUrl: string;
    scopeSeparator?: string;
    responseType?: "code" | "token";
    additionalAuthParams?: Record<string, string>;
    defaultScopes?: string[];
};
export type OAuthConfig = {
    provider: OAuthProviderName | OAuthProviderPreset;
    clientId: string;
    clientSecret?: string;
    redirectUri: string;
    scopes?: string[];
    state?: string;
    extraAuthParams?: Record<string, string>;
    extraTokenParams?: Record<string, string>;
    responseType?: "code" | "token";
    grantType?: string;
    usePKCE?: boolean;
    pkceMethod?: "S256" | "plain";
    codeVerifier?: string;
};
export type OAuthAuthResponse = {
    code?: string;
    access_token?: string;
    token_type?: string;
    expires_in?: number;
    refresh_token?: string;
    error?: string;
    state?: string;
    [key: string]: string | number | undefined;
};
export type OAuthRequest = {
    authUrl: string;
    codeVerifier?: string;
    state?: string;
};
export declare function buildAuthUrl(config: OAuthConfig): string;
export declare function parseAuthResponse(url: string): OAuthAuthResponse;
export declare function createOAuthRequest(config: OAuthConfig): Promise<OAuthRequest>;
export declare function fetchToken(config: OAuthConfig, code: string, codeVerifier?: string): Promise<OAuthAuthResponse>;
export type PopupOptions = {
    width?: number;
    height?: number;
    timeoutMs?: number;
};
export declare function openAuthPopup(authUrl: string, redirectUri: string, options?: PopupOptions): Promise<OAuthAuthResponse>;
//# sourceMappingURL=oauthService.d.ts.map