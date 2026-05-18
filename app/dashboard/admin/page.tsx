'use client';

import { useEffect } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { useAuth, useUsers, useFinancial } from '@/contexts';
import { useNavigationWithLoading } from '@/lib/utils/navigation';
import { Users, DollarSign, UserCheck, Tag, BarChart3, ArrowRight, Settings, ShieldCheck, Activity, Globe, Zap, Clock } from 'lucide-react';
import { UserRole } from '@/types/user';

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { students, trainers, isLoading: usersLoading } = useUsers();
  const { getTotalBalance, isLoading: financialLoading } = useFinancial();
  const { navigate } = useNavigationWithLoading();

  // Redirect if not authenticated or not an admin
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth/login');
      return;
    }

    if (!authLoading && user && user.role !== 'admin') {
      const dashboardRoutes: Record<string, string> = {
        'student': '/dashboard/student',
        'trainer': '/dashboard/trainer',
      };
      navigate(dashboardRoutes[user.role] || '/');
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  const isLoading = authLoading || usersLoading || financialLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-screen lg:h-screen bg-[#F8FAFC]">
        <Sidebar activeItem="Dashboard" userType={UserRole.ADMIN} />
        <div className="flex-1 flex flex-col">
          <div className="h-20 bg-white border-b border-slate-100 animate-pulse"></div>
          <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8">
            <div className="h-12 w-64 bg-slate-100 rounded-xl animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-50 rounded-[32px] animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  const totalRevenue = getTotalBalance();
  const totalStudents = students?.length || 0;
  const totalTrainers = trainers?.length || 0;
  const pendingTrainers = trainers?.filter(t => t.approvalStatus === 'pending').length || 0;

  const stats = [
    { label: 'Active Students', value: totalStudents, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Elite Trainers', value: totalTrainers, icon: UserCheck, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Pending Apps', value: pendingTrainers, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Net Revenue', value: `${(totalRevenue / 1000000).toFixed(1)}M`, icon: DollarSign, color: 'text-primary', bg: 'bg-primary/5' },
  ];

  const managementGrid = [
    { title: 'User Management', desc: 'Control permissions & roles', icon: Users, href: '/dashboard/admin/users', color: 'bg-blue-600' },
    { title: 'Financial Records', desc: 'Track all transactions', icon: DollarSign, href: '/dashboard/admin/payments', color: 'bg-green-600' },
    { title: 'Promo Engine', desc: 'Manage discount campaigns', icon: Tag, href: '/dashboard/admin/promo-codes', color: 'bg-purple-600' },
    { title: 'Trainer Review', desc: 'Verify onboarding apps', icon: ShieldCheck, href: '/dashboard/admin/trainer-approvals', color: 'bg-orange-500' },
    { title: 'Analytics Center', desc: 'System-wide performance', icon: BarChart3, href: '/dashboard/admin/reports', color: 'bg-indigo-600' },
    { title: 'System Config', desc: 'Environment variables & settings', icon: Settings, href: '/dashboard/admin/system', color: 'bg-slate-900' },
  ];

  return (
    <div className="flex min-h-screen lg:h-screen bg-[#FDF9F2]">
      <Sidebar activeItem="Dashboard" userType={UserRole.ADMIN} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[12px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" /> Admin Level 10
                </span>
              </div>
              <h1 className="text-2xl font-playfair font-bold text-slate-900">
                Command Center
              </h1>
            </div>

            <div className="flex items-center gap-4">
               <div className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-2xl">
                  <Activity className="w-4 h-4 text-green-500" />
                  <span className="text-xs font-bold text-slate-600">SYSTEM: OPTIMAL</span>
               </div>
               <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-primary">
                  <Globe size={20} className="animate-spin-slow" />
               </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            
            {/* Section Header with Badge */}
            <div className="text-center mb-10">
              <div className="relative inline-flex items-center justify-center mb-6">
                <div className="absolute -top-[14px] -left-[14px] w-9 h-9 pointer-events-none text-primary">
                  <svg viewBox="0 0 40 40" strokeWidth="4" stroke="currentColor" fill="none" strokeLinecap="round">
                    <line x1="8" y1="8" x2="14" y2="14" />
                    <line x1="2" y1="20" x2="10" y2="20" />
                    <line x1="20" y1="2" x2="20" y2="10" />
                  </svg>
                </div>
                <span className="text-sm font-semibold tracking-[0.5px] text-primary bg-primary/20 px-5 py-2 rounded-full shadow-sm border border-primary/10">
                  Admin Dashboard
                </span>
              </div>
              <h2 className="text-[32px] md:text-[40px] font-playfair font-light text-slate-900 leading-[1.2]">
                Welcome back, <span className="font-semibold">{user?.firstName || 'Admin'}</span>
              </h2>
            </div>

            {/* Real-time Revenue Card */}
            <div className="mb-10 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[32px] p-10 md:p-12 relative overflow-hidden group shadow-[0_30px_50px_rgba(0,0,0,0.15)]">
               <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/10 blur-[80px] rounded-full -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-110" />
               
               <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  <div className="lg:col-span-7">
                     <p className="text-primary text-xs font-bold uppercase tracking-[0.3em] mb-2">Revenue Performance</p>
                     <h2 className="text-4xl md:text-5xl font-playfair font-light text-white mb-3">
                        {totalRevenue.toLocaleString()} <span className="text-xl md:text-2xl font-light text-slate-400">RWF</span>
                     </h2>
                     <p className="text-slate-400 font-light max-w-md leading-relaxed text-sm">
                        Aggregate revenue generated through orientation fees and monthly subscriptions across all student tiers.
                     </p>
                  </div>
                  <div className="lg:col-span-5 flex flex-col gap-3">
                     <button className="w-full py-3.5 bg-primary text-white rounded-full font-bold text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                        Detailed Financial Audit
                        <ArrowRight size={16} />
                     </button>
                     <button className="w-full py-3.5 bg-white/10 border border-white/20 text-white rounded-full font-bold text-sm hover:bg-white/15 transition-all">
                        Payout Management
                     </button>
                  </div>
               </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-white border border-slate-100 rounded-[24px] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_25px_45px_rgba(0,0,0,0.1)] hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 group">
                   <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                   </div>
                   <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                   <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Admin Management Grid */}
            <div className="mb-12">
               <div className="flex items-center gap-2 mb-8">
                 <div className="relative inline-flex items-center justify-center">
                   <div className="absolute -top-[10px] -left-[10px] w-7 h-7 pointer-events-none text-primary">
                     <svg viewBox="0 0 40 40" strokeWidth="4" stroke="currentColor" fill="none" strokeLinecap="round">
                       <line x1="8" y1="8" x2="14" y2="14" />
                       <line x1="2" y1="20" x2="10" y2="20" />
                       <line x1="20" y1="2" x2="20" y2="10" />
                     </svg>
                   </div>
                   <span className="text-xs font-semibold tracking-[0.5px] text-slate-600 bg-slate-100 px-4 py-1.5 rounded-full">Quick Actions</span>
                 </div>
                 <div className="h-px bg-slate-200 flex-1" />
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {managementGrid.map((action) => (
                   <button
                     key={action.title}
                     onClick={() => navigate(action.href)}
                     className="bg-white border border-slate-100 p-8 rounded-[24px] text-left hover:border-primary/30 hover:shadow-[0_25px_45px_rgba(0,0,0,0.1)] hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden"
                   >
                     <div className="flex items-center justify-between mb-5">
                        <div className={`w-12 h-12 ${action.color} rounded-[18px] flex items-center justify-center shadow-lg shadow-black/10 transition-transform group-hover:scale-110`}>
                           <action.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">
                           <ArrowRight size={18} className="text-slate-900" />
                        </div>
                     </div>
                     <h3 className="text-[22px] font-playfair font-bold text-slate-900 mb-2">{action.title}</h3>
                     <p className="text-[15px] text-slate-500 font-medium leading-relaxed">{action.desc}</p>
                   </button>
                 ))}
               </div>
            </div>

            {/* Infrastructure Widget */}
            <div className="bg-white border border-slate-100 rounded-[24px] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.06)] flex flex-col md:flex-row items-center justify-between gap-8 hover:shadow-[0_25px_45px_rgba(0,0,0,0.1)] transition-all duration-300">
               <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                     <Zap size={24} />
                  </div>
                  <div>
                     <h4 className="text-lg font-playfair font-bold text-slate-900">Infrastructure Health</h4>
                     <p className="text-slate-500 text-sm font-light leading-relaxed">All services are operating at maximum efficiency. 99.9% uptime maintained.</p>
                  </div>
               </div>
               <div className="flex items-center gap-8">
                  <div className="text-right">
                     <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Active Instances</p>
                     <p className="text-2xl font-bold text-slate-900">14 Nodes</p>
                  </div>
                  <div className="h-12 w-px bg-slate-200" />
                  <div className="text-right">
                     <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Latency</p>
                     <p className="text-2xl font-bold text-slate-900 text-green-500">24ms</p>
                  </div>
               </div>
            </div>

            <div className="mt-16 text-center">
               <p className="text-slate-400 text-[12px] font-bold tracking-[0.4em] uppercase italic">Dreamize</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
