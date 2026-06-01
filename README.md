# o-auth-lib

A TypeScript authentication library for OAuth and normal login flows. The package is designed so consuming apps provide credentials and configuration at runtime, keeping the library reusable and secure.

## Usage

### OAuth login

`useAuth()` is the recommended hook for browser-based OAuth login flows.

```ts
import { useAuth } from "o-auth-lib";

const oauthConfig = {
  authType: "oauth" as const,
  provider: "google" as const,
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  redirectUri: import.meta.env.VITE_APP_REDIRECT_URI,
  scopes: ["openid", "profile", "email"],
  usePKCE: true,
};

function LoginButton() {
  const { execute, loading, error, result } = useAuth(oauthConfig);

  return (
    <button onClick={() => execute()} disabled={loading}>
      {loading ? "Signing in..." : "Sign in with Google"}
      {error && <div>{error}</div>}
      {result && <div>Authenticated</div>}
    </button>
  );
}
```

> `usePKCE` is enabled by default for OAuth code flows, so browser apps do not need to use `clientSecret` in the frontend.

### Generic authentication helper

For normal login flows, use `authenticate()` with a configurable auth endpoint.

```ts
import { authenticate } from "o-auth-lib";

const normalConfig = {
  authType: "normal" as const,
  provider: "normal",
  serviceName: "my-service",
  authUrl: "https://api.example.com/auth/login",
  email: "user@example.com",
  password: "secret-password",
  contentType: "application/json",
};

async function login() {
  const result = await authenticate(normalConfig);
  console.log(result.accessToken, result.data);
}
```

### Custom provider example

```ts
import { authenticate } from "o-auth-lib";

const customOAuthConfig = {
  authType: "oauth" as const,
  provider: {
    authorizeUrl: "https://custom.example.com/oauth/authorize",
    tokenUrl: "https://custom.example.com/oauth/token",
    responseType: "code",
    scopeSeparator: " ",
  },
  clientId: import.meta.env.VITE_CUSTOM_CLIENT_ID,
  redirectUri: import.meta.env.VITE_APP_REDIRECT_URI,
  scopes: ["read", "write"],
};

const result = await authenticate(customOAuthConfig);
```

## Supported provider presets

- `google`
- `github`
- custom provider objects using `provider: { authorizeUrl, tokenUrl, ... }`

## Important notes

- Do not store real credentials inside the published package.
- Pass `clientId` and other credentials from consuming apps, for example via environment variables.
- `clientSecret` should not be used in browser-only OAuth flows unless the application is a confidential client and the token exchange is performed on a trusted backend.
- The package publishes only `dist/` via `package.json` `files`, so local `.env` files are not included in the npm package.
