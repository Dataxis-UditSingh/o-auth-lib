"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildAuthUrl = buildAuthUrl;
exports.parseAuthResponse = parseAuthResponse;
exports.createOAuthRequest = createOAuthRequest;
exports.fetchToken = fetchToken;
exports.openAuthPopup = openAuthPopup;
const providerPresets = {
    google: {
        authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenUrl: "https://oauth2.googleapis.com/token",
        scopeSeparator: " ",
        responseType: "code",
        defaultScopes: ["openid", "profile", "email"],
    },
    github: {
        authorizeUrl: "https://github.com/login/oauth/authorize",
        tokenUrl: "https://github.com/login/oauth/access_token",
        scopeSeparator: " ",
        responseType: "code",
        additionalAuthParams: {
            allow_signup: "true",
        },
    },
    normal: {
        authorizeUrl: "",
        tokenUrl: "",
        scopeSeparator: " ",
        responseType: "code",
    },
};
function normalizeProvider(config) {
    if (typeof config.provider === "string") {
        const preset = providerPresets[config.provider];
        if (!preset) {
            throw new Error(`OAuth provider preset "${config.provider}" is not defined.`);
        }
        return preset;
    }
    return config.provider;
}
function generateRandomString(length = 64) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array)
        .map((byte) => (byte % 36).toString(36))
        .join("");
}
async function sha256(value) {
    const encoder = new TextEncoder();
    const data = encoder.encode(value);
    return crypto.subtle.digest("SHA-256", data);
}
function base64UrlEncode(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
    });
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
async function createCodeChallenge(verifier, method = "S256") {
    if (method === "plain") {
        return verifier;
    }
    const digest = await sha256(verifier);
    return base64UrlEncode(digest);
}
function buildAuthUrl(config) {
    const provider = normalizeProvider(config);
    if (!provider.authorizeUrl) {
        throw new Error("The OAuth provider authorizeUrl is required.");
    }
    const params = new URLSearchParams({
        response_type: config.responseType || provider.responseType || "code",
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        scope: (config.scopes || provider.defaultScopes || []).join(provider.scopeSeparator || " "),
        state: config.state || generateRandomString(16),
        ...provider.additionalAuthParams,
        ...config.extraAuthParams,
    });
    return `${provider.authorizeUrl}?${params.toString()}`;
}
function parseAuthResponse(url) {
    const parsed = new URL(url, window.location.origin);
    const searchParams = new URLSearchParams(parsed.search);
    const hashParams = new URLSearchParams(parsed.hash.replace(/^#/, ""));
    const combined = new URLSearchParams();
    searchParams.forEach((value, key) => combined.append(key, value));
    hashParams.forEach((value, key) => combined.append(key, value));
    const result = {};
    combined.forEach((value, key) => {
        if (key === "expires_in") {
            result.expires_in = Number(value);
        }
        else {
            result[key] = value;
        }
    });
    return result;
}
async function createOAuthRequest(config) {
    const provider = normalizeProvider(config);
    if (!provider.authorizeUrl) {
        throw new Error("The OAuth provider authorizeUrl is required.");
    }
    const state = config.state || generateRandomString(16);
    const extraAuthParams = {
        ...provider.additionalAuthParams,
        ...config.extraAuthParams,
    };
    let codeVerifier;
    if (config.usePKCE !== false && (config.responseType || provider.responseType || "code") === "code") {
        codeVerifier = config.codeVerifier || generateRandomString(128);
        const codeChallenge = await createCodeChallenge(codeVerifier, config.pkceMethod || "S256");
        extraAuthParams.code_challenge = codeChallenge;
        extraAuthParams.code_challenge_method = config.pkceMethod || "S256";
    }
    const authUrl = buildAuthUrl({
        ...config,
        state,
        extraAuthParams,
    });
    return { authUrl, codeVerifier, state };
}
async function fetchToken(config, code, codeVerifier) {
    const provider = normalizeProvider(config);
    if (!provider.tokenUrl) {
        throw new Error("The OAuth provider tokenUrl is required to exchange the authorization code.");
    }
    const body = new URLSearchParams({
        grant_type: config.grantType || "authorization_code",
        code,
        redirect_uri: config.redirectUri,
        client_id: config.clientId,
        ...config.extraTokenParams,
    });
    if (codeVerifier) {
        body.append("code_verifier", codeVerifier);
    }
    if (config.clientSecret) {
        body.append("client_secret", config.clientSecret);
    }
    const response = await fetch(provider.tokenUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
        },
        body: body.toString(),
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Token request failed: ${response.status} ${response.statusText} - ${text}`);
    }
    const data = await response.json();
    return data;
}
async function openAuthPopup(authUrl, redirectUri, options = {}) {
    var _a;
    const width = options.width || 500;
    const height = options.height || 650;
    const left = window.screenX + (window.innerWidth - width) / 2;
    const top = window.screenY + (window.innerHeight - height) / 2;
    const popup = window.open(authUrl, "oauth_popup", `width=${width},height=${height},left=${left},top=${top},resizable,scrollbars=yes`);
    if (!popup) {
        throw new Error("Unable to open OAuth popup window. Please allow popups for this site.");
    }
    const start = Date.now();
    const timeoutMs = (_a = options.timeoutMs) !== null && _a !== void 0 ? _a : 120000;
    return new Promise((resolve, reject) => {
        const interval = window.setInterval(() => {
            if (popup.closed) {
                clearInterval(interval);
                reject(new Error("OAuth popup was closed before authentication completed."));
                return;
            }
            try {
                const popupUrl = popup.location.href;
                if (!popupUrl || popupUrl === "about:blank") {
                    return;
                }
                if (popupUrl.startsWith(redirectUri) || popup.location.search.includes("code") || popup.location.hash) {
                    const result = parseAuthResponse(popupUrl);
                    popup.close();
                    clearInterval(interval);
                    resolve(result);
                }
            }
            catch (error) {
                // Cross-origin access is expected until redirect back to our origin.
            }
            if (Date.now() - start > timeoutMs) {
                clearInterval(interval);
                popup.close();
                reject(new Error("OAuth popup timeout exceeded."));
            }
        }, 500);
    });
}
//# sourceMappingURL=oauthService.js.map