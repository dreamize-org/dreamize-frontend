'use client';

import { useCallback, useEffect, useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { UserRole } from '@/types';
import { adminService } from '@/services/admin';
import { certificateService, type CertificateRecord } from '@/services/certificates';
import { Award, Download, Loader2, Search } from 'lucide-react';

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

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    loadCertificates(searchQuery.trim() || undefined);
  };

  return (
    <div className="flex min-h-screen lg:h-screen bg-[#F8FAFC]">
      <Sidebar activeItem="Certificates" userType={UserRole.ADMIN} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-slate-100 px-8 py-5">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Certificates</h1>
                <p className="text-slate-500 mt-1">Search and download certificates issued across the platform.</p>
              </div>
            </div>

            <form onSubmit={handleSearch} className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student, milestone, or certificate no."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 border-none"
              />
            </form>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="bg-white rounded-[32px] border border-slate-100 p-12 text-center text-slate-500">
                {error}
              </div>
            ) : certificates.length === 0 ? (
              <div className="bg-white rounded-[32px] border border-slate-100 p-12 text-center text-slate-500">
                No certificates found.
              </div>
            ) : (
              <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/80">
                    <tr>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        Certificate
                      </th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        Student
                      </th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        Milestone
                      </th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        Trainer
                      </th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        Completed
                      </th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {certificates.map((certificate) => (
                      <tr key={certificate._id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 font-mono text-sm text-slate-700">
                          {certificate.certificateNumber}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-900">{certificate.studentName}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{certificate.milestoneName}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{certificate.trainerName}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(certificate.completionDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() =>
                              certificateService.downloadCertificate(
                                certificate._id,
                                certificate.certificateNumber
                              )
                            }
                            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary hover:underline"
                          >
                            <Download className="w-4 h-4" />
                            PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
