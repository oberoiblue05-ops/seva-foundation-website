"use client";

import { useState } from "react";
import { X, CheckCircle, Heart, Lock } from "lucide-react";
import { collection, addDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { generateSponsorCert } from "@/lib/generate-receipt";
import { trackDonationConversion } from "@/lib/track-conversion";
import { ORG } from "@/constants";

// ─── Razorpay types ───────────────────────────────────────────────────────────

interface RazorpayPaymentResponse {
  razorpay_order_id:   string;
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

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined")              { resolve(false); return; }
    if (typeof window.Razorpay !== "undefined")    { resolve(true);  return; }
    const s  = document.createElement("script");
    s.src    = "https://checkout.razorpay.com/v1/checkout.js";
    s.async  = true;
    s.onload  = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChildForSponsor {
  id:        string;
  name:      string;
  age:       number;
  category:  string;
  imageSeed?: number;
  photo?:    string;
}

interface FormState {
  sponsorName: string;
  email:       string;
  phone:       string;
  pan:         string;
  agreed:      boolean;
}

const INPUT =
  "w-full rounded-xl border border-gray-200 bg-[#F9FBF9] px-4 py-3 text-sm text-[#1A1A1A] placeholder:text-[#1A1A1A]/35 focus:border-[#1B5E37] focus:outline-none focus:ring-2 focus:ring-[#1B5E37]/20 transition-colors";

// ─── Component ────────────────────────────────────────────────────────────────

export default function SponsorModal({
  child,
  onClose,
}: {
  child:   ChildForSponsor;
  onClose: () => void;
}) {
  const firstName = child.name.split(" ")[0];
  const photoSrc  = child.photo ?? `https://picsum.photos/seed/${child.imageSeed ?? 100}/120/120`;

  const [form,       setForm]       = useState<FormState>({ sponsorName: "", email: "", phone: "", pan: "", agreed: false });
  const [errors,     setErrors]     = useState<Partial<Record<keyof FormState, string>>>({});
  const [step,       setStep]       = useState<"form" | "processing" | "success">("form");
  const [errorMsg,   setErrorMsg]   = useState("");
  const [savedId,    setSavedId]    = useState("");
  const [certBusy,   setCertBusy]   = useState(false);

  const set = (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({
        ...p,
        [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
      }));

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.sponsorName.trim())                                     e.sponsorName = "Your name is required";
    if (!form.email.trim())                                           e.email       = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))         e.email       = "Enter a valid email";
    if (!form.phone.trim())                                           e.phone       = "Phone is required";
    else if (!/^\d{10}$/.test(form.phone.replace(/\s/g, "")))        e.phone       = "Enter a valid 10-digit number";
    if (!form.agreed)                                                 e.agreed      = "You must agree to the monthly payment";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStep("processing");
    setErrorMsg("");

    try {
      // 1. Create Razorpay order
      const orderRes = await fetch("/api/donations/create-order", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount:    50000, // Rs.500 in paise
          donorName: form.sponsorName.trim(),
          email:     form.email.trim(),
          phone:     form.phone.trim(),
          pan:       form.pan.trim() || undefined,
          campaign:  `Child Sponsorship — ${firstName}`,
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

      // 2. Load Razorpay
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Payment gateway failed to load. Check your internet connection.");

      // 3. Open checkout
      const rzpOptions: RazorpayOptions = {
        key:         keyId,
        amount,
        currency,
        name:        ORG.name,
        description: `Sponsor ${firstName} — Rs.500/month`,
        order_id:    orderId,
        prefill:     { name: form.sponsorName.trim(), email: form.email.trim(), contact: form.phone.trim() },
        notes:       { childId: child.id, childName: child.name },
        theme:       { color: "#1B5E37" },
        handler: async (response: RazorpayPaymentResponse) => {
          try {
            // Verify payment
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

            // Save sponsorship to Firestore
            const docRef = await addDoc(collection(db, "sponsorships"), {
              sponsorName:        form.sponsorName.trim(),
              email:              form.email.trim(),
              phone:              form.phone.trim(),
              pan:                form.pan.trim() || null,
              childId:            child.id,
              childName:          child.name,
              amount:             500,
              startDate:          new Date().toISOString(),
              status:             "active",
              isActive:           true,
              paymentHistory:     [],
              razorpayOrderId:    response.razorpay_order_id,
              razorpayPaymentId:  response.razorpay_payment_id,
              createdAt:          serverTimestamp(),
            });

            // Mark child as sponsored
            try {
              await updateDoc(doc(db, "children", child.id), { isSponsored: true });
            } catch { /* child doc may not exist in Firestore — non-fatal */ }

            trackDonationConversion(500, response.razorpay_payment_id);
            setSavedId(docRef.id);
            setStep("success");
          } catch (verifyErr) {
            console.error(verifyErr);
            setErrorMsg("Payment received but verification failed. Please contact us with your payment ID.");
            setStep("form");
          }
        },
        modal: {
          ondismiss: () => setStep("form"),
          escape: true,
        },
      };

      new window.Razorpay(rzpOptions).open();

    } catch (err) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStep("form");
    }
  };

  const handleDownloadCert = async () => {
    setCertBusy(true);
    try {
      await generateSponsorCert({
        id:          savedId,
        sponsorName: form.sponsorName || "Sponsor",
        childName:   child.name,
        amount:      500,
        startDate:   new Date().toISOString(),
      });
    } catch { /* silent */ }
    finally { setCertBusy(false); }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl my-4 overflow-hidden">

        {/* ── Header ── */}
        <div
          className="relative flex items-center gap-4 px-6 py-5"
          style={{ background: "linear-gradient(135deg, #071a0e 0%, #1B5E37 100%)" }}
        >
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/30 shrink-0">
            <Image
              src={photoSrc}
              alt={firstName}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <p className="text-white/60 text-xs mb-0.5">Sponsoring</p>
            <h3 className="font-bold text-white text-lg font-heading leading-tight">
              {firstName}
            </h3>
            <p className="text-white/70 text-sm capitalize">{child.age} yrs · {child.category.replace(/-/g, " ")}</p>
          </div>
          <div className="text-right">
            <p className="text-[#F5A623] font-bold text-xl font-heading">Rs.500</p>
            <p className="text-white/50 text-xs">per month</p>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="p-6">
          {step === "success" ? (
            <div className="text-center py-4">
              <div className="w-20 h-20 rounded-full bg-[#1B5E37] flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={36} className="text-white" />
              </div>
              <h4 className="text-xl font-bold text-[#0F3D22] font-heading mb-2">
                Sponsorship Active!
              </h4>
              <p className="text-gray-600 text-sm mb-6 max-w-xs mx-auto">
                Thank you! You are now sponsoring {firstName}. You will receive monthly updates on their progress.
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleDownloadCert}
                  disabled={certBusy}
                  className="w-full flex items-center justify-center gap-2 bg-[#1B5E37] text-white font-bold py-3 rounded-full hover:bg-[#0d3320] transition-all disabled:opacity-60"
                >
                  {certBusy
                    ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : "📜"}
                  Download Sponsorship Certificate
                </button>
                <button
                  onClick={onClose}
                  className="w-full border border-gray-200 text-gray-600 font-medium py-3 rounded-full hover:bg-gray-50 transition-all text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name *</label>
                <input type="text" placeholder="Your full name" value={form.sponsorName} onChange={set("sponsorName")} className={INPUT} />
                {errors.sponsorName && <p className="mt-1 text-xs text-red-500">{errors.sponsorName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email *</label>
                <input type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} className={INPUT} />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone *</label>
                <div className="flex">
                  <span className="flex items-center px-3 rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 text-sm text-gray-500 font-medium">+91</span>
                  <input type="tel" placeholder="10-digit number" value={form.phone} onChange={set("phone")} maxLength={10} className={`${INPUT} rounded-l-none`} />
                </div>
                {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  PAN Number <span className="font-normal text-gray-400">(optional — for 80G certificate)</span>
                </label>
                <input type="text" placeholder="ABCDE1234F" value={form.pan} onChange={set("pan")} maxLength={10} className={`${INPUT} uppercase`} />
              </div>

              {/* Fixed amount display */}
              <div className="bg-[#F9FBF9] rounded-xl border border-[#1B5E37]/20 px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-gray-600">Monthly Sponsorship Amount</span>
                <span className="font-bold text-[#1B5E37] text-lg">Rs.500</span>
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.agreed}
                  onChange={set("agreed")}
                  className="mt-0.5 w-4 h-4 accent-[#1B5E37] shrink-0"
                />
                <span className="text-sm text-gray-700">
                  I agree to the monthly Rs.500 sponsorship payment *
                </span>
              </label>
              {errors.agreed && <p className="text-xs text-red-500">{errors.agreed}</p>}

              <p className="text-xs text-gray-400">
                You can cancel your sponsorship at any time by contacting us at {ORG.email}
              </p>

              <button
                type="submit"
                disabled={step === "processing"}
                className="w-full flex items-center justify-center gap-2 bg-[#1B5E37] text-white font-bold py-4 rounded-full hover:bg-[#0d3320] transition-all hover:scale-[1.01] hover:shadow-lg disabled:opacity-60"
              >
                {step === "processing" ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing…
                  </>
                ) : (
                  <>
                    <Heart size={16} />
                    Sponsor {firstName} — Rs.500/month
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
                <Lock size={11} />
                Secured by Razorpay · 256-bit SSL
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
