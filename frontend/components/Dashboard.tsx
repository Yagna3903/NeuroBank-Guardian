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

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch User Profile (Balance, Risk)
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

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-500" /></div>;
    if (!stats) return <div className="text-gray-500 text-center">Failed to load data.</div>;

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-white/10 to-white/5 p-6 rounded-3xl border-t border-l border-white/20 shadow-xl backdrop-blur-md">
                    <div className="flex items-center gap-3 text-blue-200 mb-4 font-semibold uppercase tracking-wider text-sm">
                        <DollarSign className="w-6 h-6 text-cyan-400" />
                        <span>Total Balance</span>
                    </div>
                    <div className="text-4xl font-extrabold text-white tracking-tight">
                        ${stats.total_balance.toLocaleString()}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-white/10 to-white/5 p-6 rounded-3xl border-t border-l border-white/20 shadow-xl backdrop-blur-md relative overflow-hidden">
                    {/* Background Glow based on Risk */}
                    <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] opacity-20 ${stats.risk_score > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>

                    <div className="flex items-center gap-3 text-blue-200 mb-4 font-semibold uppercase tracking-wider text-sm relative z-10">
                        <Activity className="w-6 h-6 text-purple-400" />
                        <span>Risk Score</span>
                    </div>
                    <div className={`text-4xl font-extrabold relative z-10 ${stats.risk_score > 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {stats.risk_score}/100
                    </div>
                    <div className="text-sm font-medium text-white/60 mt-2 relative z-10">
                        {stats.risk_score > 80 ? 'Excellent Security' : 'Moderate Risk - Check Auth'}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

                <h3 className="text-2xl font-bold mb-2 flex items-center gap-3 relative z-10">
                    <ShieldCheck className="w-8 h-8 text-cyan-300" />
                    Guardian Active
                </h3>
                <p className="text-blue-100/80 text-lg relative z-10 max-w-md leading-relaxed">
                    AI sentinel is monitoring your <b>{stats.accounts.length} linked accounts</b>.
                    Real-time transaction scanning is enabled.
                </p>
                <div className="mt-6 flex flex-wrap gap-2 relative z-10">
                    {stats.accounts.map((a: any, i: number) => (
                        <span key={i} className="bg-white/20 px-3 py-1 rounded-lg text-sm font-mono border border-white/10">
                            {a.type.toUpperCase()}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
