'use client';

import { useMemo } from 'react';
import {
  X, Phone, Calendar, GraduationCap, CheckCircle, XCircle, AlertCircle,
  Clock, MapPin, BookOpen, Wallet, Zap, Shield, Target
} from 'lucide-react';
import { Student, Roadmap } from '@/types';
import { RoadmapStepStatus } from '@/types/roadmap';

interface StudentDetailModalProps {
  student: Student;
  roadmap: Roadmap | undefined;
  onClose: () => void;
}

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

const StatusBadge = ({ isActive, isVerified }: { isActive: boolean; isVerified: boolean }) => {
  if (!isActive) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-lg text-[11px] font-bold bg-red-500/10 text-red-500 uppercase tracking-widest border border-red-500/20">
        <XCircle className="w-3.5 h-3.5 mr-1.5" />
        Inactive
      </span>
    );
  }
  if (!isVerified) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-lg text-[11px] font-bold bg-orange-500/10 text-orange-500 uppercase tracking-widest border border-orange-500/20">
        <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
        Pending
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-lg text-[11px] font-bold bg-green-500/10 text-green-500 uppercase tracking-widest border border-green-500/20">
      <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
      Active
    </span>
  );
};

export default function StudentDetailModal({ student, roadmap, onClose }: StudentDetailModalProps) {
  // Calculate progress from roadmap milestones
  const progress = useMemo(() => {
    if (!roadmap || !roadmap.milestones || roadmap.milestones.length === 0) return 0;
    const completed = roadmap.milestones.filter(m => m.status === RoadmapStepStatus.COMPLETED).length;
    return Math.round((completed / roadmap.milestones.length) * 100);
  }, [roadmap]);

  // Calculate active/pending milestones
  const milestoneStats = useMemo(() => {
    if (!roadmap || !roadmap.milestones) return { completed: 0, active: 0, pending: 0, total: 0 };
    return {
      completed: roadmap.milestones.filter(m => m.status === RoadmapStepStatus.COMPLETED).length,
      active: roadmap.milestones.filter(m => m.status === RoadmapStepStatus.ACTIVE).length,
      pending: roadmap.milestones.filter(m => m.status === RoadmapStepStatus.PENDING_APPROVAL).length,
      total: roadmap.milestones.length
    };
  }, [roadmap]);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col scale-in-center animate-in zoom-in-95 duration-300">
        
        {/* Header - Premium Dossier Style */}
        <div className="relative bg-slate-900 p-8 shrink-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[60px] rounded-full -mr-32 -mt-32" />
          
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-white rounded-[24px] flex items-center justify-center text-slate-900 font-black text-3xl shadow-xl shadow-black/20 transform -rotate-3 hover:rotate-0 transition-transform">
                {getInitials(student.firstName, student.lastName)}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold bg-primary/20 text-primary uppercase tracking-widest">
                    <GraduationCap className="w-3 h-3 mr-1.5" /> Mentee Dossier
                  </span>
                  <StatusBadge isActive={student.isActive} isVerified={student.isVerified} />
                </div>
                <h2 className="text-3xl font-black text-white">{student.firstName} {student.lastName}</h2>
                <p className="text-slate-400 font-medium text-[15px] mt-1">{student.email}</p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             
             {/* Left Column: Core Info */}
             <div className="lg:col-span-1 space-y-8">
                
                {/* Contact Card */}
                <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100">
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-slate-300" /> Identity Data
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 group">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <Phone className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Phone Network</p>
                        <p className="text-[13px] font-bold text-slate-900">{student.phoneNumber || 'Classified'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 group">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <MapPin className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Demographics</p>
                        <p className="text-[13px] font-bold text-slate-900 capitalize">{student.gender || 'Undisclosed'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 group">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <Calendar className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Induction Date</p>
                        <p className="text-[13px] font-bold text-slate-900">
                          {new Date(student.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subscription Card */}
                <div className="bg-slate-900 rounded-[32px] p-6 shadow-xl shadow-slate-900/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[30px] rounded-full -mr-16 -mt-16" />
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2 relative z-10">
                    <Wallet className="w-4 h-4 text-primary" /> Clearance Level
                  </h3>
                  
                  <div className="space-y-4 relative z-10">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-bold text-slate-300">Active Subscription</span>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                        student.hasActiveSubscription ? 'bg-primary text-slate-900' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {student.hasActiveSubscription ? 'Verified' : 'Lapsed'}
                      </span>
                    </div>

                    <div className="h-px bg-slate-800 w-full" />

                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-bold text-slate-300">Orientation Fee</span>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                        student.hasPaidOrientation ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {student.hasPaidOrientation ? 'Cleared' : 'Pending'}
                      </span>
                    </div>

                    {student.subscriptionExpiryDate && (
                      <>
                        <div className="h-px bg-slate-800 w-full" />
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] font-bold text-slate-300">Expiry Vector</span>
                          <span className="text-[12px] font-black text-primary">
                            {new Date(student.subscriptionExpiryDate).toLocaleDateString()}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

             </div>

             {/* Right Column: Academic Progress & Architecture */}
             <div className="lg:col-span-2 space-y-8">
                
                {/* Roadmap Architecture */}
                {roadmap ? (
                  <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-8">
                       <h3 className="text-[15px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                         <Target className="w-5 h-5 text-primary" />
                         Learning Architecture
                       </h3>
                       <span className="px-3 py-1 bg-slate-50 rounded-lg text-[11px] font-bold text-slate-500 uppercase tracking-widest border border-slate-200">
                         {roadmap.title}
                       </span>
                    </div>
                    
                    {/* Progress Visual */}
                    <div className="mb-10 bg-slate-50 rounded-[24px] p-6 border border-slate-100">
                      <div className="flex items-end justify-between mb-3">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Global Completion</span>
                        <span className="text-4xl font-black text-slate-900">{progress}<span className="text-xl text-slate-400">%</span></span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                          style={{ width: `${progress}%` }}
                        >
                           <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]" />
                        </div>
                      </div>
                    </div>

                    {/* Milestone Matrix */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                      <div className="bg-slate-50 rounded-[20px] p-4 text-center border border-slate-100">
                        <p className="text-3xl font-black text-green-500 mb-1">{milestoneStats.completed}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cleared</p>
                      </div>
                      <div className="bg-slate-50 rounded-[20px] p-4 text-center border border-slate-100">
                        <p className="text-3xl font-black text-primary mb-1">{milestoneStats.active}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active</p>
                      </div>
                      <div className="bg-slate-50 rounded-[20px] p-4 text-center border border-slate-100">
                        <p className="text-3xl font-black text-orange-500 mb-1">{milestoneStats.pending}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Review</p>
                      </div>
                      <div className="bg-slate-50 rounded-[20px] p-4 text-center border border-slate-100">
                        <p className="text-3xl font-black text-slate-900 mb-1">{milestoneStats.total}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</p>
                      </div>
                    </div>

                    {/* Trajectory Log */}
                    {roadmap.milestones && roadmap.milestones.length > 0 && (
                      <div>
                        <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                           <Clock className="w-3.5 h-3.5 text-slate-400" /> Recent Trajectory
                        </p>
                        <div className="space-y-3">
                          {roadmap.milestones.slice(0, 4).map((milestone, index) => (
                            <div key={index} className="flex items-center justify-between bg-slate-50 rounded-xl p-3 border border-slate-100 hover:border-slate-300 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${
                                  milestone.status === RoadmapStepStatus.COMPLETED ? 'bg-green-500 shadow-green-500/50' :
                                  milestone.status === RoadmapStepStatus.ACTIVE ? 'bg-primary shadow-primary/50' :
                                  milestone.status === RoadmapStepStatus.PENDING_APPROVAL ? 'bg-orange-500 shadow-orange-500/50' :
                                  'bg-slate-300'
                                }`} />
                                <span className="text-[13px] font-bold text-slate-700">{milestone.title}</span>
                              </div>
                              <span className={`text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-widest ${
                                milestone.status === RoadmapStepStatus.COMPLETED ? 'bg-green-100 text-green-700' :
                                milestone.status === RoadmapStepStatus.ACTIVE ? 'bg-primary/10 text-primary' :
                                milestone.status === RoadmapStepStatus.PENDING_APPROVAL ? 'bg-orange-100 text-orange-700' :
                                'bg-slate-200 text-slate-600'
                              }`}>
                                {milestone.status.replace('-', ' ')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] p-12 text-center">
                     <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <BookOpen className="w-8 h-8 text-slate-300" />
                     </div>
                     <h3 className="text-lg font-black text-slate-900 mb-2">No Architecture Assigned</h3>
                     <p className="text-[13px] font-medium text-slate-500">This mentee has not been assigned a learning roadmap yet.</p>
                  </div>
                )}

                {/* Onboarding Telemetry */}
                {student.onboardingStatus && (
                  <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
                    <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-orange-500" />
                      Onboarding Telemetry
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.entries(student.onboardingStatus).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                            value ? 'bg-green-500 text-white shadow-md shadow-green-500/20' : 'bg-slate-200 text-slate-400'
                          }`}>
                            {value ? <CheckCircle className="w-4 h-4" /> : <div className="w-2 h-2 bg-slate-400 rounded-full" />}
                          </div>
                          <span className={`text-[12px] font-bold tracking-wide uppercase ${value ? 'text-slate-900' : 'text-slate-400'}`}>
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

             </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-white border-t border-slate-100 p-6 flex items-center justify-between shrink-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
             <Shield className="w-3 h-3" /> Encrypted Dossier
          </p>
          <div className="flex gap-3">
             <button
               onClick={onClose}
               className="px-8 py-3.5 bg-slate-100 text-slate-700 rounded-2xl font-black text-[13px] uppercase tracking-widest hover:bg-slate-200 transition-colors"
             >
               Close Viewer
             </button>
          </div>
        </div>

      </div>
    </div>
  );
}
