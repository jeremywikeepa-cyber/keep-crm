import { useState } from "react";
import { api } from "../lib/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Lock } from "lucide-react";

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.login(password);
      onLogin();
    } catch (err: any) {
      setError(err.message === "Invalid password" ? "Incorrect password. Try again." : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F7F7F7",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        position: "relative",
      }}
    >
      {/* Background grid pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.5,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 39px, #E8E8E8 39px, #E8E8E8 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, #E8E8E8 39px, #E8E8E8 40px)",
        }}
      />

      <div style={{ position: "relative", width: "100%", maxWidth: "360px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "52px",
            height: "52px",
            backgroundColor: "#111111",
            borderRadius: "12px",
            marginBottom: "16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}>
            <Lock style={{ width: "24px", height: "24px", color: "#FFFFFF" }} />
          </div>
          <h1 style={{
            fontSize: "24px",
            fontWeight: 600,
            color: "#111111",
            fontFamily: '"DM Sans", sans-serif',
            margin: "0 0 4px",
          }}>
            Keep Group
          </h1>
          <p style={{
            color: "#999999",
            fontSize: "11px",
            fontFamily: '"DM Sans", sans-serif',
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            margin: 0,
          }}>
            Trixie OS · Layer 2
          </p>
        </div>

        {/* Card */}
        <div style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E8E8E8",
          borderRadius: "12px",
          padding: "28px 32px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        }}>
          <div style={{ marginBottom: "20px" }}>
            <h2 style={{
              fontSize: "18px",
              fontWeight: 600,
              color: "#111111",
              fontFamily: '"DM Sans", sans-serif',
              margin: "0 0 4px",
            }}>
              Sign in
            </h2>
            <p style={{ fontSize: "14px", color: "#666666", fontFamily: '"DM Sans", sans-serif', margin: 0 }}>
              Enter your dashboard password to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <Label htmlFor="password">Password</Label>
              <div style={{ position: "relative" }}>
                <Lock style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#999999" }} />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  style={{ paddingLeft: "36px" }}
                  autoFocus
                  required
                />
              </div>
            </div>

            {error && (
              <div style={{
                fontSize: "13px",
                color: "#DC2626",
                backgroundColor: "#FEF2F2",
                border: "1px solid #FECACA",
                borderRadius: "6px",
                padding: "8px 12px",
                fontFamily: '"DM Sans", sans-serif',
              }}>
                {error}
              </div>
            )}

            <Button
              type="submit"
              style={{ width: "100%", backgroundColor: "#111111", color: "#FFFFFF" }}
              disabled={loading || !password}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p style={{
          textAlign: "center",
          fontSize: "12px",
          color: "#999999",
          fontFamily: '"DM Sans", sans-serif',
          marginTop: "20px",
        }}>
          Keep Group · Croydon NSW · keepmodular.com.au
        </p>
      </div>
    </div>
  );
}
