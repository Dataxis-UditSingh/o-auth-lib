import { describe, expect, it } from "vitest";
import { createOAuthRequest, parseAuthResponse } from "./oauthService";

describe("oauthService", () => {
  it("creates an OAuth request with PKCE and state", async () => {
    const request = await createOAuthRequest({
      provider: "google",
      clientId: "test-client",
      redirectUri: "https://app.test/callback",
      scopes: ["openid"],
      usePKCE: true,
    });

    expect(request.authUrl).toContain("code_challenge=");
    expect(request.authUrl).toContain("code_challenge_method=S256");
    expect(request.authUrl).toContain("state=");
    expect(request.codeVerifier).toBeDefined();
    expect(request.state).toBeDefined();
  });

  it("parses an OAuth redirect response", () => {
    const response = parseAuthResponse("https://app.test/callback?code=abc123&state=xyz");
    expect(response.code).toBe("abc123");
    expect(response.state).toBe("xyz");
  });
});
