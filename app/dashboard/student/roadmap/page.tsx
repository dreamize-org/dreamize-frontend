'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { useAuth, useRoadmaps } from '@/contexts';
import { useNavigationWithLoading } from '@/lib/utils/navigation';
import { Milestone, UserRole, RoadmapStepStatus, Roadmap, RoadmapStatus } from '@/types';
import { Map, Clock, CheckCircle, Lock, PlayCircle, PauseCircle, XCircle, Target, BookOpen, ChevronRight, X, Link2, FileText, Image as ImageIcon, FilePlus, ExternalLink, Youtube, Figma, Github, Code, Briefcase, Layers, Plus, Trash2 } from 'lucide-react';

export default function StudentRoadmapPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { studentRoadmaps, isLoading: roadmapsLoading, refreshRoadmaps } = useRoadmaps();
  const { navigate } = useNavigationWithLoading();

  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);

  const [completingMilestone, setCompletingMilestone] = useState(false);
  const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');

  // Redirect if not authenticated or not a student
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth/login');
      return;
    }

    if (!authLoading && user && user.role !== 'student') {
      const dashboardRoutes: Record<string, string> = {
        'trainer': '/dashboard/trainer',
        'admin': '/dashboard/admin'
      };
      navigate(dashboardRoutes[user.role] || '/');
    }
  }, [authLoading, isAuthenticated, user]);

  if (authLoading || roadmapsLoading) {
    return (
      <div className="flex min-h-screen lg:h-screen bg-white">
        <div className="w-64 bg-gray-900 animate-pulse"></div>
        <div className="flex-1 p-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'student') {
    return null;
  }

  const getMilestoneStatusColor = (status: RoadmapStepStatus) => {
    switch (status) {
      case RoadmapStepStatus.COMPLETED:
        return 'bg-green-100 text-green-700 border-green-200';
      case RoadmapStepStatus.ACTIVE:
        return 'bg-primary/10 text-primary border-primary/20';
      case RoadmapStepStatus.PENDING_APPROVAL:
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case RoadmapStepStatus.LOCKED:
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getRoadmapStatusIcon = (status: RoadmapStatus) => {
    switch (status) {
      case 'active':
        return <PlayCircle className="w-5 h-5 text-green-600" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'paused':
        return <PauseCircle className="w-5 h-5 text-yellow-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending-approval':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <Lock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getRoadmapStatusColor = (status: RoadmapStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'completed':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'paused':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'rejected':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'pending-approval':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const calculateRoadmapProgress = (roadmap: Roadmap) => {
    if (!roadmap.milestones || roadmap.milestones.length === 0) return 0;
    const completed = roadmap.milestones.filter(m => m.status === RoadmapStepStatus.COMPLETED).length;
    return Math.round((completed / roadmap.milestones.length) * 100);
  };

  const handleRoadmapClick = (roadmap: Roadmap) => {
    setSelectedRoadmap(roadmap);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setSelectedRoadmap(null);
    setViewMode('list');
  };



  const handleCompleteMilestone = async (milestone: Milestone, _index: number) => {
    setSelectedMilestone(milestone);
    setShowProjectModal(true);
  };


  return (
    <div className="flex min-h-screen lg:h-screen bg-[#FDF9F2]">
      <Sidebar activeItem="Roadmap" userType={UserRole.STUDENT} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-8">
          {viewMode === 'list' ? (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-playfair font-semibold text-slate-900">My Learning Roadmaps</h1>
                <p className="text-slate-500 font-light mt-1">View all your learning journeys and their progress</p>
              </div>

              {studentRoadmaps && studentRoadmaps.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {studentRoadmaps.map((roadmap) => {
                    const progress = calculateRoadmapProgress(roadmap);
                    const completedMilestones = roadmap.milestones?.filter(m => m.status === RoadmapStepStatus.COMPLETED).length || 0;
                    const totalMilestones = roadmap.milestones?.length || 0;
                    const totalDays = roadmap.milestones?.reduce((sum, m) => sum + m.estimatedDurationDays, 0) || 0;

                    return (
                      <div
                        key={roadmap.id}
                        onClick={() => handleRoadmapClick(roadmap)}
                        className="bg-white border border-slate-100 rounded-[32px] p-6 hover:shadow-xl hover:border-primary/20 transition-all cursor-pointer group"
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className={`p-3 rounded-xl ${getRoadmapStatusColor(roadmap.status)}`}>
                            <Map className="w-6 h-6" />
                          </div>
                          <div className="flex items-center gap-2">
                            {getRoadmapStatusIcon(roadmap.status)}
                            <span className="text-sm font-medium capitalize text-slate-600">{roadmap.status.replace('-', ' ')}</span>
                          </div>
                        </div>

                        {/* Title & Description */}
                        <h3 className="text-lg font-playfair font-semibold text-slate-900 mb-2 group-hover:text-primary transition-colors">
                          {roadmap.title}
                        </h3>
                        <p className="text-sm text-slate-500 font-light mb-4 line-clamp-2">
                          Click to view full roadmap details and milestones
                        </p>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-600">Progress</span>
                            <span className="font-medium text-slate-900">{progress}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-slate-50 rounded-xl p-2">
                            <div className="text-lg font-playfair font-semibold text-slate-900">{totalMilestones}</div>
                            <div className="text-xs text-slate-500">Milestones</div>
                          </div>
                          <div className="bg-slate-50 rounded-xl p-2">
                            <div className="text-lg font-playfair font-semibold text-green-600">{completedMilestones}</div>
                            <div className="text-xs text-slate-500">Completed</div>
                          </div>
                          <div className="bg-slate-50 rounded-xl p-2">
                            <div className="text-lg font-playfair font-semibold text-slate-900">{totalDays}</div>
                            <div className="text-xs text-slate-500">Days</div>
                          </div>
                        </div>

                        {/* View Details Link */}
                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-primary">
                          <span className="text-sm font-medium">View Details</span>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Map className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-playfair font-semibold text-slate-900 mb-2">No Roadmaps Yet</h3>
                  <p className="text-slate-500 font-light mb-4">Tell your trainer to create your learning roadmap to get started</p>
                </div>
              )}
            </>
          ) : selectedRoadmap && (
            <>
              {/* Header with Back Button */}
              <div className="mb-8">
                <button
                  onClick={handleBackToList}
                  className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-4 group"
                >
                  <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                  Back to Roadmaps
                </button>
              </div>

              {/* Hero Section */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[40px] p-8 mb-8 text-white shadow-xl">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm border border-white/30`}>
                        {selectedRoadmap.status.replace('-', ' ').charAt(0).toUpperCase() + selectedRoadmap.status.slice(1).replace('-', ' ')}
                      </span>
                      <span className="text-sm text-white/80">
                        {selectedRoadmap.milestones?.length || 0} milestones
                      </span>
                    </div>
                    <h1 className="text-3xl font-playfair font-semibold mb-2">{selectedRoadmap.title}</h1>
                    <p className="text-white/90 text-lg font-light">Your personalized learning journey</p>
                  </div>
                  {selectedRoadmap.status === 'active' && (
                    <button className="px-6 py-3 bg-white text-slate-900 rounded-full font-semibold hover:bg-white/90 transition-colors shadow-lg">
                      Continue Learning
                    </button>
                  )}
                </div>

                {/* Progress Bar in Hero */}
                <div className="mt-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/80">Overall Progress</span>
                    <span className="font-semibold">{calculateRoadmapProgress(selectedRoadmap)}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3">
                    <div
                      className="bg-white h-3 rounded-full transition-all duration-500 shadow-sm"
                      style={{ width: `${calculateRoadmapProgress(selectedRoadmap)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-[32px] p-4 border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-playfair font-semibold text-slate-900">
                        {selectedRoadmap.milestones?.filter(m => m.status === RoadmapStepStatus.COMPLETED).length || 0}
                      </div>
                      <div className="text-xs text-slate-500">Completed</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-[32px] p-4 border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <PlayCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-playfair font-semibold text-slate-900">
                        {selectedRoadmap.milestones?.filter(m => m.status === RoadmapStepStatus.ACTIVE).length || 0}
                      </div>
                      <div className="text-xs text-slate-500">Active</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-[32px] p-4 border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                      <Lock className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                      <div className="text-2xl font-playfair font-semibold text-slate-900">
                        {selectedRoadmap.milestones?.filter(m => m.status === RoadmapStepStatus.LOCKED).length || 0}
                      </div>
                      <div className="text-xs text-slate-500">Locked</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-[32px] p-4 border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <Clock className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-playfair font-semibold text-slate-900">
                        {selectedRoadmap.milestones?.reduce((sum, m) => sum + m.estimatedDurationDays, 0) || 0}
                      </div>
                      <div className="text-xs text-slate-500">Total Days</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline Milestones */}
              <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6">
                <h2 className="text-xl font-playfair font-semibold text-slate-900 mb-6 flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Learning Milestones
                </h2>
                <div className="space-y-0">
                  {selectedRoadmap.milestones?.map((milestone, index) => {
                    const isLast = index === (selectedRoadmap.milestones?.length || 0) - 1;
                    const isActive = milestone.status === RoadmapStepStatus.ACTIVE;
                    const isCompleted = milestone.status === RoadmapStepStatus.COMPLETED;
                    const isPending = milestone.status === RoadmapStepStatus.PENDING_APPROVAL;

                    return (
                      <div key={index} className="relative flex gap-4">
                        {/* Timeline Line */}
                        {!isLast && (
                          <div className="absolute left-5 top-12 w-0.5 h-full bg-slate-200"
                            style={{
                              background: isCompleted ? 'linear-gradient(to bottom, #22c55e, #e5e7eb)' :
                                isActive ? 'linear-gradient(to bottom, #3b82f6, #e5e7eb)' : '#e5e7eb'
                            }}
                          />
                        )}

                        {/* Status Icon */}
                        <div className="relative z-10 flex-shrink-0">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${isCompleted ? 'bg-green-500 border-green-100' :
                            isActive ? 'bg-primary border-primary/20' :
                              isPending ? 'bg-yellow-500 border-yellow-100' :
                                'bg-slate-300 border-slate-100'
                            }`}>
                            {isCompleted ? (
                              <CheckCircle className="w-5 h-5 text-white" />
                            ) : isActive ? (
                              <PlayCircle className="w-5 h-5 text-white" />
                            ) : isPending ? (
                              <Clock className="w-5 h-5 text-white" />
                            ) : (
                              <Lock className="w-4 h-4 text-white" />
                            )}
                          </div>
                        </div>

                        {/* Content Card */}
                        <div className={`flex-1 pb-8 ${isLast ? '' : ''}`}>
                          <div className={`rounded-[32px] p-5 border transition-all ${isActive ? 'bg-primary/5 border-primary/20 shadow-md' :
                            isCompleted ? 'bg-green-50/30 border-green-100' :
                              isPending ? 'bg-yellow-50/30 border-yellow-100' :
                                'bg-slate-50 border-slate-100'
                            }`}>
                            {/* Header Row */}
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                  <h3 className="font-playfair font-semibold text-slate-900 text-lg">{milestone.title}</h3>
                                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getMilestoneStatusColor(milestone.status)}`}>
                                    {milestone.status.replace('-', ' ').charAt(0).toUpperCase() + milestone.status.slice(1).replace('-', ' ')}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-slate-500">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {milestone.estimatedDurationDays} days
                                  </span>
                                  {milestone.completedAt && (
                                    <span className="flex items-center gap-1 text-green-600">
                                      <CheckCircle className="w-4 h-4" />
                                      {new Date(milestone.completedAt).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Action Button */}
                              {isActive && (
                                <button
                                  onClick={() => handleCompleteMilestone(milestone, index)}
                                  className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-full hover:bg-slate-800 transition-colors shadow-sm"
                                >
                                  Complete
                                </button>
                              )}
                              {isPending && (
                                <span className="px-3 py-2 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full">
                                  Awaiting Approval
                                </span>
                              )}
                            </div>

                            {/* Description */}
                            <p className="text-slate-600 font-light mb-4 leading-relaxed">{milestone.description}</p>

                            {/* Two Column Layout for Skills & Tasks */}
                            <div className="grid md:grid-cols-2 gap-4">
                              {/* Skills */}
                              {milestone.skillsToLearn && milestone.skillsToLearn.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-primary" />
                                    Skills to Learn
                                  </h4>
                                  <div className="flex flex-wrap gap-1.5">
                                    {milestone.skillsToLearn.map((skill, i) => (
                                      <span key={i} className="px-2.5 py-1 bg-primary/10 text-primary rounded-xl text-xs font-medium border border-primary/20">
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Tasks */}
                              {milestone.tasks && milestone.tasks.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                    <Target className="w-4 h-4 text-primary" />
                                    Tasks
                                  </h4>
                                  <ul className="space-y-1">
                                    {milestone.tasks.slice(0, 3).map((task, i) => (
                                      <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1 flex-shrink-0" />
                                        <span className="line-clamp-1">{task}</span>
                                      </li>
                                    ))}
                                    {milestone.tasks.length > 3 && (
                                      <li className="text-xs text-slate-400 pl-3.5">
                                        +{milestone.tasks.length - 3} more tasks
                                      </li>
                                    )}
                                  </ul>
                                </div>
                              )}
                            </div>

                            {/* Projects - Full Width */}
                            {milestone.requiredProjects && milestone.requiredProjects.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-slate-100">
                                <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                  <Target className="w-4 h-4 text-primary" />
                                  Required Projects
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {milestone.requiredProjects.map((project, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-primary/10 text-primary rounded-xl text-xs font-medium border border-primary/20">
                                      {project}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Trainer Feedback */}
                            {milestone.trainerFeedback && (
                              <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-xl">
                                <div className="flex items-start gap-2">
                                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-bold text-primary">TR</span>
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-semibold text-slate-900">Trainer Feedback</h4>
                                    <p className="text-sm text-slate-700 mt-0.5">{milestone.trainerFeedback}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}


