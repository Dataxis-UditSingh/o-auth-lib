"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.authenticateOAuth = authenticateOAuth;
exports.authenticateNormal = authenticateNormal;
const oauthService_1 = require("./oauthService");
async function authenticate(config) {
    if (config.authType === "normal") {
        return authenticateNormal(config);
    }
    return authenticateOAuth(config);
}
async function authenticateOAuth(config) {
    const authRequest = await (0, oauthService_1.createOAuthRequest)(config);
    const oauthResult = await (0, oauthService_1.openAuthPopup)(authRequest.authUrl, config.redirectUri);
    if (authRequest.state && oauthResult.state !== authRequest.state) {
        throw new Error("OAuth state mismatch detected.");
    }
    if (oauthResult.error) {
        throw new Error(oauthResult.error);
    }
    const tokenResponse = oauthResult.code
        ? await (0, oauthService_1.fetchToken)(config, oauthResult.code, authRequest.codeVerifier)
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
function buildNormalBody(config) {
    const payload = {
        ...(config.credentials || {}),
        ...(config.email !== undefined ? { email: config.email } : {}),
        ...(config.password !== undefined ? { password: config.password } : {}),
        ...(config.extraBody || {}),
    };
    if ((config.contentType || "application/json") === "application/x-www-form-urlencoded") {
        return new URLSearchParams(Object.entries(payload).reduce((result, [key, value]) => {
            result[key] = String(value !== null && value !== void 0 ? value : "");
            return result;
        }, {})).toString();
    }
    return JSON.stringify(payload);
}
async function authenticateNormal(config) {
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
//# sourceMappingURL=authService.js.map