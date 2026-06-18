'use client';

import { useEffect, useState } from 'react';
import {
  AdminFooter,
  AdminHeader,
  AdminHeroCard,
  AdminLoadingState,
  AdminMain,
  AdminPanel,
  AdminSectionBadge,
  AdminShell,
  AdminStatCard,
} from '@/components/admin/AdminLayout';
import { useNavigationWithLoading } from '@/lib/utils/navigation';
import { adminService, type AdminAnalytics } from '@/services/admin';
import {
  Award,
  BookOpen,
  CreditCard,
  TrendingUp,
  UserCheck,
  Users,
  ArrowRight,
  BarChart3,
  Activity,
} from 'lucide-react';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-RW', {
    style: 'currency',
    currency: 'RWF',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function AdminReportsPage() {
  const { navigate } = useNavigationWithLoading();
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
          iconClassName: 'text-blue-500',
          iconBgClassName: 'bg-blue-50',
        },
        {
          label: 'Trainers',
          value: analytics.usersByRole.trainer,
          icon: UserCheck,
          iconClassName: 'text-green-500',
          iconBgClassName: 'bg-green-50',
        },
        {
          label: 'Active Subscriptions',
          value: analytics.activeSubscriptions,
          icon: CreditCard,
          iconClassName: 'text-purple-500',
          iconBgClassName: 'bg-purple-50',
        },
        {
          label: 'Active Roadmaps',
          value: analytics.activeRoadmaps,
          icon: BookOpen,
          iconClassName: 'text-orange-500',
          iconBgClassName: 'bg-orange-50',
        },
        {
          label: 'Certificates Issued',
          value: analytics.totalCertificates,
          icon: Award,
          iconClassName: 'text-amber-500',
          iconBgClassName: 'bg-amber-50',
        },
        {
          label: 'Pending Trainers',
          value: analytics.pendingTrainers,
          icon: UserCheck,
          iconClassName: 'text-rose-500',
          iconBgClassName: 'bg-rose-50',
        },
      ]
    : [];

  return (
    <AdminShell activeItem="reports">
      <AdminHeader
        badge="Intelligence"
        subtitle="Platform Analytics"
        title="Analytics Center"
        actions={
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-2xl">
            <Activity className="w-4 h-4 text-green-500" />
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Live Data</span>
          </div>
        }
      />

      <AdminMain>
        <AdminSectionBadge label="Performance Overview" />

        {loading ? (
          <AdminLoadingState label="Crunching platform metrics..." />
        ) : error || !analytics ? (
          <AdminPanel>
            <div className="p-12 text-center text-slate-500">{error || 'No analytics available.'}</div>
          </AdminPanel>
        ) : (
          <>
            <AdminHeroCard
              eyebrow="Revenue Intelligence"
              title={
                <>
                  {formatCurrency(analytics.totalRevenue)}{' '}
                  <span className="text-xl md:text-2xl font-light text-slate-400">lifetime</span>
                </>
              }
              description="Combined orientation and subscription revenue across the entire platform."
              footer={
                <p className="text-primary/90 text-sm font-medium">
                  This month: {formatCurrency(analytics.monthlyRevenue)}
                </p>
              }
              actions={
                <>
                  <button
                    onClick={() => navigate('/dashboard/admin/payments')}
                    className="w-full py-3.5 bg-primary text-white rounded-full font-bold text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                  >
                    Open Payments Ledger
                    <ArrowRight size={16} />
                  </button>
                  <button
                    onClick={() => navigate('/dashboard/admin/certificates')}
                    className="w-full py-3.5 bg-white/10 border border-white/20 text-white rounded-full font-bold text-sm hover:bg-white/15 transition-all"
                  >
                    View Certificates
                  </button>
                </>
              }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
              {stats.map((stat) => (
                <AdminStatCard key={stat.label} {...stat} />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
              <AdminPanel title="Revenue Breakdown" description="Financial performance at a glance">
                <div className="p-8 space-y-6">
                  <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Total revenue</p>
                      <p className="text-3xl font-playfair font-bold text-slate-900">
                        {formatCurrency(analytics.totalRevenue)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-5 bg-primary/5 rounded-2xl border border-primary/10">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">This month</p>
                      <p className="text-2xl font-playfair font-bold text-primary">
                        {formatCurrency(analytics.monthlyRevenue)}
                      </p>
                    </div>
                  </div>
                </div>
              </AdminPanel>

              <AdminPanel title="Operational Snapshot" description="People, learning paths, and credentials">
                <div className="p-8">
                  <ul className="space-y-1">
                    {[
                      { label: 'Students enrolled', value: analytics.usersByRole.student },
                      { label: 'Approved trainers', value: analytics.usersByRole.trainer },
                      { label: 'Pending trainer applications', value: analytics.pendingTrainers },
                      { label: 'Active roadmaps', value: analytics.activeRoadmaps },
                      { label: 'Active subscriptions', value: analytics.activeSubscriptions },
                      { label: 'Certificates issued', value: analytics.totalCertificates },
                    ].map((row, index, arr) => (
                      <li
                        key={row.label}
                        className={`flex justify-between items-center py-4 ${
                          index < arr.length - 1 ? 'border-b border-slate-50' : ''
                        }`}
                      >
                        <span className="text-sm text-slate-600">{row.label}</span>
                        <span className="text-lg font-bold text-slate-900 tabular-nums">{row.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </AdminPanel>
            </div>
          </>
        )}

        <AdminFooter label="© Dreamize Africa 2025 • Analytics Protocol" />
      </AdminMain>
    </AdminShell>
  );
}
