"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signOut as fbSignOut } from "firebase/auth";
import { auth, getFirebaseError } from "@/lib/firebase";
import { ORG } from "@/constants";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [busy,     setBusy]     = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const cred   = await signInWithEmailAndPassword(auth, email, password);
      const token  = await cred.user.getIdTokenResult(true);

      if (token.claims.admin !== true) {
        await fbSignOut(auth);
        setError("Access denied. This account does not have admin privileges.");
        return;
      }

      router.replace("/admin/dashboard");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      setError(getFirebaseError(code));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #071a0e 0%, #0F3D22 60%, #1B5E37 100%)" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#F5A623] mb-4 shadow-lg">
            <span className="text-2xl">🛡️</span>
          </div>
          <h1 className="text-white font-bold text-xl">{ORG.name}</h1>
          <p className="text-white/50 text-sm mt-1">Admin Console</p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleLogin}
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl space-y-4"
        >
          <h2 className="text-white font-semibold text-lg mb-2">Sign in to Admin</h2>

          {error && (
            <div className="bg-red-500/20 border border-red-500/40 rounded-xl px-4 py-3 text-red-200 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-white/60 text-xs mb-1.5">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="admin@sevagroupfdn.org"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/25
                text-sm outline-none focus:border-[#F5A623] transition-colors"
            />
          </div>

          <div>
            <label className="block text-white/60 text-xs mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/25
                text-sm outline-none focus:border-[#F5A623] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-[#F5A623] hover:bg-[#e09818] disabled:opacity-50 text-white font-bold
              rounded-xl py-3.5 text-sm transition-all flex items-center justify-center gap-2 mt-2"
          >
            {busy ? (
              <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Sign In to Admin"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
