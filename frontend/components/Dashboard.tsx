"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CreditCard, DollarSign, Activity, TrendingUp, Loader2 } from 'lucide-react';

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
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                        <DollarSign className="w-4 h-4" />
                        <span>Total Balance</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                        ${stats.total_balance.toLocaleString()}
                    </div>
                </div>

                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                        <Activity className="w-4 h-4" />
                        <span>Risk Score</span>
                    </div>
                    <div className={`text-2xl font-bold ${stats.risk_score > 80 ? 'text-green-400' : 'text-yellow-400'}`}>
                        {stats.risk_score}/100
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                        {stats.risk_score > 80 ? 'Excellent Security' : 'Moderate Risk'}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-xl text-white">
                <h3 className="font-bold mb-1">Guardian Active 🛡️</h3>
                <p className="text-xs text-white/80">AI is monitoring your accounts: {stats.accounts.map((a: any) => a.type).join(', ')}</p>
            </div>
        </div>
    );
}
