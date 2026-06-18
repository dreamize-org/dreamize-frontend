'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { 
  Plus, X, Search, 
  Calendar, Mail, Percent, Info, Ticket, DollarSign,
  AlertCircle, CheckCircle, XCircle, Sparkles, Wand2
} from 'lucide-react';
import { UserRole, type PromoCode } from '@/types';
import { apiClient } from '@/services/client';
import { PremiumInput } from '@/components/ui/premium-input';
import { PremiumButton } from '@/components/ui/premium-button';

interface PromoCodeForm {
  code: string;
  assignedStudentEmail: string;
  discountAmount: number;
  discountPercentage: number;
  reason: string;
  expiresAt: string;
}

const EMPTY_FORM: PromoCodeForm = {
  code: '',
  assignedStudentEmail: '',
  discountAmount: 0,
  discountPercentage: 0,
  reason: '',
  expiresAt: '',
};

export default function PromoCodesPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<PromoCodeForm>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const fetchPromoCodes = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<PromoCode[]>('/api/admin/promo-codes');
      if (response.success) {
        setPromoCodes(response.data ?? []);
      }
    } catch {
      setPromoCodes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPromoCodes = promoCodes.filter(pc =>
    pc.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pc.assignedStudentEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const usedCount = promoCodes.filter(pc => pc.isUsed).length;
  const activeCount = promoCodes.filter(pc => !pc.isUsed && new Date(pc.expiresAt) > new Date()).length;
  const expiredCount = promoCodes.filter(pc => !pc.isUsed && new Date(pc.expiresAt) <= new Date()).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!form.code.trim() || !form.assignedStudentEmail.trim() || !form.reason.trim()) {
      setError('Code, student email, and reason are required');
      return;
    }

    if (form.discountAmount <= 0 && form.discountPercentage <= 0) {
      setError('Either discount amount or percentage must be greater than 0');
      return;
    }

    try {
      const response = await apiClient.post<PromoCode>('/api/admin/promo-codes', {
        ...form,
        expiresAt: new Date(form.expiresAt).toISOString(),
      });

      if (response.success) {
        setSuccess(true);
        setForm(EMPTY_FORM);
        await fetchPromoCodes();
        setTimeout(() => setShowModal(false), 1200);
      } else {
        setError('Failed to create promo code');
      }
    } catch {
      setError('Failed to create promo code. Please try again.');
    }
  };

  const generateCode = () => {
    const prefix = 'UMB';
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    setForm(prev => ({ ...prev, code: `${prefix}-${random}` }));
  };

  return (
    <div className="flex min-h-screen lg:h-screen bg-[#FDF9F2]">
      <Sidebar activeItem="promos" userType={UserRole.ADMIN} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[12px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Marketing Assets</span>
                <span className="text-slate-300">•</span>
                <span className="text-[12px] font-medium text-slate-400 italic">Discounts & Promos</span>
              </div>
              <h1 className="text-2xl font-playfair font-bold text-slate-900">Promo Code Manager</h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => { setShowModal(true); setForm(EMPTY_FORM); setError(null); setSuccess(false); }}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-[14px] hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 flex items-center gap-2 group"
              >
                <Plus className="w-4 h-4 text-primary group-hover:rotate-90 transition-transform" />
                Issue New Code
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
                  Promo Inventory
                </span>
              </div>
            </div>

            {/* Promotion Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {[
                { label: 'Total Issued', value: promoCodes.length, icon: Ticket, color: 'text-slate-600', bg: 'bg-slate-100' },
                { label: 'Redeemed', value: usedCount, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
                { label: 'Available', value: activeCount, icon: Sparkles, color: 'text-primary', bg: 'bg-primary/10' },
                { label: 'Expired', value: expiredCount, icon: XCircle, color: 'text-red-400', bg: 'bg-red-50' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white border border-slate-100 rounded-[24px] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_25px_45px_rgba(0,0,0,0.1)] hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 group">
                   <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                   </div>
                   <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                   <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Content Container */}
            <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_20px_40px_rgba(0,0,0,0.06)] overflow-hidden">
              
              <div className="p-8 border-b border-slate-50 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                   <h2 className="text-xl font-playfair font-bold text-slate-900">Active Inventory</h2>
                   <p className="text-slate-500 text-sm font-light italic">Track and audit all issued promotional vouchers</p>
                </div>

                <div className="relative group max-w-md w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search by code or student identity..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all w-full"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                {isLoading ? (
                   <div className="p-20 text-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-400 font-medium">Syncing Promotions...</p>
                  </div>
                ) : filteredPromoCodes.length === 0 ? (
                  <div className="p-20 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-6">
                      <Ticket size={40} className="text-slate-200" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No Codes Found</h3>
                    <p className="text-slate-500 font-light">Refine your search parameters to locate a voucher.</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 text-[11px] font-bold uppercase tracking-widest text-slate-400">Promo Code</th>
                        <th className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 text-[11px] font-bold uppercase tracking-widest text-slate-400">Discount</th>
                        <th className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 text-[11px] font-bold uppercase tracking-widest text-slate-400">Usage</th>
                        <th className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 text-[11px] font-bold uppercase tracking-widest text-slate-400">Expiry</th>
                        <th className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 text-right text-[11px] font-bold uppercase tracking-widest text-slate-400">Actions</th>
                        <th className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 text-right">Reference</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredPromoCodes.map((pc) => (
                        <tr key={pc.code} className="group hover:bg-slate-50/50 transition-all duration-300">
                          <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all border border-slate-100/50">
                                <Ticket size={18} className="text-slate-400 group-hover:text-primary transition-colors" />
                              </div>
                              <span className="font-mono text-sm font-black text-slate-900 group-hover:text-primary transition-colors">{pc.code}</span>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white text-[10px] font-black">@</div>
                              <span className="text-[13px] font-medium text-slate-600 truncate max-w-[200px]">{pc.assignedStudentEmail}</span>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
                            <div className="flex flex-col">
                               <span className="text-[15px] font-black text-slate-900">
                                 {pc.discountPercentage > 0 ? `${pc.discountPercentage}% OFF` : `${pc.discountAmount.toLocaleString()} RWF`}
                               </span>
                               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Single Use Voucher</span>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                              pc.isUsed
                                ? 'bg-green-50 text-green-600 border border-green-100'
                                : new Date(pc.expiresAt) > new Date()
                                ? 'bg-primary/10 text-primary border border-primary/20'
                                : 'bg-red-50 text-red-600 border border-red-100'
                            }`}>
                              {pc.isUsed ? 'Redeemed' : new Date(pc.expiresAt) > new Date() ? 'Active' : 'Expired'}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
                            <div className="flex items-center gap-2 text-[13px] text-slate-600 font-medium">
                              <Calendar size={14} className="text-slate-400" />
                              {new Date(pc.expiresAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 text-right">
                            <span className="text-[12px] font-medium text-slate-400 italic max-w-[150px] truncate inline-block">{pc.reason}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="mt-12 text-center">
               <p className="text-slate-400 text-[11px] font-bold tracking-[0.3em] uppercase italic">© Dreamize Africa 2025 • Promo Inventory Protocol</p>
            </div>
          </div>
        </main>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-xl p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full -mr-32 -mt-32" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Mint Promo Voucher</h2>
                  <p className="text-slate-500 font-light mt-1">Generate a secure discount credential</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-[20px] flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <p className="text-sm text-green-700 font-bold">Voucher minted successfully!</p>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-[20px] flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 ml-1 mb-2">Voucher Code</label>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <PremiumInput
                        label=""
                        icon={<Ticket size={20} />}
                        placeholder="E.g. UMB-XYZ123"
                        value={form.code}
                        onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={generateCode}
                      className="px-6 h-[52px] bg-slate-900 text-white rounded-2xl font-bold text-[13px] hover:bg-slate-800 transition-all flex items-center gap-2"
                    >
                      <Wand2 size={16} className="text-primary" />
                      Auto-Gen
                    </button>
                  </div>
                </div>

                <PremiumInput
                  label="Target Student Email"
                  icon={<Mail size={20} />}
                  type="email"
                  placeholder="student@dreamize.rw"
                  value={form.assignedStudentEmail}
                  onChange={e => setForm({ ...form, assignedStudentEmail: e.target.value })}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <PremiumInput
                    label="Discount %"
                    icon={<Percent size={20} />}
                    type="number"
                    placeholder="0"
                    value={form.discountPercentage.toString()}
                    onChange={e => setForm({ ...form, discountPercentage: parseInt(e.target.value) || 0 })}
                  />
                   <PremiumInput
                    label="Fixed Amount (RWF)"
                    icon={<DollarSign size={20} />}
                    type="number"
                    placeholder="0"
                    value={form.discountAmount.toString()}
                    onChange={e => setForm({ ...form, discountAmount: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <PremiumInput
                    label="Expiration Date"
                    icon={<Calendar size={20} />}
                    type="date"
                    value={form.expiresAt}
                    onChange={e => setForm({ ...form, expiresAt: e.target.value })}
                  />
                  <PremiumInput
                    label="Creation Reason"
                    icon={<Info size={20} />}
                    placeholder="Scholarship..."
                    value={form.reason}
                    onChange={e => setForm({ ...form, reason: e.target.value })}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <PremiumButton
                    type="submit"
                    className="flex-1"
                  >
                    Authorize Issuance
                  </PremiumButton>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-8 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Add missing icon
