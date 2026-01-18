"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CreditCard, DollarSign, Activity, TrendingUp, Loader2, ShieldCheck, BrainCircuit, ArrowRight, CheckCircle2 } from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';

interface DashboardProps {
    userId: string;
    viewMode?: 'full' | 'summary' | 'activity';
}

// Helper to determine credit status
const getCreditStatus = (score: number) => {
    if (score >= 800) return { label: 'EXCELLENT', color: 'text-emerald-300', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' };
    if (score >= 740) return { label: 'VERY GOOD', color: 'text-cyan-300', bg: 'bg-cyan-500/20', border: 'border-cyan-500/30' };
    if (score >= 670) return { label: 'GOOD', color: 'text-blue-300', bg: 'bg-blue-500/20', border: 'border-blue-500/30' };
    if (score >= 580) return { label: 'FAIR', color: 'text-yellow-300', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30' };
    return { label: 'POOR', color: 'text-red-300', bg: 'bg-red-500/20', border: 'border-red-500/30' };
};

export default function Dashboard({ userId, viewMode = 'full' }: DashboardProps) {
    const [stats, setStats] = useState<any>(null);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [executingId, setExecutingId] = useState<string | null>(null);
    const [recentUpdates, setRecentUpdates] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Initial User Profile and Suggestions
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
                const [userRes, suggRes] = await Promise.all([
                    axios.get(`${apiUrl}/api/v1/users/${userId}`),
                    axios.get(`${apiUrl}/api/v1/agent/suggestions/${userId}`)
                ]);

                setStats(userRes.data);
                setSuggestions(suggRes.data);
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

        const wsUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace("http", "ws");
        console.log("🔌 Connecting to Real-Time Feed...");
        const ws = new WebSocket(`${wsUrl}/api/v1/realtime/ws/dashboard/${userId}`);

        ws.onopen = () => console.log("✅ Real-Time Feed Connected");

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("⚡ Real-Time Update:", data);

            if (data.type === "balance_update") {
                setStats((prev: any) => ({
                    ...prev,
                    total_balance: data.new_balance
                }));
            }

            if (data.type === "full_state_update") {
                setStats((prev: any) => {
                    // 1. Update matching accounts
                    const updatedAccounts = prev.accounts.map((acc: any) => {
                        const update = data.updated_accounts?.find((u: any) => u.account_id === acc.account_id);
                        return update ? update : acc;
                    });

                    // 2. Update matching credit cards
                    const updatedCards = prev.credit_cards?.map((card: any) => {
                        const update = data.updated_credit_cards?.find((u: any) => u.card_id === card.card_id);
                        return update ? update : card;
                    });

                    // 3. Add new transaction
                    let newTxs = prev.recent_transactions || [];
                    if (data.latest_transaction) {
                        newTxs = [data.latest_transaction, ...newTxs].slice(0, 20);
                    }

                    return {
                        ...prev,
                        total_balance: data.new_total_balance !== undefined ? data.new_total_balance : data.new_balance,
                        accounts: updatedAccounts,
                        credit_cards: updatedCards,
                        recent_transactions: newTxs
                    };
                });
            }
        };

        return () => {
            console.log("🔌 Disconnecting Feed...");
            ws.close();
        };
    }, [userId]);

    const handleAgentAction = async (suggestion: any) => {
        if (suggestion.type === 'INFO') return; // Non-executable

        setExecutingId(suggestion.id);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await axios.post(`${apiUrl}/api/v1/agent/execute`, {
                user_id: userId,
                action: suggestion
            });

            if (res.data.status === "success") {
                // Soft remove: If last item, replace with placeholder instead of emptying
                setSuggestions(prev => {
                    const remaining = prev.filter(s => s.id !== suggestion.id);
                    if (remaining.length === 0) {
                        return [{
                            id: 'status_nominal_' + Date.now(),
                            title: 'All Systems Nominal',
                            description: 'No pending actions. Neural scan active.',
                            type: 'INFO',
                            priority: 'LOW'
                        }];
                    }
                    return remaining;
                });
            }
        } catch (error) {
            console.error("Agent execution failed", error);
        } finally {
            setExecutingId(null);
        }
    };

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-cyan-500 w-10 h-10" /></div>;
    if (!stats) return <div className="text-gray-500 text-center font-chakra">Failed to load data.</div>;

    return (
        <div className="space-y-8 font-chakra">

            {/* AGENTIC SUGGESTIONS (Mild & Clear Theme) */}
            {viewMode !== 'activity' && suggestions.length > 0 && (
                <div className="animate-in slide-in-from-top-4 duration-500">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden backdrop-blur-md shadow-sm group">

                        {/* Scrollbar Style */}
                        <style>{`
                            .custom-scrollbar::-webkit-scrollbar {
                                height: 6px;
                                width: 6px;
                            }
                            .custom-scrollbar::-webkit-scrollbar-track {
                                background: rgba(0, 0, 0, 0.1);
                                border-radius: 10px;
                            }
                            .custom-scrollbar::-webkit-scrollbar-thumb {
                                background: rgba(255, 255, 255, 0.2);
                                border-radius: 10px;
                            }
                            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                                 background: rgba(255, 255, 255, 0.4);
                            }
                        `}</style>

                        {/* Background Effect - Subtle */}
                        <div className="absolute inset-0 bg-linear-to-br from-cyan-500/5 to-purple-500/5 opacity-50"></div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                                    <BrainCircuit className="w-5 h-5 text-cyan-200" />
                                </div>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-white/90">
                                    Neuro-Agent Suggestions
                                </h3>
                                <div className="flex gap-2">
                                    <span className="text-[10px] bg-cyan-500/10 text-cyan-200 px-2 py-0.5 rounded border border-cyan-500/20 flex items-center gap-1">
                                        <Activity className="w-3 h-3" /> LIVE
                                    </span>
                                </div>
                            </div>

                            {/* Horizontal Scroll Container */}
                            <div className="relative w-full">
                                <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
                                    {suggestions.map((suggestion, idx) => (
                                        <div key={`${suggestion.id}-${idx}`} className="w-[280px] shrink-0 bg-black/20 border border-white/10 rounded-xl p-4 flex flex-col gap-3 hover:bg-black/30 transition-all group/item backdrop-blur-sm snap-start">
                                            <div className="flex justify-between items-start h-[50px]">
                                                <div>
                                                    <div className="text-white font-bold text-sm mb-1 leading-tight">{suggestion.title}</div>
                                                    <div className="text-white/50 text-[10px] font-mono leading-tight">{suggestion.description}</div>
                                                </div>
                                            </div>
                                            <div className="mt-auto">
                                                {suggestion.type === 'INFO' ? (
                                                    <div className="w-full bg-white/5 text-white/70 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 border border-white/10">
                                                        <CheckCircle2 className="w-3 h-3" /> Monitor
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleAgentAction(suggestion)}
                                                        disabled={executingId === suggestion.id}
                                                        className="w-full bg-white text-black px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-cyan-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group/btn shadow-[0_0_10px_rgba(255,255,255,0.1)]"
                                                    >
                                                        {executingId === suggestion.id ? (
                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                        ) : (
                                                            <>
                                                                Execute <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            {viewMode !== 'activity' && (
                <div className="grid grid-cols-2 gap-6">
                    <div className="bg-cyan-950/20 p-7 rounded-3xl border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.05)] backdrop-blur-md transition-all hover:bg-cyan-900/30 hover:border-cyan-400/30 group">
                        <div className="flex items-center gap-3 text-cyan-200 mb-4 font-semibold uppercase tracking-widest text-xs">
                            <DollarSign className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform" />
                            <span>Total Balance</span>
                        </div>
                        <div className="mt-1">
                            <AnimatedCounter value={stats.total_balance} className="text-3xl font-bold text-white" />
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
                            {(() => {
                                const status = getCreditStatus(stats.credit_score || 0);
                                return (
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider border shadow-sm ${status.color} ${status.bg} ${status.border}`}>
                                        {status.label}
                                    </span>
                                );
                            })()}
                        </div>

                        {/* Score */}
                        <div className="text-5xl font-bold text-white tracking-tight leading-none mb-2">
                            {stats.credit_score || 785}
                        </div>
                        <div className="text-[10px] text-white/40 font-mono uppercase tracking-widest">
                            Updated: {new Date().toLocaleDateString()}
                        </div>
                    </div>
                </div>
            )}
            {/* Account Details & Credit Cards Grid */}
            {viewMode !== 'activity' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-bottom-6 duration-700 delay-200">
                    {/* Bank Accounts */}
                    {stats.accounts.map((account: any, i: number) => {
                        const isChequing = account.type.toLowerCase().includes('chequing');
                        const isSavings = account.type.toLowerCase().includes('savings');

                        let bgClass = 'bg-blue-900/10 border-blue-500/20 hover:bg-blue-900/20 hover:border-blue-500/40';
                        let dotClass = 'bg-blue-400';
                        let textClass = 'text-blue-300';

                        if (isSavings) {
                            bgClass = 'bg-emerald-900/10 border-emerald-500/20 hover:bg-emerald-900/20 hover:border-emerald-500/40';
                            dotClass = 'bg-emerald-400';
                            textClass = 'text-emerald-300';
                        } else if (!isChequing) { // Investment or other
                            bgClass = 'bg-purple-900/10 border-purple-500/20 hover:bg-purple-900/20 hover:border-purple-500/40';
                            dotClass = 'bg-purple-400';
                            textClass = 'text-purple-300';
                        }

                        return (
                            <div key={account.account_id} className={`relative overflow-hidden p-6 rounded-2xl border transition-all duration-300 group ${bgClass} h-full`}>
                                <div className="relative z-10 flex flex-col justify-between h-full">
                                    <div>
                                        <div className={`text-[10px] uppercase tracking-widest font-bold mb-2 flex items-center gap-2 ${textClass}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${dotClass}`}></div>
                                            {account.type} Account
                                        </div>
                                        <div>
                                            <AnimatedCounter value={account.balance} className="text-2xl font-bold text-white" />
                                        </div>
                                        {account.type === 'Investment' && (
                                            <div className="text-[10px] text-white/50 mt-1">{account.holdings}</div>
                                        )}
                                    </div>
                                    <div className="mt-4 text-[10px] text-white/30 font-mono tracking-wider">
                                        ID: •••• {account.account_id.slice(-4)}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Credit Cards */}
                    {stats.credit_cards && stats.credit_cards.map((card: any, i: number) => {
                        const availableCredit = card.limit - card.current_balance;
                        const progress = (card.current_balance / card.limit) * 100;

                        return (
                            <div key={card.card_id} className="relative overflow-hidden p-5 rounded-2xl border bg-pink-950/10 border-pink-500/20 hover:bg-pink-900/20 hover:border-pink-500/40 transition-all duration-300 group cursor-pointer hover:shadow-[0_0_15px_rgba(236,72,153,0.1)] h-full">
                                {/* Decorative Background Icon */}
                                <div className="absolute -bottom-6 -right-6 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500 rotate-12">
                                    <CreditCard className="w-24 h-24 text-white" />
                                </div>

                                <div className="relative z-10 flex flex-col justify-between h-full min-h-[160px]">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 text-pink-300">
                                            <div className="w-1.5 h-1.5 rounded-full bg-pink-400"></div>
                                            Credit Card
                                        </div>
                                        <CreditCard className="w-4 h-4 text-pink-400" />
                                    </div>

                                    <div className="mb-1">
                                        <div className="text-lg font-bold text-white tracking-tight leading-tight">{card.name}</div>
                                        <div className="text-[10px] text-white/40 font-mono tracking-wider mt-1">•••• {card.card_id.split('_').pop()}</div>
                                    </div>

                                    <div className="space-y-3 mt-4">
                                        {/* Stats Row */}
                                        <div className="flex justify-between gap-2">
                                            <div className="min-w-0">
                                                <div className="text-[9px] text-white/50 uppercase tracking-wider mb-0.5 truncate">Current Balance</div>
                                                <AnimatedCounter value={card.current_balance} className="text-base font-bold text-white" />
                                            </div>
                                            <div className="text-right min-w-0">
                                                <div className="text-[9px] text-white/50 uppercase tracking-wider mb-0.5 truncate">Available Credit</div>
                                                <AnimatedCounter value={availableCredit} className="text-base font-bold text-emerald-400" />
                                            </div>
                                        </div>

                                        {/* Utilization Bar */}
                                        <div>
                                            <div className="flex justify-between text-[9px] text-white/40 mb-1">
                                                <span>Limit: ${card.limit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                                <span>{progress.toFixed(0)}% Used</span>
                                            </div>
                                            <div className="w-full bg-black/40 h-1 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-linear-to-r from-pink-500 to-rose-400 rounded-full"
                                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Recent Transactions List - Expanded */}
            {viewMode !== 'summary' && (
                <div className={`bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md flex flex-col ${viewMode === 'activity' ? 'h-[600px]' : 'h-[500px]'}`}>
                    <div className="flex items-center justify-between mb-6 opacity-70 shrink-0">
                        <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-cyan-400" />
                            <span className="text-xs font-bold uppercase tracking-widest text-cyan-100">Recent Activity</span>
                        </div>
                        <span className="text-[10px] text-white/40 font-mono">
                            {(stats.recent_transactions || []).length} ITEMS
                        </span>
                    </div>

                    <div className="space-y-1 overflow-y-auto pr-2 custom-scrollbar flex-1">
                        {(stats.recent_transactions || []).map((tx: any, i: number) => {
                            const isIncome = tx.category === 'Income';
                            const amountColor = isIncome ? 'text-emerald-400' : 'text-white/90';
                            const sign = isIncome ? '+' : '-';

                            return (
                                <div key={i} className="flex items-center justify-between group hover:bg-white/5 p-3 rounded-xl transition-all border border-transparent hover:border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${isIncome ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/30' : 'bg-cyan-950/50 text-cyan-400 border border-cyan-500/20'}`}>
                                            {tx.merchant.slice(0, 1)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white group-hover:text-cyan-200 transition-colors">{tx.merchant}</div>
                                            <div className="text-[10px] text-white/40 uppercase tracking-wider flex items-center gap-2">
                                                <span>{new Date(tx.date).toLocaleDateString()}</span>
                                                <span className="w-1 h-1 rounded-full bg-white/20"></span>
                                                <span>{tx.category}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`font-mono text-sm font-bold ${amountColor}`}>
                                        {sign}${tx.amount.toFixed(2)}
                                    </div>
                                </div>
                            );
                        })}
                        {(!stats.recent_transactions || stats.recent_transactions.length === 0) && (
                            <div className="text-center text-white/30 text-xs py-10 flex flex-col items-center gap-2">
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                                    <Activity className="w-5 h-5 opacity-20" />
                                </div>
                                No recent transactions found.
                            </div>
                        )}
                    </div>

                    {/* Scrollbar Style */}
                    <style>{`
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: rgba(255, 255, 255, 0.02);
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: rgba(255, 255, 255, 0.1);
                        border-radius: 10px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                         background: rgba(255, 255, 255, 0.2);
                    }
                `}</style>
                </div>
            )}

        </div>
    );
}
