'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { UserRole } from '@/types';
import { adminService, type AdminAnalytics } from '@/services/admin';
import {
  Award,
  BarChart3,
  BookOpen,
  CreditCard,
  Loader2,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-RW', {
    style: 'currency',
    currency: 'RWF',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function AdminReportsPage() {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminService
      .getAnalytics()
      .then((response) => {
        if (response.success && response.data) {
          setAnalytics(response.data);
        } else {
          setError('Unable to load analytics.');
        }
      })
      .catch(() => setError('Unable to load analytics.'))
      .finally(() => setLoading(false));
  }, []);

  const stats = analytics
    ? [
        {
          label: 'Students',
          value: analytics.usersByRole.student,
          icon: Users,
          color: 'text-blue-500',
          bg: 'bg-blue-50',
        },
        {
          label: 'Trainers',
          value: analytics.usersByRole.trainer,
          icon: UserCheck,
          color: 'text-green-500',
          bg: 'bg-green-50',
        },
        {
          label: 'Active Subscriptions',
          value: analytics.activeSubscriptions,
          icon: CreditCard,
          color: 'text-purple-500',
          bg: 'bg-purple-50',
        },
        {
          label: 'Active Roadmaps',
          value: analytics.activeRoadmaps,
          icon: BookOpen,
          color: 'text-orange-500',
          bg: 'bg-orange-50',
        },
        {
          label: 'Certificates Issued',
          value: analytics.totalCertificates,
          icon: Award,
          color: 'text-amber-500',
          bg: 'bg-amber-50',
        },
        {
          label: 'Pending Trainers',
          value: analytics.pendingTrainers,
          icon: UserCheck,
          color: 'text-rose-500',
          bg: 'bg-rose-50',
        },
      ]
    : [];

  return (
    <div className="flex min-h-screen lg:h-screen bg-[#F8FAFC]">
      <Sidebar activeItem="Reports" userType={UserRole.ADMIN} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-slate-100 px-8 py-5">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Analytics Center</h1>
              <p className="text-slate-500 mt-1">Platform-wide performance from live backend data.</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : error || !analytics ? (
              <div className="bg-white rounded-[32px] border border-slate-100 p-12 text-center text-slate-500">
                {error || 'No analytics available.'}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                  {stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm"
                    >
                      <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center mb-4`}>
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        {stat.label}
                      </p>
                      <p className="text-3xl font-black text-slate-900 mt-1">{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <h2 className="text-lg font-bold text-slate-900">Revenue</h2>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-slate-500">Total revenue</p>
                        <p className="text-3xl font-black text-slate-900">
                          {formatCurrency(analytics.totalRevenue)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">This month</p>
                        <p className="text-2xl font-bold text-primary">
                          {formatCurrency(analytics.monthlyRevenue)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Operational snapshot</h2>
                    <ul className="space-y-3 text-sm text-slate-600">
                      <li className="flex justify-between border-b border-slate-50 pb-3">
                        <span>Students enrolled</span>
                        <span className="font-bold text-slate-900">{analytics.usersByRole.student}</span>
                      </li>
                      <li className="flex justify-between border-b border-slate-50 pb-3">
                        <span>Approved trainers</span>
                        <span className="font-bold text-slate-900">{analytics.usersByRole.trainer}</span>
                      </li>
                      <li className="flex justify-between border-b border-slate-50 pb-3">
                        <span>Pending trainer applications</span>
                        <span className="font-bold text-slate-900">{analytics.pendingTrainers}</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Certificates issued</span>
                        <span className="font-bold text-slate-900">{analytics.totalCertificates}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
