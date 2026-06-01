import { useCallback, useState } from "react";
import { authenticate, AuthConfig, AuthResult } from "./authService";

export type UseAuthResult = {
  execute: () => Promise<AuthResult>;
  loading: boolean;
  error?: string;
  result?: AuthResult;
};

export function useAuth(config: AuthConfig): UseAuthResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [result, setResult] = useState<AuthResult>();

  const execute = useCallback(async () => {
    setLoading(true);
    setError(undefined);

    try {
      const response = await authenticate(config);
      setResult(response);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [config]);

  return { execute, loading, error, result };
}
