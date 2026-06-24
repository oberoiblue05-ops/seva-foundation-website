"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { RecaptchaVerifier, type ConfirmationResult } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import Link from "next/link";
import { ORG } from "@/constants";
import { auth, getFirebaseError } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

type Step = "phone" | "otp";

export default function LoginPage() {
  const { user, loading, signInWithPhone, verifyOTP } = useAuth();
  const router = useRouter();

  const [step,               setStep]               = useState<Step>("phone");
  const [phone,              setPhone]              = useState("");
  const [otp,                setOtp]                = useState<string[]>(["", "", "", "", "", ""]);
  const [confirmation,       setConfirmation]       = useState<ConfirmationResult | null>(null);
  const [countdown,          setCountdown]          = useState(30);
  const [busy,               setBusy]               = useState(false);

  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);
  const inputRefs    = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if already signed in
  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [user, loading, router]);

  // Countdown timer for resend
  useEffect(() => {
    if (step !== "otp") return;
    setCountdown(30);
    const id = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(id); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [step]);

  // Clean up reCAPTCHA on unmount
  useEffect(() => {
    return () => {
      if (recaptchaRef.current) {
        recaptchaRef.current.clear();
        recaptchaRef.current = null;
      }
    };
  }, []);

  // ── Send OTP ────────────────────────────────────────────────────────────────

  const sendOTP = useCallback(async () => {
    if (phone.length !== 10) {
      toast.error("Enter a valid 10-digit mobile number.");
      return;
    }
    setBusy(true);
    try {
      // Clear any previous verifier
      if (recaptchaRef.current) {
        recaptchaRef.current.clear();
        recaptchaRef.current = null;
      }
      recaptchaRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });
      const result = await signInWithPhone("+91" + phone, recaptchaRef.current);
      setConfirmation(result);
      setStep("otp");
      toast.success("OTP sent to +91 " + phone);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      toast.error(getFirebaseError(code));
      // Clear broken verifier so next attempt is fresh
      if (recaptchaRef.current) {
        recaptchaRef.current.clear();
        recaptchaRef.current = null;
      }
    } finally {
      setBusy(false);
    }
  }, [phone, signInWithPhone]);

  // ── Verify OTP ──────────────────────────────────────────────────────────────

  const handleVerify = useCallback(async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      toast.error("Enter all 6 digits of the OTP.");
      return;
    }
    if (!confirmation) return;
    setBusy(true);
    try {
      await verifyOTP(confirmation, code);
      toast.success("Login successful! Welcome.");
      router.replace("/dashboard");
    } catch (err: unknown) {
      const code2 = (err as { code?: string }).code ?? "";
      toast.error(getFirebaseError(code2));
    } finally {
      setBusy(false);
    }
  }, [otp, confirmation, verifyOTP, router]);

  // ── OTP input handlers ───────────────────────────────────────────────────────

  const handleOtpChange = (index: number, value: string) => {
    // Handle paste (value.length > 1)
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, 6);
      const next = [...otp];
      for (let i = 0; i < digits.length; i++) {
        if (index + i < 6) next[index + i] = digits[i];
      }
      setOtp(next);
      const focus = Math.min(index + digits.length, 5);
      inputRefs.current[focus]?.focus();
      return;
    }
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter") handleVerify();
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setOtp(["", "", "", "", "", ""]);
    await sendOTP();
  };

  if (loading) return null;

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #0d3320 0%, #1B5E37 50%, #2d7a4f 100%)" }}
    >
      {/* Invisible reCAPTCHA mount point */}
      <div id="recaptcha-container" />

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#F5A623] mb-4 shadow-lg">
            <span className="text-3xl">🙏</span>
          </div>
          <h1 className="text-white font-bold text-2xl tracking-tight">{ORG.name}</h1>
          <p className="text-white/60 text-sm mt-1">Sign in to access your dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl">
          <AnimatePresence mode="wait">
            {step === "phone" ? (
              <motion.div
                key="phone"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="text-white font-semibold text-lg mb-1">Enter your mobile number</h2>
                <p className="text-white/60 text-sm mb-6">We&apos;ll send you a one-time password</p>

                <div className="flex rounded-2xl overflow-hidden border border-white/30 bg-white/10 focus-within:border-[#F5A623] transition-colors">
                  <div className="flex items-center px-4 gap-2 border-r border-white/20 shrink-0">
                    <span className="text-lg">🇮🇳</span>
                    <span className="text-white font-medium text-sm">+91</span>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    onKeyDown={(e) => e.key === "Enter" && sendOTP()}
                    placeholder="9876543210"
                    className="flex-1 bg-transparent px-4 py-4 text-white placeholder-white/30 outline-none text-base tracking-widest"
                  />
                </div>

                <button
                  onClick={sendOTP}
                  disabled={busy || phone.length !== 10}
                  className="mt-5 w-full bg-[#F5A623] hover:bg-[#e09818] disabled:opacity-50 disabled:cursor-not-allowed
                    text-white font-bold rounded-2xl py-4 text-base transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {busy ? (
                    <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Send OTP →"
                  )}
                </button>

                <p className="text-white/40 text-xs text-center mt-4">
                  By continuing, you agree to our{" "}
                  <Link href="/legal" className="underline hover:text-white/70">Privacy Policy</Link>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <button
                  onClick={() => { setStep("phone"); setOtp(["", "", "", "", "", ""]); }}
                  className="text-white/60 hover:text-white text-sm flex items-center gap-1 mb-4 transition-colors"
                >
                  ← Change number
                </button>
                <h2 className="text-white font-semibold text-lg mb-1">Enter OTP</h2>
                <p className="text-white/60 text-sm mb-6">
                  Sent to <span className="text-white font-medium">+91 {phone}</span>
                </p>

                {/* 6-box OTP input */}
                <div className="flex gap-2 justify-between mb-6">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { inputRefs.current[i] = el; }}
                      type="tel"
                      inputMode="numeric"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      onFocus={(e) => e.target.select()}
                      className="w-11 h-13 text-center text-xl font-bold text-white bg-white/10 border-2 border-white/30
                        focus:border-[#F5A623] rounded-xl outline-none transition-colors py-3"
                    />
                  ))}
                </div>

                <button
                  onClick={handleVerify}
                  disabled={busy || otp.join("").length !== 6}
                  className="w-full bg-[#F5A623] hover:bg-[#e09818] disabled:opacity-50 disabled:cursor-not-allowed
                    text-white font-bold rounded-2xl py-4 text-base transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {busy ? (
                    <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Verify & Sign In"
                  )}
                </button>

                {/* Resend */}
                <div className="text-center mt-5">
                  {countdown > 0 ? (
                    <p className="text-white/50 text-sm">
                      Resend OTP in <span className="text-white font-medium">{countdown}s</span>
                    </p>
                  ) : (
                    <button
                      onClick={handleResend}
                      disabled={busy}
                      className="text-[#F5A623] text-sm font-medium hover:underline disabled:opacity-50"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Admin link */}
        <p className="text-center mt-6 text-white/40 text-xs">
          Admin?{" "}
          <Link href="/admin" className="text-[#F5A623] hover:underline">
            Go to Admin Console
          </Link>
        </p>
      </div>
    </main>
  );
}
