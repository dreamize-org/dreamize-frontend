'use client';

import { useMemo, useState, useEffect } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { useRoadmaps } from '@/contexts/RoadmapContext';
import { UserRole, Student, Roadmap, RoadmapStepStatus } from '@/types';
import { useRequireRole } from '@/hooks/useRequireRole';
import { guardianService } from '@/services/guardian';
import { certificateService } from '@/services/certificates';
import type { CertificateRecord } from '@/services/certificates';
import {
  Users,
  Map,
  CheckCircle,
  Clock,
  Award,
  Wallet,
  ChevronRight,
  AlertCircle,
  UserCircle,
  GraduationCap,
  Folder,
  ShieldCheck,
  Search,
  Zap,
  Lock
} from 'lucide-react';

interface StudentWithDetails extends Student {
  roadmap?: Roadmap;
  progress?: number;
}

interface GuardianProject {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  category: string;
  trainerFeedback?: string;
  approvedAt?: string;
}

function getRecordKey(item: { id?: string; _id?: string }, fallback: string): string {
  return item.id ?? item._id ?? fallback;
}

export default function GuardianDashboard() {
  const { user, isAuthorized, authLoading } = useRequireRole(UserRole.GUARDIAN);
  const { studentRoadmaps } = useRoadmaps();
  const roadmapSignature = useMemo(
    () =>
      studentRoadmaps
        .map((roadmap) => `${roadmap.id}:${roadmap.updatedAt ?? roadmap.createdAt ?? ''}`)
        .join('|'),
    [studentRoadmaps]
  );
  
  const [students, setStudents] = useState<StudentWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentWithDetails | null>(null);
  const [studentCertificates, setStudentCertificates] = useState<CertificateRecord[]>([]);
  const [studentProjects, setStudentProjects] = useState<GuardianProject[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  // Fetch linked students
  useEffect(() => {
    if (!isAuthorized) return;

    const fetchStudents = async () => {
      try {
        const response = await guardianService.getLinkedStudents();
        if (response.success && response.data) {
          const enrichedStudents = response.data.map(student => {
            const roadmap = studentRoadmaps.find(r => r.student._id === student._id);
            const milestones = roadmap?.milestones || [];
            const completedMilestones = milestones.filter(m => m.status === RoadmapStepStatus.COMPLETED).length;
            const progress = milestones.length > 0 ? Math.round((completedMilestones / milestones.length) * 100) : 0;
            
            return {
              ...student,
              roadmap,
              progress
            };
          });
          setStudents(enrichedStudents);
          if (enrichedStudents.length > 0) {
            setSelectedStudent(enrichedStudents[0]);
          }
        } else {
          setError(response.message || 'Failed to load students');
        }
      } catch {
        setError('An error occurred while loading students');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [isAuthorized, roadmapSignature]);

  useEffect(() => {
    if (!selectedStudent?._id) {
      setStudentCertificates([]);
      setStudentProjects([]);
      return;
    }

    const loadStudentDetails = async () => {
      setDetailLoading(true);
      try {
        const [certificatesRes, projectsRes] = await Promise.all([
          guardianService.getStudentCertificates(selectedStudent._id),
          guardianService.getStudentProjects(selectedStudent._id),
        ]);

        if (certificatesRes.success && certificatesRes.data) {
          setStudentCertificates(certificatesRes.data as CertificateRecord[]);
        } else {
          setStudentCertificates([]);
        }

        if (projectsRes.success && projectsRes.data) {
          setStudentProjects(projectsRes.data as GuardianProject[]);
        } else {
          setStudentProjects([]);
        }
      } catch {
        setStudentCertificates([]);
        setStudentProjects([]);
      } finally {
        setDetailLoading(false);
      }
    };

    loadStudentDetails();
  }, [selectedStudent?._id]);

  if (authLoading || isLoading || !isAuthorized) {
    return (
      <div className="flex min-h-screen lg:h-screen bg-[#FDF9F2]">
        <Sidebar activeItem="Dashboard" userType={UserRole.GUARDIAN} />
        <div className="flex-1 flex flex-col">
          <div className="h-20 bg-white border-b border-slate-100 animate-pulse"></div>
          <div className="flex-1 p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-400 font-medium">Synchronizing Student Data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getSubscriptionStatus = (student: StudentWithDetails) => {
    if (!student.hasActiveSubscription) {
      return { label: 'Inactive', color: 'text-red-500', bg: 'bg-red-500/10' };
    }
    if (student.subscriptionExpiryDate) {
      const daysLeft = Math.ceil((new Date(student.subscriptionExpiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 6) return { label: `${daysLeft} days left`, color: 'text-red-500', bg: 'bg-red-500/10' };
      if (daysLeft <= 19) return { label: `${daysLeft} days left`, color: 'text-orange-500', bg: 'bg-orange-500/10' };
      return { label: 'Active', color: 'text-green-500', bg: 'bg-green-500/10' };
    }
    return { label: 'Active', color: 'text-green-500', bg: 'bg-green-500/10' };
  };

  const getMilestoneStatusIcon = (status: RoadmapStepStatus) => {
    switch (status) {
      case RoadmapStepStatus.COMPLETED:
        return <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center"><CheckCircle className="w-4 h-4 text-green-500" /></div>;
      case RoadmapStepStatus.PENDING_APPROVAL:
        return <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center"><Clock className="w-4 h-4 text-orange-500" /></div>;
      case RoadmapStepStatus.ACTIVE:
        return <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center"><Zap className="w-4 h-4 text-blue-500" /></div>;
      default:
        return <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center"><Lock className="w-4 h-4 text-slate-400" /></div>;
    }
  };

  return (
    <div className="flex min-h-screen lg:h-screen bg-[#FDF9F2]">
      <Sidebar activeItem="Dashboard" userType={UserRole.GUARDIAN} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[12px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Guardian Portal</span>
                <span className="text-slate-300">•</span>
                <span className="text-[12px] font-medium text-slate-400 italic">Account Overview</span>
              </div>
              <h1 className="text-2xl font-playfair font-bold text-slate-900">
                Welcome, {user?.firstName || 'Guardian'}
              </h1>
            </div>

            <div className="flex items-center gap-2">
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder="Search students..." 
                    className="pl-10 pr-4 py-2 bg-slate-50 border-2 border-slate-50 rounded-xl text-sm focus:bg-white focus:border-primary/20 focus:ring-0 outline-none transition-all w-full sm:w-64"
                  />
               </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            
            {error && (
              <div className="mb-8 flex items-center gap-3 text-red-600 bg-red-50 p-4 rounded-full border border-red-100">
                <AlertCircle size={20} />
                <span className="font-medium text-sm">{error}</span>
              </div>
            )}

            {students.length === 0 ? (
              <div className="bg-white rounded-[32px] p-12 text-center border border-slate-100 shadow-sm">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-slate-300" />
                </div>
                <h2 className="text-xl font-playfair font-bold text-slate-900 mb-2">No Students Linked</h2>
                <p className="text-slate-500 max-w-sm mx-auto font-light leading-relaxed text-sm">
                  Your guardian account is ready, but no students are linked yet. Students can add your email during their registration.
                </p>
                <button className="mt-6 px-6 py-3 bg-slate-900 text-white rounded-full font-bold text-sm hover:bg-slate-800 transition-all">
                   How it works
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Sidebar: Student List */}
                <div className="lg:col-span-4 space-y-4">
                  <h3 className="text-[13px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-4">Monitored Students ({students.length})</h3>
                  {students.map((student) => (
                    <button
                      key={student._id}
                      onClick={() => setSelectedStudent(student)}
                      className={`w-full p-4 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden group ${
                        selectedStudent?._id === student._id
                        ? 'bg-slate-900 border-slate-800 shadow-xl shadow-slate-900/10'
                        : 'bg-white border-slate-100 hover:border-primary/20'
                      }`}
                    >
                      <div className="flex items-center gap-3 relative z-10">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                          selectedStudent?._id === student._id ? 'bg-primary/20 text-primary' : 'bg-slate-50 text-slate-400'
                        }`}>
                          <UserCircle size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-bold truncate text-sm ${selectedStudent?._id === student._id ? 'text-white' : 'text-slate-900'}`}>
                            {student.firstName} {student.lastName}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                              selectedStudent?._id === student._id ? 'bg-white/10 text-primary' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {student.progress}% Progress
                            </span>
                          </div>
                        </div>
                        <ChevronRight className={`w-5 h-5 transition-transform ${
                          selectedStudent?._id === student._id ? 'text-primary' : 'text-slate-300'
                        }`} />
                      </div>
                    </button>
                  ))}

                  <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10 mt-8">
                     <ShieldCheck className="text-primary w-8 h-8 mb-3" />
                     <h4 className="text-slate-900 font-bold text-sm">Security Notice</h4>
                     <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                        Your account has view-only access for privacy. Contact support for identity verification updates.
                     </p>
                  </div>
                </div>

                {/* Right Content: Student Details */}
                {selectedStudent && (
                  <div className="lg:col-span-8 space-y-6">
                    
                    {/* Student Profile Card */}
                    <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                         <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-primary/10 rounded-[20px] flex items-center justify-center text-primary border border-primary/20 relative">
                               <GraduationCap size={24} />
                               <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full border-4 border-[#FDF9F2] flex items-center justify-center">
                                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                               </div>
                            </div>
                            <div>
                               <h2 className="text-xl font-black text-slate-900">{selectedStudent.firstName} {selectedStudent.lastName}</h2>
                               <p className="text-slate-500 font-medium text-sm">{selectedStudent.email}</p>
                            </div>
                         </div>
                         <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${getSubscriptionStatus(selectedStudent).bg} ${getSubscriptionStatus(selectedStudent).color}`}>
                            <div className={`w-2 h-2 rounded-full ${getSubscriptionStatus(selectedStudent).color.replace('text', 'bg')}`} />
                            Subscription {getSubscriptionStatus(selectedStudent).label}
                         </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { label: 'Progress', value: `${selectedStudent.progress}%`, icon: Map, color: 'text-blue-500', bg: 'bg-blue-50' },
                          { label: 'Milestones', value: `${selectedStudent.roadmap?.milestones?.filter(m => m.status === RoadmapStepStatus.COMPLETED).length || 0}/${selectedStudent.roadmap?.milestones?.length || 0}`, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
                          { label: 'Certificates', value: selectedStudent.roadmap?.milestones?.filter(m => m.status === RoadmapStepStatus.COMPLETED).length || 0, icon: Award, color: 'text-purple-500', bg: 'bg-purple-50' },
                          { label: 'Projects', value: selectedStudent.roadmap?.milestones?.reduce((count, m) => count + (m.completedProjectIds?.length || 0), 0) || 0, icon: Folder, color: 'text-primary', bg: 'bg-primary/5' },
                        ].map((stat) => (
                          <div key={stat.label} className={`${stat.bg} rounded-3xl p-5 border border-black/5`}>
                             <div className="flex items-center gap-2 mb-3">
                                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                             </div>
                             <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Timeline View */}
                    <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                       <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2">
                          <Map size={24} className="text-primary" />
                          Learning Roadmap: {selectedStudent.roadmap?.title || 'Processing...'}
                       </h3>

                       {selectedStudent.roadmap ? (
                         <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-px before:bg-slate-100">
                            {selectedStudent.roadmap.milestones.map((milestone) => (
                              <div key={milestone.order} className="flex gap-6 relative z-10">
                                 <div className="mt-1">
                                    {getMilestoneStatusIcon(milestone.status)}
                                 </div>
                                 <div className="flex-1 pb-6 border-b border-slate-50 last:border-none">
                                    <div className="flex items-center justify-between gap-4 mb-1">
                                       <h4 className="font-bold text-slate-900">{milestone.title}</h4>
                                       <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                          milestone.status === RoadmapStepStatus.COMPLETED ? 'bg-green-50 text-green-600' :
                                          milestone.status === RoadmapStepStatus.PENDING_APPROVAL ? 'bg-orange-50 text-orange-600' :
                                          milestone.status === RoadmapStepStatus.ACTIVE ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'
                                       }`}>
                                          {milestone.status.replace('-', ' ')}
                                       </span>
                                    </div>
                                    <p className="text-sm text-slate-500 font-light leading-relaxed">{milestone.description}</p>
                                    
                                    {milestone.trainerFeedback && (
                                      <div className="mt-3 p-3 bg-slate-50 rounded-2xl border-l-4 border-primary italic text-[13px] text-slate-600">
                                         &quot;{milestone.trainerFeedback}&quot;
                                      </div>
                                    )}
                                 </div>
                              </div>
                            ))}
                         </div>
                       ) : (
                         <div className="py-12 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                               <Clock className="text-slate-200" />
                            </div>
                            <p className="text-slate-400 italic">No roadmap generated yet.</p>
                         </div>
                       )}
                    </div>

                    {/* Certificates */}
                    <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                      <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Award size={24} className="text-primary" />
                        Certificates
                      </h3>
                      {detailLoading ? (
                        <p className="text-slate-400 italic">Loading certificates...</p>
                      ) : studentCertificates.length === 0 ? (
                        <p className="text-slate-400 italic">No certificates earned yet.</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {studentCertificates.map((certificate, index) => (
                            <div
                              key={getRecordKey(certificate, `certificate-${index}`)}
                              className="p-5 bg-slate-50 rounded-2xl border border-slate-100"
                            >
                              <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">
                                {certificate.certificateNumber}
                              </p>
                              <h4 className="font-bold text-slate-900">{certificate.milestoneName}</h4>
                              <p className="text-sm text-slate-500 mt-1">
                                {new Date(certificate.completionDate).toLocaleDateString()}
                              </p>
                              <button
                                onClick={() =>
                                  certificateService.downloadCertificate(
                                    getRecordKey(certificate, certificate.certificateNumber),
                                    certificate.certificateNumber
                                  )
                                }
                                className="mt-4 text-xs font-bold uppercase tracking-widest text-primary hover:underline"
                              >
                                Download PDF
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Approved Projects */}
                    <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                      <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Folder size={24} className="text-primary" />
                        Approved Projects
                      </h3>
                      {detailLoading ? (
                        <p className="text-slate-400 italic">Loading projects...</p>
                      ) : studentProjects.length === 0 ? (
                        <p className="text-slate-400 italic">No approved projects yet.</p>
                      ) : (
                        <div className="space-y-4">
                          {studentProjects.map((project, index) => (
                            <div
                              key={getRecordKey(project, `project-${index}`)}
                              className="p-5 bg-slate-50 rounded-2xl border border-slate-100"
                            >
                              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                                {project.category}
                              </p>
                              <h4 className="font-bold text-slate-900">{project.title}</h4>
                              <p className="text-sm text-slate-600 mt-2">{project.description}</p>
                              {project.trainerFeedback && (
                                <p className="mt-3 text-sm text-slate-500 italic border-l-4 border-primary pl-3">
                                  &quot;{project.trainerFeedback}&quot;
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Subscription & Finance Card */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="bg-slate-900 rounded-[32px] p-8 border border-slate-800 shadow-xl relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
                          <h4 className="text-white font-bold mb-6 flex items-center gap-2">
                             <Wallet className="text-primary w-5 h-5" />
                             Payment Status
                          </h4>
                          
                          <div className="space-y-5">
                             <div className="flex items-center justify-between">
                                <span className="text-slate-400 text-sm font-light">Orientation Fee</span>
                                <span className={`text-xs font-bold px-2 py-1 rounded-lg uppercase tracking-wider ${selectedStudent.hasPaidOrientation ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                   {selectedStudent.hasPaidOrientation ? 'PAID' : 'PENDING'}
                                </span>
                             </div>
                             <div className="flex items-center justify-between">
                                <span className="text-slate-400 text-sm font-light">Current Plan</span>
                                <span className="text-white text-sm font-bold">Standard Mentorship</span>
                             </div>
                             {selectedStudent.subscriptionExpiryDate && (
                                <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
                                   <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Expires On</span>
                                   <span className="text-primary text-sm font-black">{new Date(selectedStudent.subscriptionExpiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                </div>
                             )}
                          </div>
                       </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-16 text-center">
               <p className="text-slate-300 text-[11px] font-bold tracking-[0.2em] uppercase italic">Dreamize Africa • Guardian Supervision Protocol v2.5</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
