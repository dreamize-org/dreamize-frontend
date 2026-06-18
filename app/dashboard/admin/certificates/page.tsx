'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AdminEmptyState,
  AdminFooter,
  AdminHeader,
  AdminLoadingState,
  AdminMain,
  AdminPanel,
  AdminSectionBadge,
  AdminShell,
  AdminStatCard,
} from '@/components/admin/AdminLayout';
import { adminService } from '@/services/admin';
import { certificateService, type CertificateRecord } from '@/services/certificates';
import { Award, Download, Search, ScrollText, Users, Calendar } from 'lucide-react';

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCertificates = useCallback(async (search?: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await adminService.getCertificates(search);
      if (response.success && response.data) {
        setCertificates(response.data);
      } else {
        setCertificates([]);
        setError('Unable to load certificates.');
      }
    } catch {
      setCertificates([]);
      setError('Unable to load certificates.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCertificates();
  }, [loadCertificates]);

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = certificates.filter((cert) => {
      const date = new Date(cert.completionDate);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;
    const uniqueStudents = new Set(certificates.map((cert) => cert.student)).size;
    const roadmapCompletions = certificates.filter(
      (cert) => cert.milestoneId === 'roadmap-completion'
    ).length;

    return { total: certificates.length, thisMonth, uniqueStudents, roadmapCompletions };
  }, [certificates]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    loadCertificates(searchQuery.trim() || undefined);
  };

  return (
    <AdminShell activeItem="certificates">
      <AdminHeader
        badge="Credentials"
        subtitle="Issued Certificates"
        title="Certificate Registry"
        actions={
          <form onSubmit={handleSearch} className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student, milestone, or cert no."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 border-none"
            />
          </form>
        }
      />

      <AdminMain>
        <AdminSectionBadge label="Credential Vault" />

        {!loading && !error && certificates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <AdminStatCard
              label="Total Issued"
              value={stats.total}
              icon={ScrollText}
              iconClassName="text-amber-500"
              iconBgClassName="bg-amber-50"
            />
            <AdminStatCard
              label="This Month"
              value={stats.thisMonth}
              icon={Calendar}
              iconClassName="text-primary"
              iconBgClassName="bg-primary/10"
            />
            <AdminStatCard
              label="Unique Students"
              value={stats.uniqueStudents}
              icon={Users}
              iconClassName="text-blue-500"
              iconBgClassName="bg-blue-50"
            />
            <AdminStatCard
              label="Roadmap Completions"
              value={stats.roadmapCompletions}
              icon={Award}
              iconClassName="text-green-500"
              iconBgClassName="bg-green-50"
            />
          </div>
        )}

        <AdminPanel
          title="Issued Certificates"
          description="Search and download credentials earned by students"
        >
          {loading ? (
            <AdminLoadingState label="Loading certificate registry..." />
          ) : error ? (
            <div className="p-12 text-center text-slate-500">{error}</div>
          ) : certificates.length === 0 ? (
            <AdminEmptyState
              icon={Award}
              title="No certificates yet"
              description="Certificates appear here automatically when trainers approve milestones or students complete roadmaps."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    {['Certificate', 'Student', 'Milestone', 'Trainer', 'Completed', 'Actions'].map(
                      (heading) => (
                        <th
                          key={heading}
                          className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 text-[11px] font-bold uppercase tracking-widest text-slate-400"
                        >
                          {heading}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {certificates.map((certificate) => (
                    <tr key={certificate._id} className="group hover:bg-slate-50/50 transition-all duration-300">
                      <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                            <Award className="w-4 h-4 text-amber-600" />
                          </div>
                          <span className="font-mono text-sm font-bold text-slate-900">
                            {certificate.certificateNumber}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
                        <p className="text-sm font-semibold text-slate-900">{certificate.studentName}</p>
                      </td>
                      <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
                        <span className="inline-flex px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                          {certificate.milestoneName}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 text-sm text-slate-600">
                        {certificate.trainerName}
                      </td>
                      <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 text-sm text-slate-600">
                        {new Date(certificate.completionDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
                        <button
                          onClick={() =>
                            certificateService.downloadCertificate(
                              certificate._id,
                              certificate.certificateNumber
                            )
                          }
                          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[11px] font-bold uppercase tracking-wider hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
                        >
                          <Download className="w-3.5 h-3.5" />
                          PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AdminPanel>

        <AdminFooter label="© Dreamize Africa 2025 • Credential Protocol" />
      </AdminMain>
    </AdminShell>
  );
}
