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

                <div className="bg-purple-950/20 p-6 rounded-3xl border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.05)] backdrop-blur-md relative overflow-hidden transition-all hover:bg-purple-900/30 hover:border-purple-400/30 flex flex-col justify-between group">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-purple-200 font-semibold uppercase tracking-widest text-xs">
                            <TrendingUp className="w-4 h-4 text-purple-400" />
                            <span>Credit Score</span>
                        </div>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold tracking-wider border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">EXCELLENT</span>
                    </div>

                    {/* Score */}
                    <div className="text-4xl font-bold text-white tracking-tight leading-none mb-6">
                        {stats.credit_score || 785}
                    </div>

                    {/* Credit Card Mini Report */}
                    {stats.credit_cards && stats.credit_cards.length > 0 ? (
                        <div className="mt-auto pt-4 border-t border-white/5">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white/5 p-2 rounded-lg group-hover:bg-white/10 transition-colors">
                                        <CreditCard className="w-4 h-4 text-purple-300" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-white/90 font-bold tracking-wide">{stats.credit_cards[0].name}</span>
                                        <span className="text-[10px] text-white/50 font-mono tracking-wider">•••• {stats.credit_cards[0].card_id.slice(-4)}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-white/90 font-bold tabular-nums">${stats.credit_cards[0].current_balance.toLocaleString()}</div>
                                    <div className="text-[9px] text-white/40 uppercase font-bold tracking-wider">Used</div>
                                </div>
                            </div>
                            {/* Utilization Bar */}
                            <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full transition-all duration-1000 ease-out group-hover:shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                                    style={{ width: `${Math.min(((stats.credit_cards[0].current_balance / stats.credit_cards[0].limit) * 100), 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-auto pt-2 text-xs text-white/40 flex items-center gap-2">
                            <ShieldCheck className="w-3 h-3" /> No active credit lines
                        </div>
                    )}
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

            {/* Recent Transactions List */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                <div className="flex items-center gap-2 mb-6 opacity-70">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold uppercase tracking-widest text-cyan-100">Recent Activity</span>
                </div>

                <div className="space-y-4">
                    {(stats.recent_transactions || []).map((tx: any, i: number) => (
                        <div key={i} className="flex items-center justify-between group hover:bg-white/5 p-2 rounded-lg transition-colors -mx-2">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-cyan-950/50 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs font-bold">
                                    {tx.merchant.slice(0, 1)}
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white group-hover:text-cyan-200 transition-colors">{tx.merchant}</div>
                                    <div className="text-[10px] text-white/40 uppercase tracking-wider">{new Date(tx.date).toLocaleDateString()} • {tx.category}</div>
                                </div>
                            </div>
                            <div className="font-mono text-sm font-bold text-white/90">
                                -${tx.amount.toFixed(2)}
                            </div>
                        </div>
                    ))}
                    {(!stats.recent_transactions || stats.recent_transactions.length === 0) && (
                        <div className="text-center text-white/30 text-xs py-4">No recent transactions found.</div>
                    )}
                </div>
            </div>

        </div>
    );
}
