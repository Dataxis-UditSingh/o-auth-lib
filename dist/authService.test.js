"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const authService_1 = require("./authService");
const originalFetch = global.fetch;
(0, vitest_1.afterEach)(() => {
    vitest_1.vi.restoreAllMocks();
    global.fetch = originalFetch;
});
(0, vitest_1.describe)("authService", () => {
    (0, vitest_1.it)("sends JSON normal auth payload", async () => {
        const fetchMock = vitest_1.vi.fn(() => Promise.resolve({
            ok: true,
            json: async () => ({ access_token: "abc123" }),
        }));
        global.fetch = fetchMock;
        const result = await (0, authService_1.authenticate)({
            authType: "normal",
            provider: "normal",
            authUrl: "https://example.com/login",
            email: "user@example.com",
            password: "secret",
            contentType: "application/json",
        });
        (0, vitest_1.expect)(fetchMock).toHaveBeenCalled();
        (0, vitest_1.expect)(result.accessToken).toBe("abc123");
    });
    (0, vitest_1.it)("sends form-urlencoded normal auth payload", async () => {
        const fetchMock = vitest_1.vi.fn(() => Promise.resolve({
            ok: true,
            json: async () => ({ access_token: "abc123" }),
        }));
        global.fetch = fetchMock;
        const result = await (0, authService_1.authenticate)({
            authType: "normal",
            provider: "normal",
            authUrl: "https://example.com/login",
            email: "user@example.com",
            password: "secret",
            contentType: "application/x-www-form-urlencoded",
        });
        (0, vitest_1.expect)(fetchMock).toHaveBeenCalledWith("https://example.com/login", vitest_1.expect.objectContaining({
            method: "POST",
            headers: vitest_1.expect.objectContaining({
                "Content-Type": "application/x-www-form-urlencoded",
            }),
        }));
        (0, vitest_1.expect)(result.accessToken).toBe("abc123");
    });
});
//# sourceMappingURL=authService.test.js.map