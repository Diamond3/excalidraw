import { useEffect, useState } from "react";

type State =
  | { kind: "loading" }
  | { kind: "ok" }
  | { kind: "prompt"; error?: string };

export const AuthGate = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/auth/check", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (!data.required || data.authenticated) {
          setState({ kind: "ok" });
        } else {
          setState({ kind: "prompt" });
        }
      })
      .catch(() => setState({ kind: "ok" }));
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setState({ kind: "prompt", error: "Wrong password" });
        setSubmitting(false);
        return;
      }
      window.location.reload();
    } catch {
      setState({ kind: "prompt", error: "Network error" });
      setSubmitting(false);
    }
  };

  if (state.kind === "loading") {
    return null;
  }

  if (state.kind === "prompt") {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1e1e2e",
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
          zIndex: 99999,
        }}
      >
        <form
          onSubmit={onSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            width: "320px",
            padding: "1.5rem",
            background: "#2a2a3e",
            borderRadius: "8px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.1rem" }}>Password required</h2>
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: "0.5rem 0.75rem",
              borderRadius: "4px",
              border: "1px solid #444",
              background: "#1e1e2e",
              color: "#fff",
              fontSize: "1rem",
            }}
          />
          {state.error && (
            <div style={{ color: "#ff6b6b", fontSize: "0.85rem" }}>
              {state.error}
            </div>
          )}
          <button
            type="submit"
            disabled={submitting || !password}
            style={{
              padding: "0.5rem",
              background: "#e03131",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              fontWeight: 600,
              cursor: submitting || !password ? "not-allowed" : "pointer",
              opacity: submitting || !password ? 0.6 : 1,
            }}
          >
            {submitting ? "Checking..." : "Unlock"}
          </button>
        </form>
      </div>
    );
  }

  return <>{children}</>;
};
