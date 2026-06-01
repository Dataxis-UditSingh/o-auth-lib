import { describe, expect, it, vi, afterEach } from "vitest";
import { authenticate } from "./authService";

const originalFetch = global.fetch;

afterEach(() => {
  vi.restoreAllMocks();
  global.fetch = originalFetch;
});

describe("authService", () => {
  it("sends JSON normal auth payload", async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ access_token: "abc123" }),
      } as any)
    );

    global.fetch = fetchMock as any;

    const result = await authenticate({
      authType: "normal",
      provider: "normal",
      authUrl: "https://example.com/login",
      email: "user@example.com",
      password: "secret",
      contentType: "application/json",
    });

    expect(fetchMock).toHaveBeenCalled();
    expect(result.accessToken).toBe("abc123");
  });

  it("sends form-urlencoded normal auth payload", async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ access_token: "abc123" }),
      } as any)
    );

    global.fetch = fetchMock as any;

    const result = await authenticate({
      authType: "normal",
      provider: "normal",
      authUrl: "https://example.com/login",
      email: "user@example.com",
      password: "secret",
      contentType: "application/x-www-form-urlencoded",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.com/login",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/x-www-form-urlencoded",
        }),
      })
    );
    expect(result.accessToken).toBe("abc123");
  });
});
