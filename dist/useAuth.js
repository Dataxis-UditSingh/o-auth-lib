"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAuth = useAuth;
const react_1 = require("react");
const authService_1 = require("./authService");
function useAuth(config) {
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)();
    const [result, setResult] = (0, react_1.useState)();
    const execute = (0, react_1.useCallback)(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const response = await (0, authService_1.authenticate)(config);
            setResult(response);
            return response;
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            setError(message);
            throw err;
        }
        finally {
            setLoading(false);
        }
    }, [config]);
    return { execute, loading, error, result };
}
//# sourceMappingURL=useAuth.js.map