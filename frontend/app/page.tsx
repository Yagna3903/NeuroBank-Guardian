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
      await axios.post("http://localhost:8000/api/v1/auth/otp", { email });
      setCurrentStep("otp");
    } catch (err) {
      setError("Failed to send OTP. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("http://localhost:8000/api/v1/auth/login", { email, code: otp });
      setUserId(res.data.user_id);
      setUserName(res.data.name);
      setCurrentStep("biometric");

      // Simulate Biometric Delay
      setTimeout(() => {
        setCurrentStep("dashboard");
      }, 2500);

    } catch (err) {
      setError("Invalid Code. Check the backend terminal!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-purple-900 to-slate-900 text-white font-sans">

      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>

      {currentStep !== "dashboard" ? (
        <div className="relative z-10 w-full max-w-md p-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20 mb-4">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">NeuroBank Guardian</h1>
            <p className="text-gray-400 text-sm mt-1">Next-Gen Secure Access</p>
          </div>

          {/* ERROR MSG */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-xs text-center">
              {error}
            </div>
          )}

          {/* STEP 1: EMAIL */}
          {currentStep === "email" && (
            <form onSubmit={handleRequestOTP} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider font-bold text-gray-500 ml-1">Identity Claim</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium placeholder:text-gray-600"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Request Access Code <ArrowRight className="w-4 h-4" /></>}
              </button>
              <div className="text-center">
                <p className="text-[10px] text-gray-500">Try: <b>om@neurobank.ai</b> or <b>yagna@neurobank.ai</b></p>
              </div>
            </form>
          )}

          {/* STEP 2: OTP */}
          {currentStep === "otp" && (
            <form onSubmit={handleVerifyOTP} className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider font-bold text-gray-500 ml-1">Security Code</label>
                <div className="relative group">
                  <KeyRound className="absolute left-4 top-3.5 w-5 h-5 text-gray-500 group-focus-within:text-green-400 transition-colors" />
                  <input
                    type="text"
                    placeholder="Unknown Code"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white tracking-[0.5em] text-center font-mono text-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all placeholder:tracking-normal placeholder:text-gray-600 placeholder:font-sans placeholder:text-sm"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Verify Identity <ShieldCheck className="w-4 h-4" /></>}
              </button>
              <button type="button" onClick={() => setCurrentStep("email")} className="w-full text-xs text-gray-500 hover:text-white transition-colors">
                Try different email
              </button>
            </form>
          )}

          {/* STEP 3: BIOMETRIC ANIMATION */}
          {currentStep === "biometric" && (
            <div className="flex flex-col items-center justify-center py-8 animate-in zoom-in duration-500">
              <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full animate-ping"></div>
                <div className="absolute inset-0 border-4 border-t-blue-500 border-r-transparent border-b-purple-500 border-l-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Fingerprint className="w-10 h-10 text-blue-400 animate-pulse" />
                </div>
              </div>
              <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Verifying Biometrics...</h3>
              <p className="text-gray-500 text-sm mt-2">Creating secure neural link...</p>
            </div>
          )}
        </div>
      ) : (
        // DASHBOARD VIEW
        <div className="relative z-10 w-full max-w-7xl animate-in fade-in duration-1000">
          <header className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Welcome back, {userName}</h1>
                <p className="text-xs text-green-400 font-mono flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  SECURE SESSION ACTIVE
                </p>
              </div>
            </div>
            <button onClick={() => window.location.reload()} className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg text-sm transition-colors">
              Sign Out
            </button>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Avatar Interaction */}
            <div className="lg:col-span-2 space-y-6">
              <Avatar userId={userId || "user_001"} />
            </div>

            {/* Right Column: Banking Details */}
            <div className="space-y-6">
              <Dashboard userId={userId || "user_001"} />
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
