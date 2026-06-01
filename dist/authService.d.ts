import { OAuthConfig } from "./oauthService";
export type NormalAuthConfig = {
    authType: "normal";
    provider: "normal" | string;
    serviceName?: string;
    authUrl: string;
    method?: "POST" | "PUT" | "PATCH" | "DELETE";
    contentType?: "application/json" | "application/x-www-form-urlencoded";
    email?: string;
    password?: string;
    credentials?: Record<string, string | number | boolean>;
    extraBody?: Record<string, unknown>;
    headers?: Record<string, string>;
};
export type OAuthAuthConfig = OAuthConfig & {
    authType: "oauth";
};
export type AuthConfig = OAuthAuthConfig | NormalAuthConfig;
export type AuthResult = {
    authType: "oauth" | "normal";
    provider: string;
    serviceName?: string;
    accessToken?: string | number;
    refreshToken?: string | number;
    data: any;
};
export declare function authenticate(config: AuthConfig): Promise<AuthResult>;
export declare function authenticateOAuth(config: OAuthAuthConfig): Promise<AuthResult>;
export declare function authenticateNormal(config: NormalAuthConfig): Promise<AuthResult>;
//# sourceMappingURL=authService.d.ts.map