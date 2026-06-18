'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { DollarSign, XCircle, Clock, Search, Filter, Download, CreditCard, RefreshCw, TrendingUp, Wallet, ArrowUpRight } from 'lucide-react';
import { UserRole, type Payment, PaymentType } from '@/types';
import { apiClient } from '@/services/client';
import { API_ENDPOINTS } from '@/services/constants';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'success' | 'failed'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'orientation' | 'subscription'>('all');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<Payment[]>(API_ENDPOINTS.ADMIN_PAYMENTS);
      if (response.success) {
        setPayments(response.data ?? []);
      }
    } catch {
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch =
      payment.transactionRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.student._id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesType = typeFilter === 'all' || payment.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalRevenue = payments
    .filter(p => p.status === 'success')
    .reduce((sum, p) => sum + p.finalAmount, 0);

  const pendingAmount = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.finalAmount, 0);

  const successCount = payments.filter(p => p.status === 'success').length;
  const pendingCount = payments.filter(p => p.status === 'pending').length;
  const failedCount = payments.filter(p => p.status === 'failed').length;

  const handleConfirmPayment = async (id: string) => {
    try {
      const response = await apiClient.post<Payment>(`${API_ENDPOINTS.ADMIN_PAYMENTS}/${id}/confirm`, {});
      if (response.success) {
        await fetchPayments();
      }
    } catch {
      alert('Failed to confirm payment');
    }
  };

  const exportData = () => {
    const csv = [
      ['ID', 'Student ID', 'Type', 'Amount', 'Final Amount', 'Status', 'Transaction Ref', 'Paid At'].join(','),
      ...filteredPayments.map(p => [
        p.id, p.student._id, p.type, p.amount, p.finalAmount, p.status, p.transactionRef, new Date(p.paidAt).toLocaleString()
      ].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-screen lg:h-screen bg-[#FDF9F2]">
      <Sidebar activeItem="payments" userType={UserRole.ADMIN} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[12px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Financial Operations</span>
                <span className="text-slate-300">•</span>
                <span className="text-[12px] font-medium text-slate-400 italic">Revenue Audit</span>
              </div>
              <h1 className="text-2xl font-playfair font-bold text-slate-900">Payments & Transactions</h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchPayments}
                className="p-2.5 bg-slate-50 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all border border-slate-100"
                title="Refresh Ledger"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={exportData}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-[14px] hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 flex items-center gap-2"
              >
                <Download className="w-4 h-4 text-primary" />
                Export CSV
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            
            {/* Section Header with Badge */}
            <div className="mb-10">
              <div className="relative inline-flex items-center justify-center mb-6">
                <div className="absolute -top-[14px] -left-[14px] w-9 h-9 pointer-events-none text-primary">
                  <svg viewBox="0 0 40 40" strokeWidth="4" stroke="currentColor" fill="none" strokeLinecap="round">
                    <line x1="8" y1="8" x2="14" y2="14" />
                    <line x1="2" y1="20" x2="10" y2="20" />
                    <line x1="20" y1="2" x2="20" y2="10" />
                  </svg>
                </div>
                <span className="text-sm font-semibold tracking-[0.5px] text-primary bg-primary/20 px-5 py-2 rounded-full shadow-sm border border-primary/10">
                  Financial Audit
                </span>
              </div>
            </div>

            {/* Financial Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-800 rounded-[24px] p-8 shadow-[0_30px_50px_rgba(0,0,0,0.15)] relative overflow-hidden group col-span-1 md:col-span-2">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] rounded-full -mr-16 -mt-16" />
                 <div className="relative z-10">
                    <div className="flex items-center justify-between mb-5">
                       <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-primary" />
                       </div>
                       <span className="text-[12px] font-sans font-semibold uppercase tracking-[2px] text-primary bg-primary/15 border border-primary/30 px-4 py-1.5 rounded-full">Gross Revenue</span>
                    </div>
                    <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.2em]">Total Successful Volume</p>
                    <div className="flex items-baseline gap-2 mt-2">
                       <p className="text-4xl md:text-5xl font-playfair font-light text-white">{totalRevenue.toLocaleString()}</p>
                       <p className="text-xl md:text-2xl font-light text-slate-400">RWF</p>
                    </div>
                 </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-[24px] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_25px_45px_rgba(0,0,0,0.1)] hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 group">
                 <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110">
                    <Clock className="w-5 h-5 text-orange-500" />
                 </div>
                 <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Pipeline</p>
                 <p className="text-3xl font-bold text-slate-900 mt-2">{pendingAmount.toLocaleString()} <span className="text-sm font-bold text-slate-400 italic">RWF</span></p>
              </div>

              <div className="bg-white border border-slate-100 rounded-[24px] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_25px_45px_rgba(0,0,0,0.1)] hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 group">
                 <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                 </div>
                 <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Success Count</p>
                 <p className="text-3xl font-bold text-slate-900 mt-2">{successCount}</p>
              </div>
            </div>

            {/* Quick Actions / Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="bg-white rounded-[24px] border border-slate-100 p-8 shadow-[0_20px_40px_rgba(0,0,0,0.06)] flex items-center gap-6 group hover:border-primary/30 hover:shadow-[0_25px_45px_rgba(0,0,0,0.1)] transition-all duration-300">
                   <div className="w-16 h-16 bg-slate-50 rounded-[24px] flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <Wallet className="w-8 h-8 text-slate-300 group-hover:text-primary transition-colors" />
                   </div>
                   <div>
                      <h3 className="text-[22px] font-playfair font-bold text-slate-900">Pending Approvals</h3>
                      <p className="text-[15px] text-slate-500 font-medium leading-relaxed">Currently {pendingCount} transactions awaiting manual audit.</p>
                   </div>
                   <div className="ml-auto">
                      <div className="text-3xl font-bold text-primary/40 group-hover:text-primary transition-colors">{pendingCount}</div>
                   </div>
                </div>

                <div className="bg-white rounded-[24px] border border-slate-100 p-8 shadow-[0_20px_40px_rgba(0,0,0,0.06)] flex items-center gap-6 group hover:border-red-100 hover:shadow-[0_25px_45px_rgba(0,0,0,0.1)] transition-all duration-300">
                   <div className="w-16 h-16 bg-slate-50 rounded-[24px] flex items-center justify-center group-hover:bg-red-50 transition-colors">
                      <XCircle className="w-8 h-8 text-slate-300 group-hover:text-red-400 transition-colors" />
                   </div>
                   <div>
                      <h3 className="text-[22px] font-playfair font-bold text-slate-900">Failed / Reversed</h3>
                      <p className="text-[15px] text-slate-500 font-medium leading-relaxed">System has detected {failedCount} unsuccessful attempts.</p>
                   </div>
                   <div className="ml-auto">
                      <div className="text-3xl font-bold text-slate-200 group-hover:text-red-300 transition-colors">{failedCount}</div>
                   </div>
                </div>
            </div>

            {/* Main Ledger Table */}
            <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_20px_40px_rgba(0,0,0,0.06)] overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                 <div>
                    <h2 className="text-xl font-playfair font-bold text-slate-900">Transaction Ledger</h2>
                    <p className="text-slate-500 text-sm font-light italic">Comprehensive history of all financial activities</p>
                 </div>

                 <div className="flex flex-wrap items-center gap-3">
                    <div className="relative group">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-primary transition-colors" />
                      <input 
                        type="text" 
                        placeholder="Search ref ID..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all w-full sm:w-48 lg:w-64"
                      />
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 rounded-xl">
                      <Filter size={16} className="text-slate-400" />
                      <select
                        value={statusFilter}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v === 'all' || v === 'pending' || v === 'success' || v === 'failed') {
                            setStatusFilter(v);
                          }
                        }}
                        className="bg-transparent border-none text-sm font-bold text-slate-600 focus:ring-0"
                      >
                        <option value="all">Status</option>
                        <option value="pending">Pending</option>
                        <option value="success">Success</option>
                        <option value="failed">Failed</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 rounded-xl">
                      <CreditCard size={16} className="text-slate-400" />
                      <select
                        value={typeFilter}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v === 'all' || v === 'orientation' || v === 'subscription') {
                            setTypeFilter(v);
                          }
                        }}
                        className="bg-transparent border-none text-sm font-bold text-slate-600 focus:ring-0"
                      >
                        <option value="all">All Types</option>
                        <option value="orientation">Orientation</option>
                        <option value="subscription">Subscription</option>
                      </select>
                    </div>
                 </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 text-[11px] font-bold uppercase tracking-widest text-slate-400">Transaction ID</th>
                      <th className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 text-[11px] font-bold uppercase tracking-widest text-slate-400">Payer Information</th>
                      <th className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 text-[11px] font-bold uppercase tracking-widest text-slate-400">Classification</th>
                      <th className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 text-[11px] font-bold uppercase tracking-widest text-slate-400">Amount</th>
                      <th className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 text-[11px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                      <th className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 text-right text-[11px] font-bold uppercase tracking-widest text-slate-400">Audit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {isLoading ? (
                       [...Array(5)].map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={6} className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5"><div className="h-10 bg-slate-50 rounded-xl w-full" /></td>
                        </tr>
                      ))
                    ) : filteredPayments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-8 py-20 text-center">
                           <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                              <Wallet size={32} className="text-slate-200" />
                           </div>
                           <p className="text-slate-400 font-medium italic">No transactions match these filters</p>
                        </td>
                      </tr>
                    ) : (
                      filteredPayments.map((payment) => (
                        <tr key={payment.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                          <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                                <CreditCard size={18} className="text-slate-400 group-hover:text-primary transition-colors" />
                              </div>
                              <span className="font-mono text-sm font-bold text-slate-900">{payment.transactionRef}</span>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white text-[10px] font-black">ID</div>
                              <span className="text-[13px] font-medium text-slate-600 truncate max-w-[150px]">{payment.student._id}</span>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                              payment.type === PaymentType.ORIENTATION
                                ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                                : 'bg-fuchsia-50 text-fuchsia-600 border border-fuchsia-100'
                            }`}>
                              {payment.type}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
                            <div className="flex flex-col">
                               <span className="text-[15px] font-black text-slate-900">{payment.finalAmount.toLocaleString()} RWF</span>
                               {payment.promoCodeApplied && (
                                 <span className="text-[10px] font-bold text-primary uppercase tracking-widest mt-0.5 flex items-center gap-1">
                                    <ArrowUpRight size={10} /> CODE: {payment.promoCodeApplied}
                                 </span>
                               )}
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                              payment.status === 'success'
                                ? 'bg-green-50 text-green-600 border border-green-100'
                                : payment.status === 'pending'
                                ? 'bg-orange-50 text-orange-600 border border-orange-100'
                                : 'bg-red-50 text-red-600 border border-red-100'
                            }`}>
                              {payment.status}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 text-right">
                            {payment.status === 'pending' ? (
                              <button
                                onClick={() => handleConfirmPayment(payment.id)}
                                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[11px] font-bold uppercase tracking-wider hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
                              >
                                Manual Audit
                              </button>
                            ) : (
                               <span className="text-slate-300 italic text-[11px] font-medium">Auto-Processed</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-12 text-center">
               <p className="text-slate-400 text-[11px] font-bold tracking-[0.3em] uppercase italic">© Dreamize Africa 2025 • Secured Transaction Protocol</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
