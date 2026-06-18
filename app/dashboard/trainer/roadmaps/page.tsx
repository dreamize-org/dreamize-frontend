'use client';

import { useState } from 'react';
import { useRouter } from '@/hooks/useRouter';
import Sidebar from '@/components/dashboard/Sidebar';
import { useAuth, useRoadmaps, useUsers } from '@/contexts';
import { getAuthUserId } from '@/lib/auth/session';
import { getRoadmapStudentId, getRoadmapTrainerId } from '@/lib/roadmap/access';
import { roadmapService } from '@/services/roadmap';
import { projectService } from '@/services/project';
import { Roadmap, Milestone, RoadmapStepStatus, RoadmapStatus } from '@/types/roadmap';
import { Project, ProjectStatus } from '@/types/project';
import { UserRole } from '@/types';
import { 
  Map, Clock, CheckCircle, Lock, PlayCircle, PauseCircle, XCircle, 
  Target, ChevronRight, Search, Filter,
  User, CheckSquare, Folder, MessageSquare,
  ThumbsUp, ThumbsDown, AlertCircle, Plus, X, Award,
  Link2, FileText, Image as ImageIcon, FilePlus, ExternalLink, 
  Youtube, Figma, Github, Eye, Wrench, ChevronLeft
} from 'lucide-react';
import Image from 'next/image';

export default function TrainerRoadmapsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { students } = useUsers();
  const { roadmaps, refreshRoadmaps } = useRoadmaps();
  
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<RoadmapStatus | 'all'>('all');
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [trainerFeedback, setTrainerFeedback] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionError, setActionError] = useState('');
  const [milestoneProjects, setMilestoneProjects] = useState<Project[]>([]);
  const [loadingMilestoneProjects, setLoadingMilestoneProjects] = useState(false);
  const [viewingProjectDetail, setViewingProjectDetail] = useState<Project | null>(null);

  // Filter roadmaps for current trainer
  const trainerRoadmaps = roadmaps.filter(
    (roadmap) => getRoadmapTrainerId(roadmap) === getAuthUserId(user)
  );

  // Apply filters
  const filteredRoadmaps = trainerRoadmaps.filter(roadmap => {
    const student = students.find((s) => s._id === getRoadmapStudentId(roadmap));
    const matchesSearch = 
      roadmap.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student?.lastName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || roadmap.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    total: trainerRoadmaps.length,
    active: trainerRoadmaps.filter(r => r.status === 'active').length,
    pending: trainerRoadmaps.filter(r => r.status === 'pending-approval').length,
    completed: trainerRoadmaps.filter(r => r.status === 'completed').length,
  };

  const getStatusIcon = (status: RoadmapStatus) => {
    switch (status) {
      case 'active': return <PlayCircle className="w-5 h-5 text-green-600" />;
      case 'completed': return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'paused': return <PauseCircle className="w-5 h-5 text-yellow-600" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending-approval': return <Clock className="w-5 h-5 text-yellow-600" />;
      default: return <Lock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: RoadmapStatus) => {
    switch (status) {
      case 'active': return 'bg-green-50 border-green-200 text-green-700';
      case 'completed': return 'bg-primary/10 border-primary/20 text-primary';
      case 'paused': return 'bg-slate-50 border-slate-200 text-slate-700';
      case 'rejected': return 'bg-red-50 border-red-200 text-red-700';
      case 'pending-approval': return 'bg-primary/10 border-primary/20 text-primary';
      default: return 'bg-slate-50 border-slate-200 text-slate-700';
    }
  };

  const getMilestoneStatusColor = (status: RoadmapStepStatus) => {
    switch (status) {
      case RoadmapStepStatus.COMPLETED: return 'bg-green-100 text-green-700 border-green-200';
      case RoadmapStepStatus.ACTIVE: return 'bg-primary/10 text-primary border-primary/20';
      case RoadmapStepStatus.PENDING_APPROVAL: return 'bg-primary/10 text-primary border-primary/20';
      case RoadmapStepStatus.LOCKED: return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getMilestoneStatusLabel = (status: RoadmapStepStatus) => {
    switch (status) {
      case RoadmapStepStatus.COMPLETED:
        return 'Completed';
      case RoadmapStepStatus.ACTIVE:
        return 'Active';
      case RoadmapStepStatus.PENDING_APPROVAL:
        return 'Pending review';
      case RoadmapStepStatus.LOCKED:
        return 'Locked';
      default:
        return status;
    }
  };

  const syncSelectedRoadmap = async (roadmapId: string) => {
    const latest = await roadmapService.getRoadmaps();
    const refreshed = latest?.find((roadmap) => roadmap.id === roadmapId);
    if (refreshed) {
      setSelectedRoadmap(refreshed);
    }
  };

  const calculateRoadmapProgress = (roadmap: Roadmap) => {
    if (!roadmap.milestones?.length) return 0;
    const completed = roadmap.milestones.filter(m => m.status === RoadmapStepStatus.COMPLETED).length;
    return Math.round((completed / roadmap.milestones.length) * 100);
  };

  const handleRoadmapClick = async (roadmap: Roadmap) => {
    setActionError('');
    setSelectedRoadmap(roadmap);
    setViewMode('detail');
    await syncSelectedRoadmap(roadmap.id);
  };

  const canManageMilestones = (roadmap: Roadmap) =>
    roadmap.status === 'active' || roadmap.status === 'approved';

  const handleEnableNextMilestone = async () => {
    if (!selectedRoadmap) return;

    const nextLocked = selectedRoadmap.milestones?.find(
      (milestone) => milestone.status === RoadmapStepStatus.LOCKED
    );
    if (!nextLocked) {
      setActionError('No locked milestones are available to enable.');
      return;
    }

    await handleMilestoneLockToggle(nextLocked, false);
  };

  const handleBackToList = () => {
    setSelectedRoadmap(null);
    setViewMode('list');
    setSelectedMilestone(null);
  };

  const loadMilestoneProjects = async (milestone: Milestone) => {
    if (!milestone.submittedProjectIds?.length) {
      setMilestoneProjects([]);
      return [];
    }

    setLoadingMilestoneProjects(true);
    try {
      const projects: Project[] = [];
      for (const projectId of milestone.submittedProjectIds) {
        const response = await projectService.getProjectData(projectId);
        if (response.data) {
          projects.push(response.data);
        }
      }
      setMilestoneProjects(projects);
      return projects;
    } catch {
      setMilestoneProjects([]);
      return [];
    } finally {
      setLoadingMilestoneProjects(false);
    }
  };

  const handleViewMilestoneDetails = async (milestone: Milestone) => {
    setSelectedMilestone(milestone);
    setTrainerFeedback(milestone.trainerFeedback || '');
    setActionError('');
    setViewingProjectDetail(null);
    await loadMilestoneProjects(milestone);
    setShowApprovalModal(true);
  };

  const handleApproveMilestone = async () => {
    if (!selectedRoadmap || !selectedMilestone) return;
    if (selectedMilestone.status !== RoadmapStepStatus.PENDING_APPROVAL) {
      setActionError('Only milestones awaiting review can be approved.');
      return;
    }

    setIsProcessing(true);
    setActionError('');
    try {
      await roadmapService.approveMilestone(selectedRoadmap.id, selectedMilestone.order, trainerFeedback);
      await refreshRoadmaps();
      await syncSelectedRoadmap(selectedRoadmap.id);
      setShowApprovalModal(false);
      setSelectedMilestone(null);
      setMilestoneProjects([]);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Failed to approve milestone.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectMilestone = async () => {
    if (!selectedRoadmap || !selectedMilestone || !trainerFeedback.trim()) return;
    if (selectedMilestone.status !== RoadmapStepStatus.PENDING_APPROVAL) {
      setActionError('Only milestones awaiting review can be rejected.');
      return;
    }

    setIsProcessing(true);
    setActionError('');
    try {
      await roadmapService.rejectMilestone(selectedRoadmap.id, selectedMilestone.order, trainerFeedback);
      await refreshRoadmaps();
      await syncSelectedRoadmap(selectedRoadmap.id);
      setShowApprovalModal(false);
      setSelectedMilestone(null);
      setMilestoneProjects([]);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Failed to reject milestone.');
    } finally {
      setIsProcessing(false);
    }
  };

  const allProjectsApproved = () => {
    const submittedCount = selectedMilestone?.submittedProjectIds?.length ?? 0;
    if (submittedCount === 0) {
      return false;
    }
    if (loadingMilestoneProjects || milestoneProjects.length === 0) {
      return false;
    }
    return milestoneProjects.every((project) => project.status === ProjectStatus.APPROVED);
  };

  const pendingProjectsCount = () =>
    milestoneProjects.filter((project) => project.status === ProjectStatus.PENDING_APPROVAL).length;

  const handleApproveProject = async (projectId: string, feedback?: string) => {
    setIsProcessing(true);
    setActionError('');
    try {
      await projectService.approveProject(projectId, feedback ?? trainerFeedback);
      if (selectedMilestone) {
        await loadMilestoneProjects(selectedMilestone);
      }
      if (selectedRoadmap) {
        await refreshRoadmaps();
        await syncSelectedRoadmap(selectedRoadmap.id);
        if (selectedMilestone) {
          const latest = await roadmapService.getRoadmaps();
          const refreshedRoadmap = latest?.find((roadmap) => roadmap.id === selectedRoadmap.id);
          const refreshedMilestone = refreshedRoadmap?.milestones?.find(
            (milestone) => milestone.order === selectedMilestone.order
          );
          if (refreshedMilestone?.status === RoadmapStepStatus.COMPLETED) {
            setShowApprovalModal(false);
            setSelectedMilestone(null);
            setMilestoneProjects([]);
          } else if (refreshedMilestone) {
            setSelectedMilestone(refreshedMilestone);
          }
        }
      }
      const updated = await projectService.getProjectData(projectId);
      if (updated.data && viewingProjectDetail?.id === projectId) {
        setViewingProjectDetail(updated.data);
      }
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Failed to approve project.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectProject = async (projectId: string, feedback?: string) => {
    const resolvedFeedback = (feedback ?? trainerFeedback).trim();
    if (!resolvedFeedback) {
      setActionError('Feedback is required when rejecting a project.');
      return;
    }

    setIsProcessing(true);
    setActionError('');
    const milestoneOrder = selectedMilestone?.order;
    try {
      await projectService.rejectProject(projectId, resolvedFeedback);
      if (selectedMilestone) {
        await loadMilestoneProjects(selectedMilestone);
      }
      if (selectedRoadmap && milestoneOrder != null) {
        await refreshRoadmaps();
        await syncSelectedRoadmap(selectedRoadmap.id);
        const latest = await roadmapService.getRoadmaps();
        const refreshedRoadmap = latest?.find((roadmap) => roadmap.id === selectedRoadmap.id);
        if (refreshedRoadmap) {
          setSelectedRoadmap(refreshedRoadmap);
          const refreshedMilestone = refreshedRoadmap.milestones?.find(
            (milestone) => milestone.order === milestoneOrder
          );
          if (refreshedMilestone) {
            setSelectedMilestone(refreshedMilestone);
          }
        }
      }
      const updated = await projectService.getProjectData(projectId);
      if (updated.data && viewingProjectDetail?.id === projectId) {
        setViewingProjectDetail(updated.data);
      }
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Failed to reject project.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMilestoneLockToggle = async (milestone: Milestone, locked: boolean) => {
    if (!selectedRoadmap) return;

    setIsProcessing(true);
    setActionError('');
    try {
      await roadmapService.setMilestoneLockState(selectedRoadmap.id, milestone.order, locked);
      await refreshRoadmaps();
      await syncSelectedRoadmap(selectedRoadmap.id);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Failed to update milestone availability.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex min-h-screen lg:h-screen bg-[#FDF9F2]">
      <Sidebar activeItem="Roadmaps" userType={UserRole.TRAINER} />

      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            {viewMode === 'list' ? (
              <>
                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <h1 className="text-3xl font-playfair font-semibold text-slate-900">Student Roadmaps</h1>
                    <p className="text-slate-500 font-light mt-1">View and manage all your assigned student roadmaps</p>
                  </div>
                  <button
                    onClick={() => router.push('/dashboard/trainer/roadmaps/create')}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
                  >
                    <Plus className="w-4 h-4" />
                    Create New Roadmap
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  {[
                    { label: 'Total', value: stats.total, icon: Map, color: 'text-primary', bg: 'bg-primary/10' },
                    { label: 'Active', value: stats.active, icon: PlayCircle, color: 'text-primary', bg: 'bg-primary/10' },
                    { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-primary', bg: 'bg-primary/10' },
                    { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-primary', bg: 'bg-primary/10' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center`}>
                          <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <div>
                          <div className="text-2xl font-playfair font-semibold text-slate-900">{stat.value}</div>
                          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">{stat.label}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by title or student name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm focus:bg-white focus:border-primary/20 focus:ring-0 transition-all outline-none"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as RoadmapStatus | 'all')}
                      className="pl-12 pr-8 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm focus:bg-white focus:border-primary/20 focus:ring-0 transition-all outline-none appearance-none cursor-pointer text-slate-700"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="pending-approval">Pending Approval</option>
                      <option value="completed">Completed</option>
                      <option value="paused">Paused</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                {/* Roadmaps Grid */}
                {filteredRoadmaps.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Map className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-playfair font-semibold text-slate-900 mb-2">No Roadmaps Found</h3>
                    <p className="text-slate-500 font-light">
                      {trainerRoadmaps.length === 0 
                        ? "You don't have any assigned roadmaps yet." 
                        : "No roadmaps match your filters."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRoadmaps.map((roadmap) => {
                      const student = students.find((s) => s._id === getRoadmapStudentId(roadmap));
                      const progress = calculateRoadmapProgress(roadmap);
                      
                      return (
                        <div
                          key={roadmap.id}
                          onClick={() => handleRoadmapClick(roadmap)}
                          className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all cursor-pointer group"
                        >
                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-xl ${getStatusColor(roadmap.status)}`}>
                              <Map className="w-6 h-6" />
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(roadmap.status)}
                              <span className="text-sm font-medium capitalize text-slate-600">{roadmap.status.replace('-', ' ')}</span>
                            </div>
                          </div>

                          {/* Student Info */}
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-sm font-medium text-slate-700">
                              {student?.firstName} {student?.lastName}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="font-playfair font-semibold text-slate-900 text-lg mb-2 group-hover:text-primary transition-colors">
                            {roadmap.title}
                          </h3>

                          {/* Progress */}
                          <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-slate-500">Progress</span>
                              <span className="font-medium text-slate-900">{progress}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="flex justify-between text-sm text-slate-500">
                            <span>{roadmap.milestones?.length || 0} milestones</span>
                            <span>{roadmap.milestones?.filter(m => m.status === RoadmapStepStatus.PENDING_APPROVAL).length || 0} pending</span>
                          </div>

                          {/* View Details */}
                          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-primary">
                            <span className="text-sm font-bold uppercase tracking-wider">View Details</span>
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : selectedRoadmap && (
              <>
                {/* Detail View */}
                <div className="mb-6">
                  <button
                    onClick={handleBackToList}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-4 group font-medium"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                    Back to Roadmaps
                  </button>
                  
                  {/* Hero Section */}
                  <div className="bg-slate-900 rounded-[40px] p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-primary/20 to-transparent opacity-60" />
                    <div className="relative z-10">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm border border-white/30">
                              {selectedRoadmap.status.replace('-', ' ').charAt(0).toUpperCase() + selectedRoadmap.status.slice(1).replace('-', ' ')}
                            </span>
                            <span className="text-sm text-white/80">
                              {selectedRoadmap.milestones?.length || 0} milestones
                            </span>
                          </div>
                          <h1 className="text-3xl md:text-4xl font-playfair font-semibold mb-2">{selectedRoadmap.title}</h1>
                          {(() => {
                            const student = students.find((s) => s._id === getRoadmapStudentId(selectedRoadmap));
                            return (
                              <div className="flex items-center gap-2 text-white/90">
                                <User className="w-5 h-5" />
                                <span>Student: {student?.firstName} {student?.lastName}</span>
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-6">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-white/80">Overall Progress</span>
                          <span className="font-semibold">{calculateRoadmapProgress(selectedRoadmap)}%</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-3">
                          <div
                            className="bg-primary h-3 rounded-full transition-all duration-500 shadow-sm"
                            style={{ width: `${calculateRoadmapProgress(selectedRoadmap)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline Milestones */}
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6">
                  <h2 className="text-2xl font-playfair font-semibold text-slate-900 mb-6 flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Learning Milestones
                  </h2>
                  {actionError && (
                    <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {actionError}
                    </div>
                  )}
                  {selectedRoadmap.status === 'pending-approval' && (
                    <div className="mb-4 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                      This roadmap is waiting for admin approval. Milestones stay locked until an admin approves and launches it.
                    </div>
                  )}
                  {canManageMilestones(selectedRoadmap) && (
                    <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-slate-700">
                        Enable milestones for your student to start submitting work. Only one milestone should be active at a time.
                      </p>
                      <button
                        type="button"
                        onClick={handleEnableNextMilestone}
                        disabled={
                          isProcessing ||
                          !selectedRoadmap.milestones?.some(
                            (milestone) => milestone.status === RoadmapStepStatus.LOCKED
                          )
                        }
                        className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-50 whitespace-nowrap"
                      >
                        Enable Next Milestone
                      </button>
                    </div>
                  )}
                  <div className="space-y-0">
                    {selectedRoadmap.milestones?.map((milestone, index) => {
                      const isLast = index === (selectedRoadmap.milestones?.length || 0) - 1;
                      const isActive = milestone.status === RoadmapStepStatus.ACTIVE;
                      const isCompleted = milestone.status === RoadmapStepStatus.COMPLETED;
                      const isPending = milestone.status === RoadmapStepStatus.PENDING_APPROVAL;
                      const submittedProjectsCount = milestone.submittedProjectIds?.length || 0;
                      
                      return (
                        <div key={index} className="relative flex gap-4">
                          {/* Timeline Line */}
                          {!isLast && (
                            <div className="absolute left-5 top-12 w-0.5 h-full bg-gray-200" 
                              style={{ 
                                background: isCompleted ? 'linear-gradient(to bottom, #22c55e, #e5e7eb)' : 
                                           isActive ? 'linear-gradient(to bottom, #3b82f6, #e5e7eb)' : '#e5e7eb'
                              }}
                            />
                          )}
                          
                          {/* Status Icon */}
                          <div className="relative z-10 flex-shrink-0">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${
                              isCompleted ? 'bg-green-500 border-green-100' :
                              isActive ? 'bg-blue-500 border-blue-100' :
                              isPending ? 'bg-yellow-500 border-yellow-100' :
                              'bg-gray-300 border-gray-100'
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
                          <div className="flex-1 pb-8">
                            <div className={`rounded-[24px] p-6 border transition-all ${
                              isPending ? 'bg-primary/5 border-primary/20 shadow-md' :
                              isActive ? 'bg-primary/5 border-primary/20' :
                              isCompleted ? 'bg-green-50/30 border-green-100' :
                              'bg-slate-50 border-slate-100'
                            }`}>
                              {/* Header */}
                              <div className="flex items-start justify-between gap-4 mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-1">
                                    <h3 className="font-playfair font-semibold text-slate-900 text-lg">{milestone.title}</h3>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getMilestoneStatusColor(milestone.status)}`}>
                                      {getMilestoneStatusLabel(milestone.status)}
                                    </span>
                                    {isPending && submittedProjectsCount > 0 && (
                                      <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider">
                                        {submittedProjectsCount} submission{submittedProjectsCount > 1 ? 's' : ''}
                                      </span>
                                    )}
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
                                
                                {/* Status Dropdown */}
                                <div className="flex items-center gap-2 flex-wrap justify-end">
                                  {canManageMilestones(selectedRoadmap) && milestone.status === RoadmapStepStatus.ACTIVE && (
                                    <button
                                      type="button"
                                      onClick={() => handleMilestoneLockToggle(milestone, true)}
                                      disabled={isProcessing}
                                      className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white hover:bg-slate-50 disabled:opacity-50"
                                    >
                                      Lock
                                    </button>
                                  )}
                                  {canManageMilestones(selectedRoadmap) && milestone.status === RoadmapStepStatus.LOCKED && (
                                    <button
                                      type="button"
                                      onClick={() => handleMilestoneLockToggle(milestone, false)}
                                      disabled={isProcessing}
                                      className="px-3 py-2 border border-primary/20 rounded-xl text-sm bg-primary text-slate-900 font-semibold hover:bg-primary/90 disabled:opacity-50"
                                    >
                                      Enable Milestone
                                    </button>
                                  )}

                                  <button
                                    onClick={() => handleViewMilestoneDetails(milestone)}
                                    className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
                                  >
                                    {isPending ? 'Review & Approve' : 'View Details'}
                                  </button>
                                </div>
                              </div>

                              {/* Description */}
                              <p className="text-slate-600 font-light mb-4 leading-relaxed">{milestone.description}</p>

                              {/* Skills */}
                              {milestone.skillsToLearn && milestone.skillsToLearn.length > 0 && (
                                <div className="mb-3">
                                  <div className="flex flex-wrap gap-1.5">
                                    {milestone.skillsToLearn.map((skill, i) => (
                                      <span key={i} className="px-2.5 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium border border-primary/20">
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Required Projects Preview */}
                              {milestone.requiredProjects && milestone.requiredProjects.length > 0 && (
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                  <Folder className="w-4 h-4 text-primary" />
                                  <span>{milestone.requiredProjects.length} required project(s)</span>
                                </div>
                              )}

                              {/* Trainer Feedback Preview */}
                              {milestone.trainerFeedback && (
                                <div className="mt-3 p-3 bg-primary/5 border border-primary/10 rounded-xl">
                                  <p className="text-sm text-primary">
                                    <span className="font-semibold">Your Feedback:</span> {milestone.trainerFeedback.substring(0, 100)}
                                    {milestone.trainerFeedback.length > 100 && '...'}
                                  </p>
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
          </div>
        </main>
      </div>

      {/* Milestone Approval Modal */}
      {showApprovalModal && selectedMilestone && selectedRoadmap && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {!viewingProjectDetail ? (
              <>
                {/* Milestone Overview */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getMilestoneStatusColor(selectedMilestone.status)}`}>
                        {getMilestoneStatusLabel(selectedMilestone.status)}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedMilestone.title}</h2>
                  </div>
                  <button
                    onClick={() => setShowApprovalModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* Description */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                    <p className="text-gray-600">{selectedMilestone.description}</p>
                  </div>

                  {/* Skills */}
                  {selectedMilestone.skillsToLearn && selectedMilestone.skillsToLearn.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Skills to Learn</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedMilestone.skillsToLearn.map((skill, i) => (
                          <span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm border border-blue-100">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tasks */}
                  {selectedMilestone.tasks && selectedMilestone.tasks.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Tasks</h3>
                      <ul className="space-y-1">
                        {selectedMilestone.tasks.map((task, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-1.5 flex-shrink-0" />
                            {task}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Submitted Projects */}
                  {milestoneProjects.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Folder className="w-4 h-4" />
                        Submitted Projects ({milestoneProjects.length})
                      </h3>
                      <div className="space-y-3">
                        {milestoneProjects.map((project) => (
                          <div key={project.id} className={`p-4 rounded-lg border ${
                            project.status === ProjectStatus.APPROVED ? 'bg-green-50 border-green-200' :
                            project.status === ProjectStatus.REJECTED ? 'bg-red-50 border-red-200' :
                            project.status === ProjectStatus.PENDING_APPROVAL ? 'bg-yellow-50 border-yellow-200' :
                            'bg-gray-50 border-gray-200'
                          }`}>
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-gray-900">{project.title}</h4>
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    project.status === ProjectStatus.APPROVED ? 'bg-green-100 text-green-700' :
                                    project.status === ProjectStatus.REJECTED ? 'bg-red-100 text-red-700' :
                                    project.status === ProjectStatus.PENDING_APPROVAL ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {project.status.replace('_', ' ')}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                  <span>{project.category}</span>
                                  {project.toolsUsed && project.toolsUsed.length > 0 && (
                                    <>
                                      <span>•</span>
                                      <span>{project.toolsUsed.slice(0, 3).join(', ')}{project.toolsUsed.length > 3 ? ` +${project.toolsUsed.length - 3}` : ''}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col gap-2">
                                <button
                                  onClick={() => setViewingProjectDetail(project)}
                                  className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium flex items-center gap-1.5"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  Review Project
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Project Approval Warning */}
                      {!allProjectsApproved() && pendingProjectsCount() > 0 && (
                        <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-2">
                          <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-orange-700">
                            <span className="font-medium">Step 1:</span> Review and approve each submitted project below.{' '}
                            <span className="font-medium">Step 2:</span> The milestone completes automatically once all projects are approved (a certificate is issued to the student).
                          </p>
                        </div>
                      )}
                      {loadingMilestoneProjects && (
                        <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600">
                          Loading submitted projects...
                        </div>
                      )}
                    </div>
                  )}

                  {/* Required Projects Notice */}
                  {selectedMilestone.requiredProjects && selectedMilestone.requiredProjects.length > 0 && milestoneProjects.length === 0 && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Required Projects:</span> {selectedMilestone.requiredProjects.join(', ')}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">Waiting for student to submit projects...</p>
                    </div>
                  )}

                  {/* Trainer Feedback Input */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Your Feedback
                    </h3>
                    <textarea
                      value={trainerFeedback}
                      onChange={(e) => setTrainerFeedback(e.target.value)}
                      placeholder="Provide feedback on this milestone and associated projects..."
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                    />
                  </div>

                  {actionError && (
                    <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {actionError}
                    </div>
                  )}

                  {/* Action Buttons */}
                  {selectedMilestone.status === RoadmapStepStatus.PENDING_APPROVAL ? (
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setShowApprovalModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRejectMilestone}
                      disabled={isProcessing || !trainerFeedback.trim()}
                      className="flex-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? 'Processing...' : 'Reject Milestone'}
                    </button>
                    <button
                      onClick={handleApproveMilestone}
                      disabled={isProcessing || !allProjectsApproved()}
                      title={!allProjectsApproved() ? 'Approve all submitted projects first' : undefined}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <CheckSquare className="w-4 h-4" />
                      {isProcessing ? 'Processing...' : 'Approve Milestone'}
                    </button>
                  </div>
                  ) : (
                    <div className="pt-4 border-t border-gray-200">
                      <button
                        onClick={() => setShowApprovalModal(false)}
                        className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Project Detail View */}
                <div className="sticky top-0 bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 rounded-t-2xl z-10">
                  <button
                    onClick={() => setViewingProjectDetail(null)}
                    className="absolute top-4 left-4 p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-white"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowApprovalModal(false)}
                    className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  
                  <div className="pt-8">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border bg-white/90 backdrop-blur-sm`}>
                        {viewingProjectDetail.status.replace('_', ' ')}
                      </span>
                      {viewingProjectDetail.isPublic && (
                        <span className="px-2 py-1 bg-blue-500/20 text-white text-xs rounded-full backdrop-blur-sm border border-blue-400/30">
                          Public
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold text-white">{viewingProjectDetail.title}</h2>
                    <p className="text-white/80 text-sm mt-1">{viewingProjectDetail.category}</p>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Student Role */}
                  {viewingProjectDetail.studentRole && (
                    <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                      <h3 className="text-sm font-semibold text-yellow-800 mb-1 flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        Student's Role
                      </h3>
                      <p className="text-yellow-700 font-medium">{viewingProjectDetail.studentRole}</p>
                    </div>
                  )}

                  {/* Description */}
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-600" />
                      Project Description
                    </h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{viewingProjectDetail.description}</p>
                  </div>

                  {/* Tools Used */}
                  {viewingProjectDetail.toolsUsed && viewingProjectDetail.toolsUsed.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-blue-600" />
                        Tools & Technologies
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {viewingProjectDetail.toolsUsed.map((tool, i) => (
                          <span key={i} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Evidence Links */}
                  {viewingProjectDetail.evidence && Object.values(viewingProjectDetail.evidence).some(v => v) && (
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-green-600" />
                        Project Evidence & Links
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {viewingProjectDetail.evidence.demoLink && (
                          <a href={viewingProjectDetail.evidence.demoLink} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl text-blue-700 hover:bg-blue-100 transition-colors group">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200">
                              <ExternalLink className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Live Demo</p>
                              <p className="text-xs text-blue-600 truncate max-w-[150px]">{viewingProjectDetail.evidence.demoLink}</p>
                            </div>
                          </a>
                        )}
                        {viewingProjectDetail.evidence.videoDemoLink && (
                          <a href={viewingProjectDetail.evidence.videoDemoLink} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-red-50 rounded-xl text-red-700 hover:bg-red-100 transition-colors group">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200">
                              <Youtube className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Video Demo</p>
                              <p className="text-xs text-red-600 truncate max-w-[150px]">{viewingProjectDetail.evidence.videoDemoLink}</p>
                            </div>
                          </a>
                        )}
                        {viewingProjectDetail.evidence.designLink && (
                          <a href={viewingProjectDetail.evidence.designLink} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl text-purple-700 hover:bg-purple-100 transition-colors group">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200">
                              <Figma className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Design Files</p>
                              <p className="text-xs text-purple-600 truncate max-w-[150px]">{viewingProjectDetail.evidence.designLink}</p>
                            </div>
                          </a>
                        )}
                        {viewingProjectDetail.evidence.documentationLink && (
                          <a href={viewingProjectDetail.evidence.documentationLink} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-gray-100 rounded-xl text-gray-700 hover:bg-gray-200 transition-colors group">
                            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center group-hover:bg-gray-300">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Documentation</p>
                              <p className="text-xs text-gray-600 truncate max-w-[150px]">{viewingProjectDetail.evidence.documentationLink}</p>
                            </div>
                          </a>
                        )}
                        {viewingProjectDetail.evidence.fileDownloadLink && (
                          <a href={viewingProjectDetail.evidence.fileDownloadLink} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-green-50 rounded-xl text-green-700 hover:bg-green-100 transition-colors group">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200">
                              <FilePlus className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Download Files</p>
                              <p className="text-xs text-green-600 truncate max-w-[150px]">{viewingProjectDetail.evidence.fileDownloadLink}</p>
                            </div>
                          </a>
                        )}
                        {viewingProjectDetail.evidence.externalLink && (
                          <a href={viewingProjectDetail.evidence.externalLink} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl text-orange-700 hover:bg-orange-100 transition-colors group">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200">
                              <Github className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">External Link</p>
                              <p className="text-xs text-orange-600 truncate max-w-[150px]">{viewingProjectDetail.evidence.externalLink}</p>
                            </div>
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Attachments - Image Thumbnails */}
                  {viewingProjectDetail.attachments && (
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-purple-600" />
                        Attachments
                      </h3>
                      
                      {/* Images */}
                      {viewingProjectDetail.attachments.images && viewingProjectDetail.attachments.images.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-medium text-gray-600 mb-2">Images ({viewingProjectDetail.attachments.images.length})</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 sm:grid-cols-3 gap-3">
                            {viewingProjectDetail.attachments.images.map((url, index) => (
                              <a key={index} href={url} target="_blank" rel="noopener noreferrer"
                                className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200 hover:border-purple-400 transition-all">
                                <Image src={url} alt={`Project image ${index + 1}`}
                                height={200} width={200}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  loading="lazy"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%239CA3AF" stroke-width="1.5"%3E%3Crect x="3" y="3" width="18" height="18" rx="2"/%3E%3Ccircle cx="8.5" cy="8.5" r="1.5"/%3E%3Cpath d="M21 15l-5-5L5 21"/%3E%3C/svg%3E';
                                    (e.target as HTMLImageElement).className = 'w-full h-full object-contain p-4 opacity-50';
                                  }}
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                  <ExternalLink className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* PDFs */}
                      {viewingProjectDetail.attachments.pdfs && viewingProjectDetail.attachments.pdfs.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-600 mb-2">PDF Documents ({viewingProjectDetail.attachments.pdfs.length})</p>
                          <div className="space-y-2">
                            {viewingProjectDetail.attachments.pdfs.map((url, index) => (
                              <a key={index} href={url} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-3 p-2.5 bg-orange-50 rounded-lg text-orange-700 hover:bg-orange-100 transition-colors">
                                <FileText className="w-4 h-4 flex-shrink-0" />
                                <span className="text-sm truncate flex-1">{url.split('/').pop() || `PDF ${index + 1}`}</span>
                                <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Project Actions */}
                  {viewingProjectDetail.status === ProjectStatus.PENDING_APPROVAL && (
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleRejectProject(viewingProjectDetail.id)}
                        disabled={isProcessing || !trainerFeedback.trim()}
                        className="flex-1 px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 font-medium flex items-center justify-center gap-2"
                      >
                        <ThumbsDown className="w-4 h-4" />
                        Reject Project
                      </button>
                      <button
                        onClick={() => handleApproveProject(viewingProjectDetail.id)}
                        disabled={isProcessing}
                        className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-medium flex items-center justify-center gap-2"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        Approve Project
                      </button>
                    </div>
                  )}

                  {/* Back Button */}
                  <div className="flex justify-center">
                    <button
                      onClick={() => setViewingProjectDetail(null)}
                      className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back to Milestone Overview
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
