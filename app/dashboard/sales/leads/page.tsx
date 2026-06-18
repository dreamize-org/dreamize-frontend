'use client';

import { useCallback, useEffect, useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import {
  Users,
  Phone,
  Mail,
  Calendar,
  Search,
  Filter,
  Download,
  Loader2,
  MessageSquare,
} from 'lucide-react';
import { useRequireRole } from '@/hooks/useRequireRole';
import { UserRole } from '@/types/user';
import { LeadStatus } from '@/types/dashboard';
import { salesService, type SalesLeadRecord } from '@/services';

const STATUS_LABELS: Record<LeadStatus, string> = {
  [LeadStatus.NEW]: 'New',
  [LeadStatus.CONTACTED]: 'Contacted',
  [LeadStatus.ORIENTATION_BOOKED]: 'Orientation booked',
  [LeadStatus.SUBSCRIBED]: 'Subscribed',
  [LeadStatus.LOST]: 'Lost',
};

const STATUS_COLORS: Record<LeadStatus, string> = {
  [LeadStatus.NEW]: 'bg-blue-50 text-blue-600 border-blue-100',
  [LeadStatus.CONTACTED]: 'bg-amber-50 text-amber-700 border-amber-100',
  [LeadStatus.ORIENTATION_BOOKED]: 'bg-purple-50 text-purple-700 border-purple-100',
  [LeadStatus.SUBSCRIBED]: 'bg-green-50 text-green-600 border-green-100',
  [LeadStatus.LOST]: 'bg-slate-100 text-slate-500 border-slate-200',
};

export default function SalesManagerLeadsPage() {
  const { user, authLoading, isAuthorized } = useRequireRole('sales_manager');
  const [leads, setLeads] = useState<SalesLeadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | LeadStatus>('all');
  const [selectedLead, setSelectedLead] = useState<SalesLeadRecord | null>(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [statusDraft, setStatusDraft] = useState<LeadStatus>(LeadStatus.NEW);
  const [saving, setSaving] = useState(false);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    try {
      const response = await salesService.getLeads({
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: searchQuery.trim() || undefined,
      });
      setLeads(response.success && response.data ? response.data : []);
    } catch {
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    if (isAuthorized && user?.role === 'sales_manager') {
      loadLeads();
    }
  }, [isAuthorized, user?.role, loadLeads]);

  const openLeadEditor = (lead: SalesLeadRecord) => {
    setSelectedLead(lead);
    setNotesDraft(lead.notes || '');
    setStatusDraft(lead.status);
  };

  const saveLead = async (markContacted = false) => {
    if (!selectedLead) return;
    setSaving(true);
    try {
      await salesService.updateLead(selectedLead._id, {
        status: statusDraft,
        notes: notesDraft,
        markContacted,
      });
      setSelectedLead(null);
      await loadLeads();
    } finally {
      setSaving(false);
    }
  };

  const exportLeads = () => {
    const csv = [
      ['Name', 'Email', 'Phone', 'Status', 'Signup Date', 'Last Contacted', 'Notes'].join(','),
      ...leads.map((lead) =>
        [
          lead.fullName,
          lead.email,
          lead.phone,
          lead.status,
          new Date(lead.signupDate).toLocaleDateString(),
          lead.lastContactedAt ? new Date(lead.lastContactedAt).toLocaleDateString() : '',
          `"${(lead.notes || '').replace(/"/g, '""')}"`,
        ].join(',')
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sales-leads-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (authLoading || (loading && leads.length === 0)) {
    return (
      <div className="flex min-h-screen lg:h-screen bg-[#F8FAFC]">
        <Sidebar activeItem="Leads" userType={UserRole.SALES_MANAGER} />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'sales_manager') {
    return null;
  }

  const openLeads = leads.filter((lead) => lead.status !== LeadStatus.SUBSCRIBED && lead.status !== LeadStatus.LOST);
  const converted = leads.filter((lead) => lead.status === LeadStatus.SUBSCRIBED).length;

  return (
    <div className="flex min-h-screen lg:h-screen bg-[#F8FAFC]">
      <Sidebar activeItem="Leads" userType={UserRole.SALES_MANAGER} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-5">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Student Leads</h1>
              <p className="text-slate-500 mt-1">Track CRM status, notes, and follow-ups.</p>
            </div>
            <button
              onClick={exportLeads}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium"
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Open leads</p>
                <p className="text-3xl font-black text-slate-900 mt-1">{openLeads.length}</p>
              </div>
              <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Converted</p>
                <p className="text-3xl font-black text-slate-900 mt-1">{converted}</p>
              </div>
            </div>

            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadLeads()}
                    placeholder="Search by name, email, or phone..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl text-sm border-none"
                  />
                </div>
                <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 rounded-xl">
                  <Filter size={16} className="text-slate-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as 'all' | LeadStatus)}
                    className="bg-transparent border-none text-sm font-bold text-slate-600 focus:ring-0"
                  >
                    <option value="all">All statuses</option>
                    {Object.values(LeadStatus).map((status) => (
                      <option key={status} value={status}>
                        {STATUS_LABELS[status]}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={loadLeads}
                  className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium"
                >
                  Apply
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">Lead</th>
                      <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">Contact</th>
                      <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">Signup</th>
                      <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                      <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {leads.map((lead) => (
                      <tr key={lead._id} className="hover:bg-slate-50/50">
                        <td className="px-8 py-5">
                          <div className="font-bold text-slate-900">{lead.fullName}</div>
                          <div className="text-sm text-slate-500">{lead.email}</div>
                        </td>
                        <td className="px-8 py-5 text-sm text-slate-600">
                          <div className="flex items-center gap-2"><Phone size={14} />{lead.phone || 'N/A'}</div>
                          <div className="flex items-center gap-2 mt-1"><Mail size={14} />{lead.email}</div>
                        </td>
                        <td className="px-8 py-5 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} />
                            {new Date(lead.signupDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`inline-flex px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${STATUS_COLORS[lead.status]}`}>
                            {STATUS_LABELS[lead.status]}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <button
                            onClick={() => openLeadEditor(lead)}
                            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary hover:underline"
                          >
                            <MessageSquare size={14} />
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {selectedLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[32px] max-w-lg w-full p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-1">{selectedLead.fullName}</h3>
            <p className="text-sm text-slate-500 mb-6">{selectedLead.email}</p>

            <label className="block text-sm font-medium text-slate-700 mb-2">CRM status</label>
            <select
              value={statusDraft}
              onChange={(e) => setStatusDraft(e.target.value as LeadStatus)}
              className="w-full mb-4 px-4 py-3 bg-slate-50 rounded-2xl border-none"
            >
              {Object.values(LeadStatus).map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>

            <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
            <textarea
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              rows={4}
              className="w-full mb-6 px-4 py-3 bg-slate-50 rounded-2xl border-none resize-none"
              placeholder="Follow-up notes..."
            />

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedLead(null)}
                className="flex-1 px-4 py-3 border border-slate-200 rounded-full"
              >
                Cancel
              </button>
              <button
                onClick={() => saveLead(true)}
                disabled={saving}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-800 rounded-full font-medium"
              >
                Mark contacted
              </button>
              <button
                onClick={() => saveLead(false)}
                disabled={saving}
                className="flex-1 px-4 py-3 bg-slate-900 text-white rounded-full font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
