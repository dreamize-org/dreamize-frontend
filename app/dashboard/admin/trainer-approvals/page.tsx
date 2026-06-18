'use client';

import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { UserRole, Trainer } from '@/types/user';
import { useAuth, useAdminContext } from '@/contexts';
import { adminService } from '@/services/admin';
import { Clock, X, Check, Mail, Calendar, Award, FileText, Eye, AlertCircle, ShieldCheck, Briefcase, Video, ExternalLink, ThumbsUp, ThumbsDown } from 'lucide-react';
import { PremiumButton } from '@/components/ui/premium-button';

export default function TrainerApprovalsPage() {
  const { user } = useAuth();
  const { pendingTrainers, trainersLoading, refreshTrainers } = useAdminContext();
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const handleApprove = async (trainerId: string) => {
    setActionLoading(true);
    try {
      await adminService.approveTrainer(trainerId, user?._id || 'admin');
      await refreshTrainers();
      setShowDetails(false);
      setSelectedTrainer(null);
    } catch (error) {
      console.error('Failed to approve trainer:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedTrainer || !rejectionReason.trim()) return;
    setActionLoading(true);
    try {
      await adminService.rejectTrainer(selectedTrainer._id, rejectionReason);
      await refreshTrainers();
      setShowRejectionModal(false);
      setShowDetails(false);
      setSelectedTrainer(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Failed to reject trainer:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const viewTrainerDetails = (trainer: Trainer) => {
    setSelectedTrainer(trainer);
    setShowDetails(true);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="flex min-h-screen lg:h-screen bg-[#FDF9F2]">
      <Sidebar activeItem="trainers" userType={UserRole.ADMIN} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[12px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Human Resources</span>
                <span className="text-slate-300">•</span>
                <span className="text-[12px] font-medium text-slate-400 italic">Faculty Vetting</span>
              </div>
              <h1 className="text-2xl font-playfair font-bold text-slate-900">Trainer Onboarding Queue</h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-2xl border border-primary/10">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-primary">{pendingTrainers.length} Applications Pending</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            
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
                  Faculty Vetting
                </span>
              </div>
            </div>

            {trainersLoading ? (
               <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-48 bg-white border border-slate-100 rounded-[24px] animate-pulse" />
                ))}
              </div>
            ) : pendingTrainers.length === 0 ? (
              <div className="text-center py-20 bg-white border border-slate-100 rounded-[24px] shadow-[0_20px_40px_rgba(0,0,0,0.06)]">
                <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck size={40} className="text-slate-200" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Queue is Clear</h3>
                <p className="text-slate-500 font-light">All trainer applications have been processed for today.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {pendingTrainers.map((trainer) => (
                  <div key={trainer._id} className="bg-white border border-slate-100 rounded-[24px] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_25px_45px_rgba(0,0,0,0.1)] hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />
                    
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 relative z-10">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                           <div className="w-12 h-12 bg-slate-900 rounded-[20px] flex items-center justify-center text-white text-lg font-black shadow-lg">
                              {trainer.firstName[0]}{trainer.lastName[0]}
                           </div>
                           <div>
                              <h3 className="text-[22px] font-playfair font-bold text-slate-900 group-hover:text-primary transition-colors">
                                {trainer.firstName} {trainer.lastName}
                              </h3>
                              <p className="text-slate-400 text-sm font-medium">{trainer.email}</p>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 mb-6">
                           <div className="flex items-center gap-3 text-[15px] text-slate-600 font-medium">
                              <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center"><Briefcase size={14} className="text-slate-400" /></div>
                              {trainer.experience.yearsOfExperience} Years Experience
                           </div>
                           <div className="flex items-center gap-3 text-[15px] text-slate-600 font-medium">
                              <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center"><Calendar size={14} className="text-slate-400" /></div>
                              Submitted {formatDate(trainer.createdAt)}
                           </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {trainer.experience.specializations.map((spec, index) => (
                            <span key={index} className="px-3 py-1 bg-slate-50 text-slate-500 rounded-full text-[11px] font-bold uppercase tracking-wider border border-slate-100 group-hover:border-primary/20 group-hover:text-primary transition-all">
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
                        <button
                          onClick={() => viewTrainerDetails(trainer)}
                          className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-[13px] hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 group/btn"
                        >
                          <Eye className="w-4 h-4 text-primary group-hover/btn:scale-110 transition-transform" />
                          Review Dossier
                        </button>
                        <div className="flex gap-2">
                           <button 
                             onClick={() => handleApprove(trainer._id)}
                             className="flex-1 p-3 bg-green-50 text-green-600 border border-green-100 rounded-2xl hover:bg-green-600 hover:text-white transition-all flex items-center justify-center"
                             title="Quick Approve"
                           >
                             <Check size={18} />
                           </button>
                           <button 
                             onClick={() => { setSelectedTrainer(trainer); setShowRejectionModal(true); }}
                             className="flex-1 p-3 bg-red-50 text-red-600 border border-red-100 rounded-2xl hover:bg-red-600 hover:text-white transition-all flex items-center justify-center"
                             title="Quick Reject"
                           >
                             <X size={18} />
                           </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-12 text-center">
               <p className="text-slate-400 text-[11px] font-bold tracking-[0.3em] uppercase italic">© Dreamize Africa 2025 • Faculty Enrollment Protocol</p>
            </div>
          </div>
        </main>
      </div>

      {/* Trainer Details Modal */}
      {showDetails && selectedTrainer && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-3xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full -mr-32 -mt-32" />
            
            <div className="p-10 relative z-10 flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Trainer Dossier Review</h2>
                  <p className="text-slate-500 font-light mt-1">Verification of pedagogical & professional standards</p>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="w-12 h-12 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="overflow-y-auto pr-2 flex-1 space-y-10">
                {/* Header Profile */}
                <div className="flex items-center gap-6">
                   <div className="w-24 h-24 bg-slate-900 rounded-[32px] flex items-center justify-center text-white text-3xl font-black shadow-2xl">
                      {selectedTrainer.firstName[0]}{selectedTrainer.lastName[0]}
                   </div>
                   <div>
                      <h3 className="text-3xl font-black text-slate-900">{selectedTrainer.firstName} {selectedTrainer.lastName}</h3>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                          <Mail size={14} className="text-primary" />
                          {selectedTrainer.email}
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                          <Calendar size={14} className="text-primary" />
                          Member since {formatDate(selectedTrainer.createdAt)}
                        </div>
                      </div>
                   </div>
                </div>

                {/* Professional Data */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                   <div className="bg-slate-50 rounded-[32px] p-6 border border-slate-100">
                      <div className="flex items-center gap-3 mb-4">
                         <Award className="text-primary" size={20} />
                         <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[13px]">Pedagogical Background</h4>
                      </div>
                      <div className="space-y-4">
                         <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Specializations</p>
                            <div className="flex flex-wrap gap-2">
                              {selectedTrainer.experience.specializations.map((spec: string, i: number) => (
                                <span key={i} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700">{spec}</span>
                              ))}
                            </div>
                         </div>
                         <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Experience Quota</p>
                            <p className="text-lg font-black text-slate-900">{selectedTrainer.experience.yearsOfExperience} Professional Years</p>
                         </div>
                      </div>
                   </div>

                   <div className="bg-slate-50 rounded-[32px] p-6 border border-slate-100">
                      <div className="flex items-center gap-3 mb-4">
                         <ShieldCheck className="text-primary" size={20} />
                         <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[13px]">Technical Proficiencies</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedTrainer.skills.map((skill: string, i: number) => (
                          <span key={i} className="px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold">{skill}</span>
                        ))}
                      </div>
                   </div>
                </div>

                {/* Verification Documents */}
                <div className="space-y-4">
                   <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[13px] ml-1">Documentation & Media</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedTrainer.introVideoUrl && (
                        <a href={selectedTrainer.introVideoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl hover:border-primary/20 transition-all group/link">
                           <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover/link:bg-primary transition-colors">
                              <Video className="text-primary group-hover/link:text-white transition-colors" size={20} />
                           </div>
                           <div className="flex-1">
                              <p className="text-sm font-bold text-slate-900">Pedagogical Intro</p>
                              <p className="text-xs text-slate-400 font-medium">Video Submission</p>
                           </div>
                           <ExternalLink size={16} className="text-slate-300 group-hover/link:text-primary transition-colors" />
                        </a>
                      )}
                      {selectedTrainer.cvUrl && (
                        <a href={selectedTrainer.cvUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl hover:border-primary/20 transition-all group/link">
                           <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover/link:bg-primary transition-colors">
                              <FileText className="text-primary group-hover/link:text-white transition-colors" size={20} />
                           </div>
                           <div className="flex-1">
                              <p className="text-sm font-bold text-slate-900">Curriculum Vitae</p>
                              <p className="text-xs text-slate-400 font-medium">Professional Profile</p>
                           </div>
                           <ExternalLink size={16} className="text-slate-300 group-hover/link:text-primary transition-colors" />
                        </a>
                      )}
                   </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="flex items-center gap-4 mt-10 pt-8 border-t border-slate-100 relative">
                <div className="flex-1">
                   <PremiumButton
                    onClick={() => handleApprove(selectedTrainer._id)}
                    isLoading={actionLoading}
                    className="w-full !py-4"
                  >
                    <div className="flex items-center justify-center gap-2">
                       <ThumbsUp size={18} />
                       Approve & Provision Access
                    </div>
                  </PremiumButton>
                </div>
                <button
                  onClick={() => setShowRejectionModal(true)}
                  disabled={actionLoading}
                  className="px-10 py-4 bg-red-50 text-red-600 rounded-[20px] font-bold text-sm hover:bg-red-600 hover:text-white transition-all flex items-center gap-2"
                >
                  <ThumbsDown size={18} />
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[110]">
          <div className="bg-white rounded-[40px] max-w-md w-full shadow-2xl p-10 relative overflow-hidden">
             <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-black text-slate-900">Decline Application</h3>
                  <button
                    onClick={() => setShowRejectionModal(false)}
                    className="w-8 h-8 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-xl transition-all"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <div className="mb-8">
                  <div className="flex items-center gap-2 text-red-500 mb-4 bg-red-50 p-3 rounded-xl border border-red-100">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-xs font-bold uppercase tracking-wider italic">Vetting feedback required</p>
                  </div>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-[14px] font-medium focus:bg-white focus:border-red-200 focus:ring-0 transition-all outline-none appearance-none resize-none"
                    rows={4}
                    placeholder="Describe why this profile does not meet Dreamize standards..."
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleReject}
                    disabled={!rejectionReason.trim() || actionLoading}
                    className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold text-sm hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-600/10"
                  >
                    {actionLoading ? 'Processing...' : 'Confirm Rejection'}
                  </button>
                  <button
                    onClick={() => { setShowRejectionModal(false); setRejectionReason(''); }}
                    className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
