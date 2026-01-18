"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CreditCard, DollarSign, Activity, TrendingUp, Loader2, ShieldCheck } from 'lucide-react';

interface DashboardProps {
    userId: string;
}

export default function Dashboard({ userId }: DashboardProps) {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [recentUpdates, setRecentUpdates] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Initial User Profile
                const userRes = await axios.get(`http://localhost:8000/api/v1/users/${userId}`);
                setStats(userRes.data);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        if (userId) fetchData();
    }, [userId]);

    // WebSocket Connection for Real-Time Data
    useEffect(() => {
        if (!userId) return;

        console.log("🔌 Connecting to Real-Time Feed...");
        const ws = new WebSocket(`ws://localhost:8000/api/v1/realtime/ws/dashboard/${userId}`);

        ws.onopen = () => console.log("✅ Real-Time Feed Connected");

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("⚡ Real-Time Update:", data);

            if (data.type === "balance_update") {
                setStats((prev: any) => ({
                    ...prev,
                    total_balance: data.new_balance
                }));

                if (data.latest_transaction) {
                    setRecentUpdates(prev => [data.latest_transaction, ...prev].slice(0, 5));
                }
            }
        };

        return () => {
            console.log("🔌 Disconnecting Feed...");
            ws.close();
        };
    }, [userId]);

    // Demo Function to simulate a transaction (can be triggered by a button later if needed)
    const simulateTransaction = () => {
        // This is just client-side trigger to test the socket, 
        // in real app this happens via POS system -> Backend
        const ws = new WebSocket(`ws://localhost:8000/api/v1/realtime/ws/dashboard/${userId}`);
        ws.onopen = () => {
            ws.send(JSON.stringify({ type: "simulate_transaction" }));
            ws.close();
        };
    };

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-cyan-500 w-10 h-10" /></div>;
    if (!stats) return <div className="text-gray-500 text-center font-chakra">Failed to load data.</div>;

    return (
        <div className="space-y-8 font-chakra">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-6">
                <div className="bg-cyan-950/20 p-7 rounded-3xl border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.05)] backdrop-blur-md transition-all hover:bg-cyan-900/30 hover:border-cyan-400/30 group">
                    <div className="flex items-center gap-3 text-cyan-200 mb-4 font-semibold uppercase tracking-widest text-xs">
                        <DollarSign className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform" />
                        <span>Total Balance</span>
                    </div>
                    <div className="text-3xl font-bold text-white tracking-tight tabular-nums mt-1">
                        ${stats.total_balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] text-cyan-500/50 mt-3 font-mono tracking-widest flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></span>
                        LIVE UPDATING
                    </div>
                </div>

                <div className="bg-purple-950/20 p-7 rounded-3xl border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.05)] backdrop-blur-md relative overflow-hidden transition-all hover:bg-purple-900/30 hover:border-purple-400/30">
                    {/* Background Glow based on Risk */}
                    <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[60px] opacity-20 ${stats.risk_score > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>

                    <div className="flex items-center gap-3 text-purple-200 mb-4 font-semibold uppercase tracking-widest text-xs relative z-10">
                        <Activity className="w-5 h-5 text-purple-400 animate-pulse" />
                        <span>Risk Score</span>
                    </div>
                    <div className={`text-3xl font-bold relative z-10 ${stats.risk_score > 80 ? 'text-emerald-400' : 'text-amber-400'} mt-1`}>
                        {stats.risk_score}<span className="text-sm opacity-60 ml-1">/100</span>
                    </div>
                    <div className="text-[10px] font-mono text-white/40 mt-3 relative z-10 uppercase tracking-widest">
                        {stats.risk_score > 80 ? 'System Secured' : 'Action Required'}
                    </div>
                </div>
            </div>

            {/* Account Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-bottom-6 duration-700 delay-200">
                {stats.accounts.map((account: any, i: number) => {
                    const isChequing = account.type.toLowerCase().includes('chequing');
                    return (
                        <div key={i} className={`relative overflow-hidden p-5 rounded-2xl border transition-all duration-300 group
                            ${isChequing
                                ? 'bg-blue-900/10 border-blue-500/20 hover:bg-blue-900/20 hover:border-blue-500/40'
                                : 'bg-purple-900/10 border-purple-500/20 hover:bg-purple-900/20 hover:border-purple-500/40'
                            }`}>

                            {/* Decorative Background Icon */}
                            <div className="absolute -bottom-6 -right-6 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500 rotate-12">
                                <CreditCard className="w-24 h-24 text-white" />
                            </div>

                            <div className="relative z-10 flex flex-col justify-between h-full">
                                <div>
                                    <div className={`text-[10px] uppercase tracking-widest font-bold mb-2 flex items-center gap-2
                                        ${isChequing ? 'text-blue-300' : 'text-purple-300'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${isChequing ? 'bg-blue-400' : 'bg-purple-400'}`}></div>
                                        {account.type} Account
                                    </div>
                                    <div className="text-2xl font-bold text-white tracking-tight tabular-nums">
                                        ${account.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                </div>
                                <div className="mt-4 text-[10px] text-white/30 font-mono tracking-wider">
                                    ID: •••• {account.account_id.slice(-4)}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

        </div>
    );
}
