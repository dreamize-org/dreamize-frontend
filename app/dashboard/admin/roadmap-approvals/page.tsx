'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { UserRole } from '@/types/user';
import { Roadmap, RoadmapStepStatus } from '@/types/roadmap';
import { useAuth } from '@/contexts';
import { adminService } from '@/services/admin';
import { MapPin, Clock, X, Calendar, Award, AlertCircle, Compass, Target, ChevronRight, GraduationCap, ThumbsUp, ThumbsDown } from 'lucide-react';
import { PremiumButton } from '@/components/ui/premium-button';

export default function RoadmapApprovalsPage() {
  const { user } = useAuth();
  const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'active'>('pending');
  
  const loadRoadmaps = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getRoadmaps();
      setRoadmaps(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load roadmaps');
      setRoadmaps([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoadmaps();
  },[]);

  const pendingRoadmaps = roadmaps.filter((roadmap) => roadmap.status === 'pending-approval');
  const approvedRoadmaps = roadmaps.filter((roadmap) => roadmap.status === 'approved');
  const activeRoadmaps = roadmaps.filter((roadmap) => roadmap.status === 'active');

  const visibleRoadmaps =
    activeTab === 'pending'
      ? pendingRoadmaps
      : activeTab === 'approved'
        ? approvedRoadmaps
        : activeRoadmaps;

  const getMilestoneStatusLabel = (status: RoadmapStepStatus) => {
    switch (status) {
      case RoadmapStepStatus.ACTIVE:
        return 'Active';
      case RoadmapStepStatus.COMPLETED:
        return 'Completed';
      case RoadmapStepStatus.PENDING_APPROVAL:
        return 'Pending review';
      default:
        return 'Locked';
    }
  };

  const refreshSelectedRoadmap = async (roadmapId: string) => {
    const response = await adminService.getRoadmaps();
    const latest = response.data?.find((roadmap) => roadmap.id === roadmapId);
    if (latest) {
      setSelectedRoadmap(latest);
    }
    setRoadmaps(response.data || []);
  };

  const handleApprove = async (roadmapId: string) => {
    setActionLoading(true);
    setActionError(null);
    try {
      await adminService.approveRoadmap(roadmapId, user?._id || 'admin');
      await loadRoadmaps();
      setShowDetails(false);
      setSelectedRoadmap(null);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Failed to approve roadmap.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivate = async (roadmapId: string) => {
    setActionLoading(true);
    setActionError(null);
    try {
      await adminService.activateRoadmap(roadmapId);
      await loadRoadmaps();
      if (selectedRoadmap?.id === roadmapId) {
        await refreshSelectedRoadmap(roadmapId);
      }
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Failed to activate roadmap.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMilestoneToggle = async (roadmapId: string, milestoneOrder: number, locked: boolean) => {
    setActionLoading(true);
    setActionError(null);
    try {
      await adminService.setMilestoneLockState(roadmapId, milestoneOrder, locked);
      await refreshSelectedRoadmap(roadmapId);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Failed to update milestone.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRoadmap || !rejectionReason.trim()) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await adminService.rejectRoadmap(selectedRoadmap.id, rejectionReason);
      await loadRoadmaps();
      setShowRejectionModal(false);
      setShowDetails(false);
      setSelectedRoadmap(null);
      setRejectionReason('');
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Failed to reject roadmap.');
    } finally {
      setActionLoading(false);
    }
  };

  const viewRoadmapDetails = (roadmap: Roadmap) => {
    setSelectedRoadmap(roadmap);
    setActionError(null);
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
      <Sidebar activeItem="roadmaps" userType={UserRole.ADMIN} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[12px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Curriculum Oversight</span>
                <span className="text-slate-300">•</span>
                <span className="text-[12px] font-medium text-slate-400 italic">Pedagogical Review</span>
              </div>
              <h1 className="text-2xl font-playfair font-bold text-slate-900">Roadmap Approval Queue</h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-2xl border border-indigo-100">
                <Compass className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-bold text-indigo-600">{pendingRoadmaps.length} Pending</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex bg-slate-100 p-1.5 rounded-2xl overflow-x-auto mb-8 w-fit max-w-full">
              {[
                { id: 'pending' as const, label: 'Pending Review', count: pendingRoadmaps.length },
                { id: 'approved' as const, label: 'Approved (Needs Launch)', count: approvedRoadmaps.length },
                { id: 'active' as const, label: 'Active Roadmaps', count: activeRoadmaps.length },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {tab.label}
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                        isActive ? 'bg-primary/10 text-primary' : 'bg-slate-200'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
            
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
                  Pedagogical Review
                </span>
              </div>
            </div>

            {actionError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-[20px] flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-sm text-red-700 font-medium">{actionError}</p>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-[20px] flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-80 bg-white border border-slate-100 rounded-[24px] animate-pulse" />
                ))}
              </div>
            ) : visibleRoadmaps.length === 0 ? (
              <div className="text-center py-20 bg-white border border-slate-100 rounded-[24px] shadow-[0_20px_40px_rgba(0,0,0,0.06)]">
                <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-6">
                  <Target size={40} className="text-slate-200" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {activeTab === 'pending' ? 'Curriculum Clear' : 'Nothing here yet'}
                </h3>
                <p className="text-slate-500 font-light">
                  {activeTab === 'pending'
                    ? 'All submitted learning paths have been audited.'
                    : activeTab === 'approved'
                      ? 'No roadmaps waiting to be launched.'
                      : 'No active student roadmaps yet.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleRoadmaps.map((roadmap) => (
                  <div key={roadmap.id} className="bg-white border border-slate-100 rounded-[24px] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_25px_45px_rgba(0,0,0,0.1)] hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 group flex flex-col">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <MapPin size={20} />
                      </div>
                      <div>
                         <h3 className="text-[22px] font-playfair font-bold text-slate-900 line-clamp-1 group-hover:text-primary transition-colors">{roadmap.title}</h3>
                         <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">ID: {roadmap.id.slice(-6)}</p>
                      </div>
                    </div>

                    <div className="space-y-4 mb-6 flex-1">
                       <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100/50">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                             <GraduationCap size={14} className="text-primary" /> Recipient
                          </div>
                          <p className="text-[15px] font-playfair font-bold text-slate-900">{roadmap.student.firstName} {roadmap.student.lastName}</p>
                       </div>

                       <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100/50">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                             <Award size={14} className="text-primary" /> Architect
                          </div>
                          <p className="text-[15px] font-playfair font-bold text-slate-900">{roadmap.trainer.firstName} {roadmap.trainer.lastName}</p>
                       </div>
                    </div>

                    <div className="flex items-center justify-between py-4 border-t border-slate-50">
                       <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                          <Clock size={12} />
                          {roadmap.milestones.length} Milestones
                       </div>
                       <button 
                         onClick={() => viewRoadmapDetails(roadmap)}
                         className="flex items-center gap-1 text-[11px] font-black text-primary uppercase tracking-widest hover:gap-2 transition-all"
                       >
                         Full Dossier <ChevronRight size={14} />
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-12 text-center">
               <p className="text-slate-400 text-[11px] font-bold tracking-[0.3em] uppercase italic">© Dreamize Africa 2025 • Learning Path Vetting Protocol</p>
            </div>
          </div>
        </main>
      </div>

      {/* Roadmap Details Modal */}
      {showDetails && selectedRoadmap && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-4xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full -mr-32 -mt-32" />
            
            <div className="p-10 relative z-10 flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                   <div className="w-16 h-16 bg-slate-900 rounded-[20px] flex items-center justify-center text-primary shadow-2xl">
                      <Compass size={32} />
                   </div>
                   <div>
                      <h2 className="text-2xl font-black text-slate-900">{selectedRoadmap.title}</h2>
                      <p className="text-slate-500 font-light mt-1 italic">Vetting learning sequence architectural integrity</p>
                   </div>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="w-12 h-12 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="overflow-y-auto pr-4 flex-1 space-y-8">
                 {/* Metadata Bar */}
                 <div className="grid grid-cols-4 gap-4">
                    {[
                      { label: 'Student', val: `${selectedRoadmap.student.firstName} ${selectedRoadmap.student.lastName}`, icon: GraduationCap },
                      { label: 'Trainer', val: `${selectedRoadmap.trainer.firstName} ${selectedRoadmap.trainer.lastName}`, icon: Award },
                      { label: 'Created', val: formatDate(selectedRoadmap.createdAt), icon: Calendar },
                      { label: 'Status', val: selectedRoadmap.status.replace('-', ' '), icon: Target },
                    ].map((item, i) => (
                      <div key={i} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                         <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                            <item.icon size={12} className="text-primary" /> {item.label}
                         </div>
                         <p className="text-[13px] font-black text-slate-900 truncate">{item.val}</p>
                      </div>
                    ))}
                 </div>

                 {/* Milestones Visualization */}
                 <div className="space-y-4">
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[13px] ml-1">Curriculum Milestones</h4>
                    <div className="space-y-4">
                      {selectedRoadmap.milestones.map((milestone, index) => (
                        <div key={index} className="bg-white border border-slate-100 rounded-[24px] p-6 hover:shadow-lg transition-all group">
                          <div className="flex items-start justify-between mb-4 gap-3">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white text-xs font-black">
                                  {index + 1}
                               </div>
                               <div>
                                 <h5 className="font-black text-slate-900 group-hover:text-primary transition-colors">{milestone.title}</h5>
                                 <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                                   {getMilestoneStatusLabel(milestone.status)}
                                 </span>
                               </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-md">
                                {milestone.estimatedDurationDays} Days Est.
                              </span>
                              {selectedRoadmap.status === 'active' && milestone.status === RoadmapStepStatus.LOCKED && (
                                <button
                                  type="button"
                                  onClick={() => handleMilestoneToggle(selectedRoadmap.id, milestone.order, false)}
                                  disabled={actionLoading}
                                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50"
                                >
                                  Enable Milestone
                                </button>
                              )}
                              {selectedRoadmap.status === 'active' && milestone.status === RoadmapStepStatus.ACTIVE && (
                                <button
                                  type="button"
                                  onClick={() => handleMilestoneToggle(selectedRoadmap.id, milestone.order, true)}
                                  disabled={actionLoading}
                                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50"
                                >
                                  Lock Milestone
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-slate-500 font-light mb-4 leading-relaxed">{milestone.description}</p>
                          
                          <div className="flex flex-wrap gap-2">
                             {milestone.skillsToLearn.map((skill, si) => (
                               <span key={si} className="px-2.5 py-1 bg-primary/5 text-primary rounded-lg text-[10px] font-bold uppercase tracking-wider border border-primary/10">
                                 {skill}
                               </span>
                             ))}
                          </div>
                        </div>
                      ))}
                    </div>
                 </div>
              </div>

              {/* Action Footer */}
              <div className="flex items-center gap-4 mt-10 pt-8 border-t border-slate-100">
                {selectedRoadmap.status === 'pending-approval' && (
                  <>
                    <div className="flex-1">
                      <PremiumButton
                        onClick={() => handleApprove(selectedRoadmap.id)}
                        isLoading={actionLoading}
                        className="w-full !py-4"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <ThumbsUp size={18} />
                          Approve & Launch Roadmap
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
                  </>
                )}

                {selectedRoadmap.status === 'approved' && (
                  <div className="flex-1">
                    <PremiumButton
                      onClick={() => handleActivate(selectedRoadmap.id)}
                      isLoading={actionLoading}
                      className="w-full !py-4"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Target size={18} />
                        Launch Roadmap & Enable First Milestone
                      </div>
                    </PremiumButton>
                  </div>
                )}

                {selectedRoadmap.status === 'active' && (
                  <div className="flex-1 space-y-3">
                    <p className="text-sm text-slate-600">
                      Use <strong>Enable Milestone</strong> on locked steps below. Only one milestone should be active at a time unless the previous one is completed.
                    </p>
                    <PremiumButton
                      onClick={() => handleActivate(selectedRoadmap.id)}
                      isLoading={actionLoading}
                      className="w-full !py-4"
                    >
                      Enable Next Locked Milestone
                    </PremiumButton>
                  </div>
                )}
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
                  <h3 className="text-2xl font-black text-slate-900">Decline Roadmap</h3>
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
                    placeholder="Describe architectural flaws or pedagogical missing pieces..."
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
