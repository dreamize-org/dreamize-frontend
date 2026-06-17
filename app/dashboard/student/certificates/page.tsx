'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigationWithLoading } from '@/lib/utils/navigation';
import { UserRole } from '@/types';
import { certificateService } from '@/services/certificates';
import type { CertificateRecord } from '@/services/certificates';
import { BASE_URL } from '@/services/constants';
import { API_ENDPOINTS } from '@/services/constants';
import {
  Award,
  CreditCard,
  Download,
  Calendar,
  CheckCircle,
  FileText,
  Loader2,
} from 'lucide-react';

const Sidebar = dynamic(() => import('@/components/dashboard/Sidebar'), { ssr: false });

async function openCertificateView(certificateId: string) {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${BASE_URL}${API_ENDPOINTS.CERTIFICATE_VIEW(certificateId)}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    throw new Error('Unable to open certificate');
  }

  const html = await response.text();
  const blob = new Blob([html], { type: 'text/html' });
  const blobUrl = URL.createObjectURL(blob);
  window.open(blobUrl, '_blank', 'noopener,noreferrer');
}

export default function CertificatesPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { navigate } = useNavigationWithLoading();
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openingId, setOpeningId] = useState<string | null>(null);

  const hasActiveSubscription = Boolean(
    user && 'hasActiveSubscription' in user && user.hasActiveSubscription
  );

  const loadCertificates = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await certificateService.getMyCertificates();
      if (response.success && response.data) {
        setCertificates(response.data);
      } else {
        setCertificates([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load certificates');
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || user?.role !== UserRole.STUDENT) {
      navigate('/auth/login');
      return;
    }

    loadCertificates();
  }, [authLoading, isAuthenticated, user?.role, loadCertificates, navigate]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FDF9F2]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.role !== UserRole.STUDENT) {
    return null;
  }

  const showSubscriptionUpsell = !hasActiveSubscription && certificates.length === 0;

  if (showSubscriptionUpsell) {
    return (
      <div className="flex min-h-screen lg:h-screen bg-[#FDF9F2]">
        <Sidebar activeItem="Certificates" userType={UserRole.STUDENT} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-8">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-playfair font-semibold text-slate-900">My Certificates</h1>
                <p className="text-slate-500 font-light mt-1">Download your milestone completion certificates</p>
              </div>
              <div className="bg-white rounded-[40px] border border-slate-100 p-12 text-center">
                <h2 className="text-xl font-playfair font-semibold text-slate-900 mb-2">Certificates Locked</h2>
                <p className="text-slate-500 font-light mb-6 max-w-md mx-auto">
                  Complete milestones with an active subscription to earn downloadable certificates.
                </p>
                <button
                  onClick={() => navigate('/dashboard/student/pay/subscription')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors"
                >
                  <CreditCard className="w-5 h-5" />
                  Subscribe to Unlock
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen lg:h-screen bg-[#FDF9F2]">
      <Sidebar activeItem="Certificates" userType={UserRole.STUDENT} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-playfair font-semibold text-slate-900">My Certificates</h1>
                <p className="text-slate-500 font-light mt-1">Milestone completion certificates and achievements</p>
              </div>
              <span className="text-sm text-slate-500">
                {certificates.length} certificate{certificates.length !== 1 ? 's' : ''}
              </span>
            </div>

            {error && (
              <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {certificates.length === 0 ? (
              <div className="bg-white rounded-[40px] border border-slate-100 p-12 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-playfair font-semibold text-slate-900 mb-2">No Certificates Yet</h2>
                <p className="text-slate-500 font-light mb-6 max-w-md mx-auto">
                  Complete milestones and get them approved by your trainer to earn certificates.
                </p>
                <button
                  onClick={() => navigate('/dashboard/student/roadmap')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors"
                >
                  <CheckCircle className="w-5 h-5" />
                  Go to Roadmap
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {certificates.map((cert) => (
                  <div
                    key={cert._id}
                    className="bg-white rounded-[32px] border border-slate-100 overflow-hidden hover:shadow-xl transition-all"
                  >
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white">
                      <div className="flex items-center justify-center mb-4">
                        <Award className="w-12 h-12" />
                      </div>
                      <h3 className="text-lg font-playfair font-semibold text-center mb-1">
                        Certificate of Completion
                      </h3>
                      <p className="text-white/80 text-sm text-center">{cert.milestoneName}</p>
                    </div>

                    <div className="p-6">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <FileText className="w-4 h-4 text-slate-400 mt-1" />
                          <div>
                            <p className="text-xs text-slate-500">Certificate ID</p>
                            <p className="text-sm font-medium text-slate-900">{cert.certificateNumber}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Calendar className="w-4 h-4 text-slate-400 mt-1" />
                          <div>
                            <p className="text-xs text-slate-500">Completed On</p>
                            <p className="text-sm font-medium text-slate-900">
                              {new Date(cert.completionDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Award className="w-4 h-4 text-slate-400 mt-1" />
                          <div>
                            <p className="text-xs text-slate-500">Verified By</p>
                            <p className="text-sm font-medium text-slate-900">{cert.trainerName}</p>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={async () => {
                          setOpeningId(cert._id);
                          try {
                            await openCertificateView(cert._id);
                          } catch (err) {
                            setError(err instanceof Error ? err.message : 'Failed to open certificate');
                          } finally {
                            setOpeningId(null);
                          }
                        }}
                        disabled={openingId === cert._id}
                        className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors disabled:opacity-60"
                      >
                        {openingId === cert._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        View / Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
