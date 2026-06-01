"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const oauthService_1 = require("./oauthService");
(0, vitest_1.describe)("oauthService", () => {
    (0, vitest_1.it)("creates an OAuth request with PKCE and state", async () => {
        const request = await (0, oauthService_1.createOAuthRequest)({
            provider: "google",
            clientId: "test-client",
            redirectUri: "https://app.test/callback",
            scopes: ["openid"],
            usePKCE: true,
        });
        (0, vitest_1.expect)(request.authUrl).toContain("code_challenge=");
        (0, vitest_1.expect)(request.authUrl).toContain("code_challenge_method=S256");
        (0, vitest_1.expect)(request.authUrl).toContain("state=");
        (0, vitest_1.expect)(request.codeVerifier).toBeDefined();
        (0, vitest_1.expect)(request.state).toBeDefined();
    });
    (0, vitest_1.it)("parses an OAuth redirect response", () => {
        const response = (0, oauthService_1.parseAuthResponse)("https://app.test/callback?code=abc123&state=xyz");
        (0, vitest_1.expect)(response.code).toBe("abc123");
        (0, vitest_1.expect)(response.state).toBe("xyz");
    });
});
//# sourceMappingURL=oauthService.test.js.map