"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ShieldCheck, Loader2 } from 'lucide-react';

interface GuardianActiveProps {
    userId: string;
}

export default function GuardianActive({ userId }: GuardianActiveProps) {
    const [recentUpdates, setRecentUpdates] = useState<any[]>([]);
    const [accountCount, setAccountCount] = useState(0);

    // Initial Fetch for Account Count
    useEffect(() => {
        const fetchCount = async () => {
            try {
                const userRes = await axios.get(`https://backend-1093567910779.us-central1.run.app/api/v1/users/${userId}`);
                setAccountCount(userRes.data.accounts.length);
            } catch (e) { console.error(e) }
        }
        if (userId) fetchCount();
    }, [userId]);


    // WebSocket for Feed
    useEffect(() => {
        if (!userId) return;
        const ws = new WebSocket(`wss://backend-1093567910779.us-central1.run.app/api/v1/realtime/ws/dashboard/${userId}`);
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "balance_update" && data.latest_transaction) {
                setRecentUpdates(prev => [data.latest_transaction, ...prev].slice(0, 5));
            }
        };
        return () => ws.close();
    }, [userId]);

    const simulateTransaction = () => {
        const ws = new WebSocket(`wss://backend-1093567910779.us-central1.run.app/api/v1/realtime/ws/dashboard/${userId}`);
        ws.onopen = () => {
            ws.send(JSON.stringify({ type: "simulate_transaction" }));
            ws.close();
        };
    };

    return (
        <div className="bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-indigo-900/40 p-6 rounded-3xl border border-white/10 text-white shadow-2xl relative overflow-hidden group w-full">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>

            <div className="flex flex-col md:flex-row justify-between items-start gap-8 relative z-10">
                {/* Header Section */}
                <div className="flex-1">
                    <h3 className="text-xl font-bold flex items-center gap-4 mb-2">
                        <ShieldCheck className="w-6 h-6 text-cyan-300" />
                        Guardian Active
                    </h3>
                    <p className="text-blue-200/70 text-sm max-w-xl leading-relaxed">
                        Sentinel system monitoring <b>{accountCount} linked accounts</b>.
                        Neural threat detection and real-time transaction screening are enabled.
                    </p>

                    {/* Static Protocols List - Horizontal Grid Now */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="flex items-center justify-between text-xs text-white/60 bg-white/5 p-3 rounded-lg border border-white/5">
                            <span>Biometric Lock</span>
                            <span className="text-emerald-400 font-mono font-bold">ENGAGED</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-white/60 bg-white/5 p-3 rounded-lg border border-white/5">
                            <span>Geo-Fencing</span>
                            <span className="text-emerald-400 font-mono font-bold">ACTIVE</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-white/60 bg-white/5 p-3 rounded-lg border border-white/5">
                            <span>Neural Link</span>
                            <span className="text-blue-400 font-mono font-bold">STABLE</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Feed & Metrics */}
                <div className="w-full md:w-1/3 space-y-6">
                    {/* Real-time Ticker */}
                    <div className="bg-black/50 rounded-xl p-5 border border-white/5 min-h-[140px] shadow-inner relative group/feed">
                        <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                            <h4 className="text-xs text-indigo-300 uppercase tracking-widest">Latest Activity</h4>
                            <button onClick={simulateTransaction} className="opacity-0 group-hover/feed:opacity-100 text-[10px] text-white/40 hover:text-white transition-opacity">
                                [TEST]
                            </button>
                        </div>

                        {recentUpdates.length === 0 ? (
                            <div className="flex items-center gap-3 text-white/30 text-sm italic h-20">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Waiting for incoming transactions...
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentUpdates.map((tx, i) => (
                                    <div key={i} className="flex justify-between items-center text-sm animate-in fade-in slide-in-from-right-5 duration-500">
                                        <span className="text-white/90 font-medium">{tx.merchant}</span>
                                        <span className="text-red-400 font-mono">-${tx.amount.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Metrics Row */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="text-center">
                            <div className="text-[10px] text-blue-300/50 uppercase tracking-widest mb-1">Latency</div>
                            <div className="text-sm font-bold text-blue-100 font-mono">12ms</div>
                        </div>
                        <div className="text-center border-l border-white/10">
                            <div className="text-[10px] text-purple-300/50 uppercase tracking-widest mb-1">Encr.</div>
                            <div className="text-sm font-bold text-purple-100 font-mono">AES-256</div>
                        </div>
                        <div className="text-center border-l border-white/10">
                            <div className="text-[10px] text-emerald-300/50 uppercase tracking-widest mb-1">Uptime</div>
                            <div className="text-sm font-bold text-emerald-100 font-mono">99.9%</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
