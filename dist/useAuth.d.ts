import { AuthConfig, AuthResult } from "./authService";
export type UseAuthResult = {
    execute: () => Promise<AuthResult>;
    loading: boolean;
    error?: string;
    result?: AuthResult;
};
export declare function useAuth(config: AuthConfig): UseAuthResult;
//# sourceMappingURL=useAuth.d.ts.map