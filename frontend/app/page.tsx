"use client";

import { useState } from "react";
import axios from "axios";
import Avatar from "@/components/Avatar";
import Dashboard from "@/components/Dashboard";

import { User, ShieldCheck, Mail, KeyRound, Fingerprint, Loader2, ArrowRight } from "lucide-react";

export default function Home() {
  const [currentStep, setCurrentStep] = useState<"email" | "otp" | "biometric" | "dashboard">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const apiUrl = "https://backend-1093567910779.us-central1.run.app";
      await axios.post(`${apiUrl}/api/v1/auth/otp`, { email });
      setCurrentStep("otp");
    } catch (err: any) {
      if (err.response && err.response.status === 404) {
        setError("⚠️ Identity claim rejected. Email address not found in neural database.");
      } else {
        setError("Failed to send OTP. Connection to backend failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const apiUrl = "https://backend-1093567910779.us-central1.run.app";
      const res = await axios.post(`${apiUrl}/api/v1/auth/login`, { email, code: otp });
      setUserId(res.data.user_id);
      setUserName(res.data.name);
      setCurrentStep("biometric");

      // Simulate Biometric Delay
      setTimeout(() => {
        setCurrentStep("dashboard");
      }, 2500);

    } catch (err) {
      setError("Invalid Security Code. access denied.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 pb-20 bg-black text-white font-chakra overflow-hidden">

      {/* Background Ambience Removed */}

      {currentStep !== "dashboard" ? (
        <div className="relative z-10 w-full max-w-lg p-10 bg-linear-to-br from-white/10 to-white/5 backdrop-blur-2xl border-t border-l border-white/20 rounded-4xl shadow-2xl shadow-black/50">

          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-20 h-20 mx-auto bg-linear-to-tr from-cyan-400 to-blue-600 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-6">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">NeuroBank Guardian</h1>
            <p className="text-blue-200 text-base font-medium">Next-Gen Secure Neural Access</p>
          </div>

          {/* ERROR MSG */}
          {error && (
            <div className={`mb-6 p-4 border rounded-xl text-sm text-center font-bold tracking-wide shadow-lg flex items-center justify-center gap-2 ${error.includes("not found")
              ? "bg-amber-500/20 border-amber-500/50 text-amber-200 shadow-amber-900/20"
              : "bg-red-500/20 border-red-500/50 text-red-200 shadow-red-900/20"
              }`}>
              {error}
            </div>
          )}

          {/* STEP 1: EMAIL */}
          {currentStep === "email" && (
            <form onSubmit={handleRequestOTP} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-3">
                <label className="text-sm uppercase tracking-wider font-bold text-blue-300 ml-1">Identity Claim</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-5 w-6 h-6 text-blue-300 group-focus-within:text-cyan-300 transition-colors" />
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full h-16 bg-black/20 border border-white/10 rounded-2xl pl-14 pr-6 text-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all font-medium placeholder:text-white/30"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full h-16 bg-linear-to-r from-cyan-500 to-blue-600 text-white text-lg font-bold rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-lg shadow-cyan-500/20"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Request Access Code <ArrowRight className="w-5 h-5" /></>}
              </button>
              <div className="text-center pt-2">
                <p className="text-sm text-blue-200/60">Try: <b className="text-blue-200">om@neurobank.ai</b> or <b className="text-blue-200">yagna@neurobank.ai</b></p>
              </div>
            </form>
          )}

          {/* STEP 2: OTP */}
          {currentStep === "otp" && (
            <form onSubmit={handleVerifyOTP} className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="space-y-3">
                <label className="text-sm uppercase tracking-wider font-bold text-emerald-300 ml-1">Security Code</label>
                <div className="relative group">
                  <KeyRound className="absolute left-5 top-5 w-6 h-6 text-emerald-300 group-focus-within:text-emerald-200 transition-colors" />
                  <input
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    className="w-full h-16 bg-black/20 border border-white/10 rounded-2xl pl-14 pr-6 text-white tracking-[0.5em] text-center font-mono text-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition-all placeholder:tracking-normal placeholder:text-white/20 placeholder:font-sans placeholder:text-base"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full h-16 bg-linear-to-r from-emerald-500 to-teal-600 text-white text-lg font-bold rounded-full hover:shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Verify Identity <ShieldCheck className="w-5 h-5" /></>}
              </button>
              <button type="button" onClick={() => setCurrentStep("email")} className="w-full text-sm text-blue-300 hover:text-white transition-colors underline decoration-blue-300/30 underline-offset-4">
                Try different email
              </button>
            </form>
          )}

          {/* STEP 3: BIOMETRIC ANIMATION */}
          {currentStep === "biometric" && (
            <div className="flex flex-col items-center justify-center py-10 animate-in zoom-in duration-500">
              <div className="relative w-32 h-32 mb-10">
                <div className="absolute inset-0 border-[6px] border-cyan-500/30 rounded-full animate-ping"></div>
                <div className="absolute inset-0 border-[6px] border-t-cyan-400 border-r-transparent border-b-blue-500 border-l-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Fingerprint className="w-14 h-14 text-cyan-300 animate-pulse" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white mb-2 text-center">Verifying Biometrics...</h3>
              <p className="text-blue-200 text-lg text-center animate-pulse">Establishing secure neural link</p>
            </div>
          )}
        </div>
      ) : (
        // DASHBOARD VIEW
        <div className="relative z-10 w-full max-w-7xl animate-in fade-in duration-1000 font-chakra">
          <header className="flex justify-between items-center mb-10 border-b border-white/10 pb-8 bg-white/5 backdrop-blur-md p-6 rounded-2xl shadow-lg shadow-black/20">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-linear-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center border border-white/20 shadow-lg shadow-cyan-500/30">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1 tracking-wide">Welcome back, {userName}</h1>
                <p className="text-sm text-emerald-300 font-mono flex items-center gap-2 font-bold tracking-wider">
                  <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></span>
                  SECURE SESSION ACTIVE
                </p>
              </div>
            </div>
            <button onClick={() => window.location.reload()} className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 px-6 py-3 rounded-xl text-red-200 text-sm font-bold transition-all shadow-lg hover:shadow-red-500/20 hover:scale-105 active:scale-95 font-chakra tracking-widest">
              Sign Out
            </button>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-8">
            {/* Left Column: Avatar Interaction */}
            <div className="lg:col-span-2 space-y-8 h-full">
              <div className="h-[750px] w-full sticky top-8">
                <Avatar userId={userId || "user_001"} />
              </div>
            </div>

            {/* Right Column: Banking Details (Top) */}
            <div className="space-y-8 flex flex-col h-full">
              <Dashboard userId={userId || "user_001"} viewMode="summary" />
            </div>
          </div>

          {/* Bottom Row: Recent Activity Full Width */}
          <div className="w-full mt-8 mb-8">
            <Dashboard userId={userId || "user_001"} viewMode="activity" />
          </div>


          {/* Footer: System Architecture */}
          <footer className="mt-8 border-t border-white/10 pt-8 pb-4">
            <div className="rounded-3xl border border-white/5 bg-black/60 backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between p-8 group transition-all hover:border-cyan-500/30 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]">
              {/* Cyberpunk Grid Background */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-size-[20px_20px] mask-[radial-gradient(ellipse_at_center,black,transparent_70%)]"></div>

              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 w-full">
                <div className="shrink-0">
                  <div className="inline-flex items-center gap-2 bg-cyan-950/30 px-4 py-1.5 text-[10px] text-cyan-400 uppercase tracking-[0.3em] font-bold font-mono border border-cyan-500/30 rounded-full shadow-[0_0_15px_rgba(8,145,178,0.2)]">
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-blink"></span>
                    System Architecture
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <p className="text-white/80 text-sm leading-relaxed font-chakra tracking-wide max-w-3xl">
                    "We deploy <span className="text-white font-bold drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">Local LLMs & SLMs</span> directly into the banking core, syncing with <span className="text-pink-400 font-bold drop-shadow-[0_0_8px_rgba(244,114,182,0.4)]">real-time avatars</span> via a secure <span className="text-purple-400 font-bold drop-shadow-[0_0_8px_rgba(192,132,252,0.4)]">Vector Database</span>.
                  </p>
                </div>

                <div className="shrink-0 border-l border-white/10 pl-8 hidden md:block">
                  <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold text-shadow-glow animate-pulse">
                    Data remains 100% Local & Private
                  </p>
                </div>
              </div>
            </div>
          </footer>

        </div>
      )}

    </main>
  );
}
