'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { useAuth } from '@/contexts';
import { useNavigationWithLoading } from '@/lib/utils/navigation';
import { Users, Phone, Calendar, ArrowRight, TrendingUp, Clock, UserCheck, Loader2 } from 'lucide-react';
import { UserRole } from '@/types/user';
import { salesService, type SalesLeadRecord } from '@/services';
import { LeadStatus } from '@/types/dashboard';

export default function SalesManagerDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { navigate } = useNavigationWithLoading();
  const [dashboard, setDashboard] = useState<{ totalFreeSignups: number; conversionRate: number; leads: SalesLeadRecord[] } | null>(null);
  const [loading, setLoading] = useState(true);

  // Redirect if not authenticated or not a sales manager
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth/login');
      return;
    }

    if (!authLoading && user && user.role !== 'sales_manager') {
      const dashboardRoutes: Record<string, string> = {
        'student': '/dashboard/student',
        'trainer': '/dashboard/trainer',
        'admin': '/dashboard/admin',
        'guardian': '/dashboard/guardian',
      };
      navigate(dashboardRoutes[user.role] || '/');
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  useEffect(() => {
    if (user?.role === 'sales_manager') {
      salesService
        .getDashboard()
        .then((response) => {
          if (response.success && response.data) {
            setDashboard(response.data);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [user?.role]);

  const isLoading = authLoading || loading;

  if (isLoading) {
    return (
      <div className="flex min-h-screen lg:h-screen bg-[#F8FAFC]">
        <Sidebar activeItem="Dashboard" userType={UserRole.SALES_MANAGER} />
        <div className="flex-1 flex flex-col">
          <div className="h-20 bg-white border-b border-slate-100 animate-pulse"></div>
          <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8">
            <div className="h-12 w-64 bg-slate-100 rounded-xl animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-50 rounded-[32px] animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'sales_manager') {
    return null;
  }

  // Filter for open CRM leads
  const freeLeads = dashboard?.leads.filter((lead) => lead.status !== LeadStatus.SUBSCRIBED && lead.status !== LeadStatus.LOST) || [];
  const paidStudents = dashboard?.leads.filter((lead) => lead.status === LeadStatus.SUBSCRIBED) || [];
  const totalLeads = dashboard?.totalFreeSignups ?? freeLeads.length;
  const conversionRate = dashboard?.conversionRate ?? 0;

  const stats = [
    { label: 'Free Leads', value: totalLeads, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Paid Students', value: paidStudents.length, icon: UserCheck, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Conversion Rate', value: `${conversionRate}%`, icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  const recentLeads = freeLeads.slice(0, 5);

  return (
    <div className="flex min-h-screen lg:h-screen bg-[#F8FAFC]">
      <Sidebar activeItem="Dashboard" userType={UserRole.SALES_MANAGER} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[12px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" /> Sales Manager
                </span>
              </div>
              <h1 className="text-2xl font-playfair font-bold text-slate-900">
                Sales Dashboard
              </h1>
            </div>

            <div className="flex items-center gap-4">
               <div className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-2xl">
                  <Clock className="w-4 h-4 text-green-500" />
                  <span className="text-xs font-bold text-slate-600">Active: {totalLeads} Leads</span>
               </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                   <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                   </div>
                   <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                   <p className="text-3xl font-black text-slate-900 mt-1">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Recent Leads Section */}
            <div className="mb-12">
               <div className="flex items-center justify-between mb-8">
                 <h2 className="text-xl font-playfair font-bold text-slate-900 flex items-center gap-2">
                   Recent Free Leads
                   <div className="h-px bg-slate-100 flex-1 ml-4" />
                 </h2>
                 <button
                   onClick={() => navigate('/dashboard/sales/leads')}
                   className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 flex items-center gap-2"
                 >
                   View All Leads
                   <ArrowRight size={16} />
                 </button>
               </div>
               
               <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                 {recentLeads.length === 0 ? (
                   <div className="p-20 text-center">
                     <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-6">
                       <Users size={40} className="text-slate-200" />
                     </div>
                     <h3 className="text-xl font-bold text-slate-900 mb-2">No Free Leads</h3>
                     <p className="text-slate-500 font-light">All registered students have paid orientation fees.</p>
                   </div>
                 ) : (
                   <div className="divide-y divide-slate-50">
                     {recentLeads.map((lead) => (
                       <div key={lead._id} className="p-6 hover:bg-slate-50/50 transition-all">
                         <div className="flex items-center justify-between">
                           <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-blue-500 rounded-[18px] flex items-center justify-center text-white font-black text-sm">
                               {lead.fullName.split(' ').map((part) => part.charAt(0)).join('').slice(0, 2)}
                             </div>
                             <div>
                               <div className="font-bold text-slate-900">{lead.fullName}</div>
                               <div className="text-[13px] text-slate-500 font-light">{lead.email}</div>
                             </div>
                           </div>
                           <div className="flex items-center gap-6">
                             <div className="flex items-center gap-2 text-[13px] text-slate-600">
                               <Phone size={14} className="text-slate-400" />
                               {lead.phone || 'N/A'}
                             </div>
                             <div className="flex items-center gap-2 text-[13px] text-slate-600">
                               <Calendar size={14} className="text-slate-400" />
                               {new Date(lead.signupDate).toLocaleDateString()}
                             </div>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 )}
               </div>
            </div>

            <div className="mt-16 text-center">
               <p className="text-slate-400 text-[12px] font-bold tracking-[0.4em] uppercase italic">Dreamize Africa Sales Management System</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
