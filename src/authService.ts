import {
  createOAuthRequest,
  fetchToken,
  openAuthPopup,
  OAuthAuthResponse,
  OAuthConfig,
} from "./oauthService";

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

export async function authenticate(config: AuthConfig): Promise<AuthResult> {
  if (config.authType === "normal") {
    return authenticateNormal(config);
  }

  return authenticateOAuth(config);
}

export async function authenticateOAuth(config: OAuthAuthConfig): Promise<AuthResult> {
  const authRequest = await createOAuthRequest(config);
  const oauthResult = await openAuthPopup(authRequest.authUrl, config.redirectUri);

  if (authRequest.state && oauthResult.state !== authRequest.state) {
    throw new Error("OAuth state mismatch detected.");
  }

  if (oauthResult.error) {
    throw new Error(oauthResult.error as string);
  }

  const tokenResponse = oauthResult.code
    ? await fetchToken(config, oauthResult.code, authRequest.codeVerifier)
    : oauthResult;

  return {
    authType: "oauth",
    provider: typeof config.provider === "string" ? config.provider : "custom",
    serviceName: config.provider === "normal" ? "normal" : undefined,
    accessToken: tokenResponse.access_token || tokenResponse.token || tokenResponse.accessToken,
    refreshToken: tokenResponse.refresh_token || tokenResponse.refreshToken,
    data: tokenResponse,
  };
}

function buildNormalBody(config: NormalAuthConfig): string {
  const payload = {
    ...(config.credentials || {}),
    ...(config.email !== undefined ? { email: config.email } : {}),
    ...(config.password !== undefined ? { password: config.password } : {}),
    ...(config.extraBody || {}),
  };

  if ((config.contentType || "application/json") === "application/x-www-form-urlencoded") {
    return new URLSearchParams(
      Object.entries(payload).reduce<Record<string, string>>((result, [key, value]) => {
        result[key] = String(value ?? "");
        return result;
      }, {})
    ).toString();
  }

  return JSON.stringify(payload);
}

export async function authenticateNormal(config: NormalAuthConfig): Promise<AuthResult> {
  const method = config.method || "POST";
  const contentType = config.contentType || "application/json";
  const body = buildNormalBody(config);

  const response = await fetch(config.authUrl, {
    method,
    headers: {
      "Content-Type": contentType,
      Accept: "application/json",
      ...config.headers,
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Normal auth request failed: ${response.status} ${response.statusText} - ${text}`);
  }

  const data = await response.json();

  return {
    authType: "normal",
    provider: config.provider,
    serviceName: config.serviceName,
    accessToken: data.access_token || data.token || data.accessToken,
    refreshToken: data.refresh_token || data.refreshToken,
    data,
  };
}
