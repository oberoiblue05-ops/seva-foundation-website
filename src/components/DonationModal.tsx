"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { X, CheckCircle2, Download, AlertTriangle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import type { Donation } from "@/types";
import { generateDonationReceipt } from "@/lib/generate-receipt";
import { trackDonation } from "@/lib/track-conversion";
import { ORG } from "@/constants";

// ─── Razorpay checkout types ──────────────────────────────────────────────────

interface RazorpayPaymentResponse {
  razorpay_order_id:  string;
  razorpay_payment_id: string;
  razorpay_signature:  string;
}

interface RazorpayOptions {
  key:         string;
  amount:      number;
  currency:    string;
  name:        string;
  description: string;
  order_id:    string;
  prefill:     { name: string; email: string; contact: string };
  notes?:      Record<string, string>;
  theme:       { color: string };
  handler:     (r: RazorpayPaymentResponse) => void;
  modal?:      { ondismiss?: () => void; escape?: boolean };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
  }
}

// ─── Utility ─────────────────────────────────────────────────────────────────

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined")      { resolve(false); return; }
    if (typeof window.Razorpay !== "undefined") { resolve(true);  return; }
    const s  = document.createElement("script");
    s.src    = "https://checkout.razorpay.com/v1/checkout.js";
    s.async  = true;
    s.onload  = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

// ─── Confetti ─────────────────────────────────────────────────────────────────

const CONFETTI_COLORS = ["#F5A623", "#1B5E37", "#FFD700", "#FF6B6B", "#4ECDC4", "#FFFFFF", "#A8E6CF"];

function ConfettiBurst() {
  const particles = useMemo(
    () =>
      Array.from({ length: 90 }, (_, i) => ({
        id:       i,
        x:        Math.random() * 100,
        color:    CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        size:     Math.random() * 10 + 5,
        delay:    Math.random() * 0.9,
        duration: Math.random() * 1.6 + 1.4,
        rotate:   Math.random() * 720 - 360,
        shape:    i % 3 === 0 ? "50%" : i % 3 === 1 ? "2px" : "0%",
      })),
    []
  );

  const vh = typeof window !== "undefined" ? window.innerHeight + 200 : 900;

  return (
    <div className="pointer-events-none fixed inset-0 z-[200] overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{
            left:            `${p.x}%`,
            top:             -20,
            width:           p.size,
            height:          p.size,
            backgroundColor: p.color,
            borderRadius:    p.shape,
          }}
          initial={{ y: 0, opacity: 1, rotate: 0 }}
          animate={{ y: vh, opacity: 0, rotate: p.rotate }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface DonationCampaign {
  id:    string;
  title: string;
}

interface Props {
  isOpen:                boolean;
  onClose:               () => void;
  initialAmount?:        number;
  preselectedCampaign?:  DonationCampaign;
  campaigns?:            DonationCampaign[];
  isRecurring?:          boolean;
}

// ─── Completed donation record (for receipt) ──────────────────────────────────

interface CompletedPayment {
  orderId:   string;
  paymentId: string;
  name:      string;
  email:     string;
  phone:     string;
  amountRs:  number;
  campaign:  string;
}

// ─── Component ────────────────────────────────────────────────────────────────

const overlayVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1 },
};

const cardVariants: Variants = {
  hidden:  { opacity: 0, scale: 0.92, y: 24 },
  visible: { opacity: 1, scale: 1,    y: 0,   transition: { type: "spring", stiffness: 300, damping: 26 } },
  exit:    { opacity: 0, scale: 0.92, y: 24,  transition: { duration: 0.2 } },
};

const QUICK_AMOUNTS = [200, 500, 1000, 2000, 5000];

export default function DonationModal({
  isOpen,
  onClose,
  initialAmount,
  preselectedCampaign,
  campaigns = [],
  isRecurring = false,
}: Props) {
  const [name,        setName]        = useState("");
  const [email,       setEmail]       = useState("");
  const [phone,       setPhone]       = useState("");
  const [pan,         setPan]         = useState("");
  const [amountInput, setAmountInput] = useState(initialAmount ? String(initialAmount) : "500");
  const [campaignId,  setCampaignId]  = useState(preselectedCampaign?.id   ?? "");
  const [campaignTitle,  setCampaignTitle]  = useState(preselectedCampaign?.title ?? "General Donation");
  const [isPublic,    setIsPublic]    = useState(true);
  const [step,        setStep]        = useState<"form" | "processing" | "success" | "error">("form");
  const [errorMsg,    setErrorMsg]    = useState("");
  const [completed,   setCompleted]   = useState<CompletedPayment | null>(null);
  const [confetti,    setConfetti]    = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Reset when reopened
  useEffect(() => {
    if (isOpen) {
      setStep("form");
      setErrorMsg("");
      setCompleted(null);
      setConfetti(false);
      if (initialAmount) setAmountInput(String(initialAmount));
      if (preselectedCampaign) {
        setCampaignId(preselectedCampaign.id);
        setCampaignTitle(preselectedCampaign.title);
      }
    }
  }, [isOpen, initialAmount, preselectedCampaign]);

  // Scroll lock
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // ESC key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const amountRs = Number(amountInput) || 0;

  const validate = useCallback((): string | null => {
    if (!name.trim())                        return "Full name is required";
    if (!email.trim() || !email.includes("@")) return "Valid email is required";
    if (!phone.trim() || phone.length < 10)  return "Valid 10-digit phone is required";
    if (amountRs < 1)                        return "Minimum donation is Rs. 1";
    return null;
  }, [name, email, phone, amountRs]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { toast.error(err); return; }

    setStep("processing");

    try {
      // 1. Create Razorpay order
      const orderRes = await fetch("/api/donations/create-order", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount:     amountRs * 100,     // convert Rs → paise
          donorName:  name.trim(),
          email:      email.trim(),
          phone:      phone.trim(),
          pan:        pan.trim() || undefined,
          campaign:   campaignTitle,
          campaignId: campaignId || undefined,
          isPublic,
          isRecurring,
        }),
      });

      if (!orderRes.ok) {
        const j = (await orderRes.json()) as { error?: string };
        throw new Error(j.error ?? "Order creation failed");
      }

      const { orderId, amount, currency, keyId } = (await orderRes.json()) as {
        orderId:  string;
        amount:   number;
        currency: string;
        keyId:    string;
      };

      // 2. Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Payment gateway failed to load. Check internet connection.");

      // 3. Open Razorpay checkout
      const rzpOptions: RazorpayOptions = {
        key:         keyId,
        amount,
        currency,
        name:        ORG.name,
        description: `${isRecurring ? "Monthly " : ""}Donation — ${campaignTitle}`,
        order_id:    orderId,
        prefill:     { name: name.trim(), email: email.trim(), contact: phone.trim() },
        notes:       { campaign: campaignTitle },
        theme:       { color: "#1B5E37" },
        handler: async (response: RazorpayPaymentResponse) => {
          try {
            const vRes = await fetch("/api/donations/verify", {
              method:  "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
              }),
            });

            if (!vRes.ok) throw new Error("Payment verification failed");

            setCompleted({
              orderId:   orderId,
              paymentId: response.razorpay_payment_id,
              name:      name.trim(),
              email:     email.trim(),
              phone:     phone.trim(),
              amountRs,
              campaign:  campaignTitle,
            });
            trackDonation(amountRs, campaignTitle);
            setStep("success");
            setConfetti(true);
            toast.success("🎉 Payment successful! Thank you for your donation.");
            setTimeout(() => setConfetti(false), 4000);
          } catch (verifyErr) {
            console.error(verifyErr);
            setErrorMsg("Payment received but verification failed. Please contact us with your payment ID.");
            setStep("error");
          }
        },
        modal: {
          ondismiss: () => {
            if (step === "processing") setStep("form");
          },
          escape: true,
        },
      };

      const rzpInstance = new window.Razorpay(rzpOptions);
      rzpInstance.open();

    } catch (err) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStep("error");
    }
  }, [validate, amountRs, name, email, phone, pan, campaignTitle, campaignId, isPublic, isRecurring, step]);

  const handleDownloadReceipt = useCallback(async () => {
    if (!completed) return;
    setDownloading(true);
    try {
      const donation: Donation = {
        id:                completed.orderId,
        userId:            "guest",
        name:              completed.name,
        email:             completed.email,
        phone:             completed.phone,
        amount:            completed.amountRs,
        currency:          "INR",
        purpose:           completed.campaign,
        isRecurring,
        status:            "captured",
        razorpayOrderId:   completed.orderId,
        razorpayPaymentId: completed.paymentId,
        createdAt:         new Date(),
        isAnonymous:       !isPublic,
      };
      const blob = await generateDonationReceipt(donation);
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `SGF-Receipt-${completed.orderId.slice(-8).toUpperCase()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Receipt downloaded!");
    } catch {
      toast.error("Could not generate receipt. Please contact us.");
    } finally {
      setDownloading(false);
    }
  }, [completed, isPublic, isRecurring]);

  const allCampaigns: DonationCampaign[] = [
    { id: "", title: "General Donation" },
    ...campaigns,
  ];

  return (
    <>
      {confetti && <ConfettiBurst />}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={onClose}
            />

            {/* Card */}
            <motion.div
              className="relative z-10 w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl bg-white shadow-2xl"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              {/* ─── Header ──────────────────── */}
              <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-3xl bg-gradient-to-r from-[#1B5E37] to-[#0F3D22] px-6 py-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#F5A623]">
                    {isRecurring ? "Monthly Donation" : "One-Time Donation"}
                  </p>
                  <h2 className="font-heading text-lg font-bold text-white">
                    {ORG.name}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 transition-colors"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>

              {/* ─── Body ───────────────────── */}
              <div className="p-6">

                {/* FORM STATE */}
                {step === "form" && (
                  <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    {/* Quick amount selector */}
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-[#1A1A1A]/50">
                        Donation Amount (Rs.)
                      </label>
                      <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
                        {QUICK_AMOUNTS.map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setAmountInput(String(amt))}
                            className={`rounded-xl py-2 text-sm font-bold transition-all ${
                              amountInput === String(amt)
                                ? "bg-[#1B5E37] text-white shadow-md"
                                : "bg-[#F9FBF9] text-[#1A1A1A]/70 hover:bg-[#1B5E37]/10 hover:text-[#1B5E37]"
                            }`}
                          >
                            {amt >= 1000 ? `${amt / 1000}K` : amt}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => { if (QUICK_AMOUNTS.includes(Number(amountInput))) setAmountInput(""); }}
                          className={`rounded-xl py-2 text-sm font-bold transition-all sm:col-span-1 col-span-3 ${
                            !QUICK_AMOUNTS.includes(Number(amountInput))
                              ? "bg-[#F5A623] text-[#0F3D22]"
                              : "bg-[#F9FBF9] text-[#1A1A1A]/60 hover:bg-[#F5A623]/20 hover:text-[#0F3D22]"
                          }`}
                        >
                          Custom
                        </button>
                      </div>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-[#1A1A1A]/50">
                          ₹
                        </span>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={amountInput}
                          onChange={(e) => setAmountInput(e.target.value)}
                          placeholder="Enter amount"
                          required
                          className="w-full rounded-xl border border-gray-200 bg-[#F9FBF9] py-3 pl-9 pr-4 text-sm font-semibold focus:border-[#1B5E37] focus:outline-none focus:ring-2 focus:ring-[#1B5E37]/20"
                        />
                      </div>
                    </div>

                    {/* Campaign */}
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-[#1A1A1A]/50">
                        Donate Towards
                      </label>
                      <select
                        value={campaignId}
                        onChange={(e) => {
                          setCampaignId(e.target.value);
                          const found = allCampaigns.find((c) => c.id === e.target.value);
                          setCampaignTitle(found?.title ?? "General Donation");
                        }}
                        className="w-full rounded-xl border border-gray-200 bg-[#F9FBF9] px-4 py-3 text-sm focus:border-[#1B5E37] focus:outline-none focus:ring-2 focus:ring-[#1B5E37]/20"
                      >
                        {allCampaigns.map((c) => (
                          <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                      </select>
                    </div>

                    {/* Personal info */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-[#1A1A1A]/50">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Ramesh Kumar"
                          required
                          className="w-full rounded-xl border border-gray-200 bg-[#F9FBF9] px-4 py-3 text-sm focus:border-[#1B5E37] focus:outline-none focus:ring-2 focus:ring-[#1B5E37]/20"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-[#1A1A1A]/50">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@email.com"
                          required
                          className="w-full rounded-xl border border-gray-200 bg-[#F9FBF9] px-4 py-3 text-sm focus:border-[#1B5E37] focus:outline-none focus:ring-2 focus:ring-[#1B5E37]/20"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-[#1A1A1A]/50">
                          Phone (+91) *
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                          placeholder="98765 43210"
                          required
                          className="w-full rounded-xl border border-gray-200 bg-[#F9FBF9] px-4 py-3 text-sm focus:border-[#1B5E37] focus:outline-none focus:ring-2 focus:ring-[#1B5E37]/20"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-[#1A1A1A]/50">
                          PAN (for 80G receipt)
                        </label>
                        <input
                          type="text"
                          value={pan}
                          onChange={(e) => setPan(e.target.value.toUpperCase().slice(0, 10))}
                          placeholder="ABCDE1234F"
                          maxLength={10}
                          className="w-full rounded-xl border border-gray-200 bg-[#F9FBF9] px-4 py-3 text-sm font-mono uppercase focus:border-[#1B5E37] focus:outline-none focus:ring-2 focus:ring-[#1B5E37]/20"
                        />
                      </div>
                    </div>

                    {/* Donor Wall */}
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                        className="mt-0.5 h-4 w-4 accent-[#1B5E37]"
                      />
                      <div>
                        <p className="text-sm font-medium text-[#1A1A1A]">
                          Show my name on the Donor Wall
                        </p>
                        <p className="text-xs text-[#1A1A1A]/50">
                          Your name and amount will appear publicly on our donor board
                        </p>
                      </div>
                    </label>

                    {/* Submit */}
                    <button
                      type="submit"
                      className="w-full rounded-2xl bg-gradient-to-r from-[#1B5E37] to-[#0F3D22] py-4 text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
                    >
                      {isRecurring
                        ? `Set Up Rs. ${amountRs.toLocaleString("en-IN")}/month`
                        : `Donate Rs. ${amountRs.toLocaleString("en-IN")} Now`}
                    </button>

                    <p className="text-center text-xs text-[#1A1A1A]/40">
                      🔒 Secured by Razorpay · 80G tax receipt via email
                    </p>
                  </form>
                )}

                {/* PROCESSING STATE */}
                {step === "processing" && (
                  <div className="flex flex-col items-center gap-5 py-12 text-center">
                    <Loader2 size={40} className="animate-spin text-[#1B5E37]" />
                    <p className="font-heading text-lg font-bold text-[#0F3D22]">
                      Opening payment window…
                    </p>
                    <p className="text-sm text-[#1A1A1A]/50">
                      Complete the payment in the Razorpay window. Do not close this tab.
                    </p>
                  </div>
                )}

                {/* SUCCESS STATE */}
                {step === "success" && completed && (
                  <div className="flex flex-col items-center gap-5 py-6 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    >
                      <CheckCircle2 size={64} className="text-[#1B5E37]" />
                    </motion.div>

                    <div>
                      <h3 className="font-heading text-xl font-bold text-[#0F3D22]">
                        Thank you, {completed.name.split(" ")[0]}!
                      </h3>
                      <p className="mt-1 text-sm text-[#1A1A1A]/60">
                        Your donation of{" "}
                        <span className="font-bold text-[#1B5E37]">
                          Rs. {completed.amountRs.toLocaleString("en-IN")}
                        </span>{" "}
                        has been received successfully.
                      </p>
                    </div>

                    <div className="w-full rounded-2xl bg-[#F9FBF9] p-4 text-left text-sm">
                      <div className="grid gap-1.5">
                        {[
                          ["Campaign",   completed.campaign],
                          ["Payment ID", completed.paymentId.slice(-12).toUpperCase()],
                        ].map(([label, value]) => (
                          <div key={label} className="flex justify-between">
                            <span className="text-[#1A1A1A]/50">{label}</span>
                            <span className="font-semibold text-[#0F3D22]">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleDownloadReceipt}
                      disabled={downloading}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#F5A623] py-3.5 text-sm font-bold text-[#0F3D22] transition-opacity hover:opacity-90 disabled:opacity-60"
                    >
                      {downloading
                        ? <><Loader2 size={15} className="animate-spin" /> Generating…</>
                        : <><Download size={15} /> Download 80G Receipt</>}
                    </button>

                    <button
                      onClick={onClose}
                      className="text-sm text-[#1A1A1A]/50 underline-offset-2 hover:text-[#1B5E37] hover:underline"
                    >
                      Close
                    </button>
                  </div>
                )}

                {/* ERROR STATE */}
                {step === "error" && (
                  <div className="flex flex-col items-center gap-5 py-8 text-center">
                    <AlertTriangle size={56} className="text-red-500" />
                    <div>
                      <h3 className="font-heading text-lg font-bold text-[#0F3D22]">
                        Payment Issue
                      </h3>
                      <p className="mt-2 text-sm text-[#1A1A1A]/60">{errorMsg}</p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setStep("form")}
                        className="rounded-2xl bg-[#1B5E37] px-6 py-3 text-sm font-bold text-white"
                      >
                        Try Again
                      </button>
                      <a
                        href={`https://wa.me/${ORG.phone.replace(/\D/g, "")}?text=${encodeURIComponent("Hi, I had a payment issue on the donations page. Can you help?")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-2xl bg-[#25D366] px-6 py-3 text-sm font-bold text-white"
                      >
                        WhatsApp Support
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
