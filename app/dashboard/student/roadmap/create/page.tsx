'use client';

import { useState, useEffect, Suspense } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { useAuth, useRoadmaps } from '@/contexts';
import { useNavigationWithLoading } from '@/lib/utils/navigation';
import { Milestone, UserRole, RoadmapStepStatus, Roadmap } from '@/types';
import { roadmapService } from '@/services/roadmap';
import { useSearchParams } from 'next/navigation';
import {
  Map, Clock, CheckCircle, Target, X, Link2, FileText, Image as ImageIcon,
  FilePlus, ExternalLink, Youtube, Figma, Github, Code, Briefcase, Layers,
  Plus, Trash2, Sparkles, ArrowRight, Loader2, ChevronLeft, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function CreatePageContent() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { studentRoadmaps, isLoading: roadmapsLoading, refreshRoadmaps } = useRoadmaps();
  const { navigate } = useNavigationWithLoading();
  const searchParams = useSearchParams();

  const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [projectSubmission, setProjectSubmission] = useState({
    title: '',
    description: '',
    category: '',
    studentRole: '',
    toolsUsed: [] as string[],
    evidence: {
      demoLink: '',
      videoDemoLink: '',
      designLink: '',
      documentationLink: '',
      fileDownloadLink: '',
      externalLink: ''
    },
    attachments: {
      images: [] as string[],
      pdfs: [] as string[]
    }
  });

  // Automatically find the active roadmap or the first roadmap
  const activeRoadmap = studentRoadmaps?.find(r => r.status === 'active' || r.status === 'pending-approval') || studentRoadmaps?.[0] || null;

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

  // Read search parameters for automatic selection
  useEffect(() => {
    const paramRoadmapId = searchParams.get('roadmapId');
    const paramMilestoneOrder = searchParams.get('milestoneOrder');

    if (studentRoadmaps.length > 0) {
      // Prioritize roadmapId from URL, fallback to activeRoadmap
      const roadmap = paramRoadmapId
        ? (studentRoadmaps.find(r => r.id === paramRoadmapId) || activeRoadmap)
        : activeRoadmap;

      setSelectedRoadmap(roadmap);

      if (roadmap && paramMilestoneOrder) {
        const milestone = roadmap.milestones?.find(m => m.order === parseInt(paramMilestoneOrder));
        if (milestone) {
          setSelectedMilestone(milestone);
        }
      }
    }
  }, [studentRoadmaps, searchParams, activeRoadmap]);

  if (authLoading || roadmapsLoading) {
    return (
      <div className="flex min-h-screen lg:h-screen bg-[#fafaf7]">
        <div className="w-64 bg-[#0A0A0A] animate-pulse"></div>
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-slate-500 font-medium animate-pulse">Loading experience...</p>
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
        return 'bg-primary/15 text-primary border-primary/20';
      case RoadmapStepStatus.PENDING_APPROVAL:
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case RoadmapStepStatus.LOCKED:
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const calculateRoadmapProgress = (roadmap: Roadmap) => {
    if (!roadmap.milestones || roadmap.milestones.length === 0) return 0;
    const completed = roadmap.milestones.filter(m => m.status === RoadmapStepStatus.COMPLETED).length;
    return Math.round((completed / roadmap.milestones.length) * 100);
  };

  const handleProjectSubmit = async () => {
    if (!selectedMilestone || !projectSubmission.title.trim() || !projectSubmission.description.trim() || !selectedRoadmap) {
      return;
    }
    setLoading(true);
    try {
      // Submit project and complete milestone
      await roadmapService.completeMilestone(selectedRoadmap.id, selectedMilestone.order, projectSubmission);

      // Refresh roadmaps to get updated data
      await refreshRoadmaps();

      // Show success modal/notification
      setSuccess(true);

      // Reset state except selected roadmap to allow another milestone submission if needed
      setSelectedMilestone(null);
      setProjectSubmission({
        title: '',
        description: '',
        category: '',
        studentRole: '',
        toolsUsed: [],
        evidence: {
          demoLink: '',
          videoDemoLink: '',
          designLink: '',
          documentationLink: '',
          fileDownloadLink: '',
          externalLink: ''
        },
        attachments: {
          images: [],
          pdfs: []
        }
      });
    } catch (error) {
      console.error('Failed to complete milestone:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen lg:h-screen bg-gradient-to-br from-blue-50/20 via-[#fafaf7] to-[#FDF9F2] overflow-hidden">
      <Sidebar activeItem="My Roadmap" userType={UserRole.STUDENT} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Background Sparkles */}
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23cda429\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>

        <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10 relative z-10">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                {/* Badge Sparks */}
                <div className="relative inline-flex items-center justify-center mb-3">
                  <div className="absolute -top-3 -left-3.5 w-7 h-7 pointer-events-none text-primary">
                    <svg viewBox="0 0 40 40" strokeWidth="4" stroke="currentColor" fill="none" strokeLinecap="round">
                      <line x1="8" y1="8" x2="14" y2="14" />
                      <line x1="2" y1="20" x2="10" y2="20" />
                      <line x1="20" y1="2" x2="20" y2="10" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-sans font-bold uppercase tracking-[1.5px] text-primary bg-primary/15 border border-primary/20 px-3.5 py-1 rounded-full shadow-sm">
                    Student Space
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-playfair font-light text-slate-900 leading-tight">
                  Complete a{' '}
                  <span className="relative inline-block z-10 font-semibold">
                    Milestone
                    <span className="absolute bottom-1.5 left-[-2px] w-[105%] h-[8px] bg-primary/20 -z-10 rounded-sm -rotate-1" />
                  </span>
                </h1>
                <p className="text-slate-500 font-light mt-1 text-sm md:text-base">
                  Submit project evidence to mark milestones on your active roadmap as completed.
                </p>
              </div>

              <button
                onClick={() => navigate('/dashboard/student/roadmap')}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-700 border border-slate-200/80 rounded-full font-medium hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm self-start md:self-auto animate-fade-in"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Roadmaps
              </button>
            </div>

            {/* Success Banner */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-8 p-5 bg-green-50 border border-green-200 rounded-[24px] text-green-800 flex items-start justify-between shadow-sm relative overflow-hidden"
                >
                  <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-4 -translate-y-4">
                    <Sparkles className="w-32 h-32 text-green-500" />
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0 shadow-md animate-bounce">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-playfair font-semibold text-lg">Project Submitted Successfully!</h3>
                      <p className="text-sm text-green-700/90 font-light mt-0.5">
                        Your trainer will review your submission and update your roadmap status. Keep up the excellent work!
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSuccess(false)}
                    className="text-green-600 hover:text-green-800 p-1 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* STEP 1 & 2: Select Roadmap & Milestone */}
              <div className="lg:col-span-1 space-y-6">
                {/* 1. Roadmap Overview */}
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_15px_40px_rgba(0,0,0,0.03)] p-6 relative overflow-hidden">
                  <h2 className="text-lg font-playfair font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Map className="w-5 h-5 text-primary" />
                    Current Roadmap
                  </h2>

                  {selectedRoadmap ? (
                    <div className="p-4 rounded-2xl border-2 border-primary bg-primary/5 shadow-sm relative overflow-hidden">
                      <h3 className="font-playfair font-semibold text-sm text-primary">
                        {selectedRoadmap.title}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                        <span>{selectedRoadmap.milestones?.length || 0} Milestones</span>
                        <span>{calculateRoadmapProgress(selectedRoadmap)}% complete</span>
                      </div>
                      <div className="w-full bg-slate-200/60 rounded-full h-1 mt-2">
                        <div
                          className="bg-primary h-1 rounded-full transition-all duration-300"
                          style={{ width: `${calculateRoadmapProgress(selectedRoadmap)}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                      <Map className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">No active learning roadmaps found.</p>
                    </div>
                  )}
                </div>

                {/* 2. Milestone Selection */}
                {selectedRoadmap && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[32px] border border-slate-100 shadow-[0_15px_40px_rgba(0,0,0,0.03)] p-6"
                  >
                    <h2 className="text-lg font-playfair font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      Select Milestone
                    </h2>

                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 scrollbar-hide">
                      {selectedRoadmap.milestones?.map((milestone) => {
                        const isSelected = selectedMilestone?.order === milestone.order;
                        const isCompleted = milestone.status === RoadmapStepStatus.COMPLETED;
                        const isActive = milestone.status === RoadmapStepStatus.ACTIVE;
                        const isPending = milestone.status === RoadmapStepStatus.PENDING_APPROVAL;

                        return (
                          <div
                            key={milestone.order}
                            onClick={() => setSelectedMilestone(milestone)}
                            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer text-left relative ${
                              isSelected
                                ? 'bg-primary/5 border-primary shadow-md scale-[1.01]'
                                : 'bg-slate-50/50 border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 border ${
                                isCompleted
                                  ? 'bg-green-500 text-white border-green-500'
                                  : isActive
                                    ? 'bg-primary text-white border-primary'
                                    : isPending
                                      ? 'bg-yellow-500 text-white border-yellow-500'
                                      : 'bg-slate-200 text-slate-500 border-slate-200'
                              }`}>
                                {milestone.order}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-playfair font-semibold text-xs text-slate-900 truncate">
                                  {milestone.title}
                                </h4>
                                <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-medium border mt-1.5 ${getMilestoneStatusColor(milestone.status)}`}>
                                  {milestone.status.replace('-', ' ').charAt(0).toUpperCase() + milestone.status.slice(1).replace('-', ' ')}
                                </span>
                              </div>
                            </div>

                            {isSelected && (
                              <div className="absolute right-2 top-2">
                                <CheckCircle className="w-4 h-4 text-primary" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* STEP 3: Project Submission Form */}
              <div className="lg:col-span-2">
                <AnimatePresence mode="wait">
                  {selectedMilestone ? (
                    <motion.div
                      key="form-container"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="bg-white rounded-[40px] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden"
                    >
                      {/* Form Header */}
                      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 md:p-8 relative">
                        {/* Decorative Spark */}
                        <div className="absolute top-4 right-4 text-primary/40">
                          <Sparkles className="w-8 h-8 animate-pulse" />
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center flex-shrink-0 shadow-lg text-white">
                            <Award className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                              Submit Milestone Evidence
                            </span>
                            <h3 className="text-lg md:text-xl font-playfair font-semibold text-white mt-0.5 truncate">
                              {selectedMilestone.title}
                            </h3>
                            <p className="text-white/70 text-xs font-light mt-1 leading-relaxed">
                              {selectedMilestone.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Form Content */}
                      <div className="p-6 md:p-8 space-y-8">
                        {/* 1. Project Overview */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                            <Briefcase className="w-4 h-4 text-primary" />
                            Project Overview
                          </h4>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Project Title */}
                            <div className="md:col-span-2">
                              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                                Project Title <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={projectSubmission.title}
                                onChange={(e) => setProjectSubmission({ ...projectSubmission, title: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary/20 focus:ring-0 transition-all text-sm shadow-inner outline-none"
                                placeholder="e.g., Smart Home Automation System"
                              />
                            </div>

                            {/* Category */}
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                                Category
                              </label>
                              <select
                                value={projectSubmission.category}
                                onChange={(e) => setProjectSubmission({ ...projectSubmission, category: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary/20 focus:ring-0 transition-all text-sm outline-none"
                              >
                                <option value="">Select category</option>
                                <option value="Robotics">Robotics</option>
                                <option value="UI/UX">UI/UX Design</option>
                                <option value="Coding">Coding</option>
                                <option value="Data Science">Data Science</option>
                                <option value="Mobile App">Mobile App</option>
                                <option value="Web Development">Web Development</option>
                                <option value="AI/ML">AI/ML</option>
                                <option value="IoT">IoT</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>

                            {/* Student Role */}
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                                Your Role
                              </label>
                              <input
                                type="text"
                                value={projectSubmission.studentRole}
                                onChange={(e) => setProjectSubmission({ ...projectSubmission, studentRole: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary/20 focus:ring-0 transition-all text-sm outline-none"
                                placeholder="e.g., Lead Developer"
                              />
                            </div>

                            {/* Description */}
                            <div className="md:col-span-2">
                              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                                Description <span className="text-red-500">*</span>
                              </label>
                              <textarea
                                value={projectSubmission.description}
                                onChange={(e) => setProjectSubmission({ ...projectSubmission, description: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary/20 focus:ring-0 transition-all text-sm resize-none shadow-inner outline-none"
                                placeholder="Describe your project, what problem it solves, and what you learned..."
                              />
                            </div>
                          </div>
                        </div>

                        {/* 2. Tools & Technologies */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                            <Layers className="w-4 h-4 text-primary" />
                            Tools & Technologies Used
                          </h4>

                          <div className="space-y-3">
                            {/* Tags display */}
                            {projectSubmission.toolsUsed.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {projectSubmission.toolsUsed.map((tool, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-medium"
                                  >
                                    <Code className="w-3.5 h-3.5" />
                                    {tool}
                                    <button
                                      type="button"
                                      onClick={() => setProjectSubmission({
                                        ...projectSubmission,
                                        toolsUsed: projectSubmission.toolsUsed.filter((_, i) => i !== index)
                                      })}
                                      className="ml-1 hover:text-primary/75 p-0.5 hover:bg-primary/20 rounded-full transition-colors"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Add Tool Input */}
                            <div className="flex gap-2">
                              <input
                                type="text"
                                id="toolInput"
                                placeholder="e.g., Python, React Native, Figma, OpenCV"
                                className="flex-1 px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary/20 focus:ring-0 transition-all text-sm outline-none"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const input = e.target as HTMLInputElement;
                                    const value = input.value.trim();
                                    if (value && !projectSubmission.toolsUsed.includes(value)) {
                                      setProjectSubmission({
                                        ...projectSubmission,
                                        toolsUsed: [...projectSubmission.toolsUsed, value]
                                      });
                                      input.value = '';
                                    }
                                  }
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const input = document.getElementById('toolInput') as HTMLInputElement;
                                  const value = input.value.trim();
                                  if (value && !projectSubmission.toolsUsed.includes(value)) {
                                    setProjectSubmission({
                                      ...projectSubmission,
                                      toolsUsed: [...projectSubmission.toolsUsed, value]
                                    });
                                    input.value = '';
                                  }
                                }}
                                className="px-5 py-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-colors text-sm font-medium flex items-center justify-center flex-shrink-0"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <p className="text-[10px] text-slate-400">Press Enter or click + to add a tool tag.</p>
                          </div>
                        </div>

                        {/* 3. Evidence Links */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                            <Link2 className="w-4 h-4 text-primary" />
                            Project Evidence & Links
                          </h4>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Demo Link */}
                            <div>
                              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1.5">
                                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                                Live Demo URL
                              </label>
                              <input
                                type="url"
                                value={projectSubmission.evidence.demoLink}
                                onChange={(e) => setProjectSubmission({
                                  ...projectSubmission,
                                  evidence: { ...projectSubmission.evidence, demoLink: e.target.value }
                                })}
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary/20 focus:ring-0 transition-all text-sm outline-none"
                                placeholder="https://my-demo.example.com"
                              />
                            </div>

                            {/* Video Demo */}
                            <div>
                              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1.5">
                                <Youtube className="w-3.5 h-3.5 text-slate-400" />
                                Video Demo URL
                              </label>
                              <input
                                type="url"
                                value={projectSubmission.evidence.videoDemoLink}
                                onChange={(e) => setProjectSubmission({
                                  ...projectSubmission,
                                  evidence: { ...projectSubmission.evidence, videoDemoLink: e.target.value }
                                })}
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary/20 focus:ring-0 transition-all text-sm outline-none"
                                placeholder="https://youtube.com/watch?v=..."
                              />
                            </div>

                            {/* Design Link */}
                            <div>
                              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1.5">
                                <Figma className="w-3.5 h-3.5 text-slate-400" />
                                Design File URL (Figma, etc.)
                              </label>
                              <input
                                type="url"
                                value={projectSubmission.evidence.designLink}
                                onChange={(e) => setProjectSubmission({
                                  ...projectSubmission,
                                  evidence: { ...projectSubmission.evidence, designLink: e.target.value }
                                })}
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary/20 focus:ring-0 transition-all text-sm outline-none"
                                placeholder="https://figma.com/file/..."
                              />
                            </div>

                            {/* Documentation */}
                            <div>
                              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1.5">
                                <FileText className="w-3.5 h-3.5 text-slate-400" />
                                Documentation URL
                              </label>
                              <input
                                type="url"
                                value={projectSubmission.evidence.documentationLink}
                                onChange={(e) => setProjectSubmission({
                                  ...projectSubmission,
                                  evidence: { ...projectSubmission.evidence, documentationLink: e.target.value }
                                })}
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary/20 focus:ring-0 transition-all text-sm outline-none"
                                placeholder="https://docs.example.com"
                              />
                            </div>

                            {/* File Download */}
                            <div>
                              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1.5">
                                <FilePlus className="w-3.5 h-3.5 text-slate-400" />
                                File Download URL
                              </label>
                              <input
                                type="url"
                                value={projectSubmission.evidence.fileDownloadLink}
                                onChange={(e) => setProjectSubmission({
                                  ...projectSubmission,
                                  evidence: { ...projectSubmission.evidence, fileDownloadLink: e.target.value }
                                })}
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary/20 focus:ring-0 transition-all text-sm outline-none"
                                placeholder="https://drive.google.com/file/..."
                              />
                            </div>

                            {/* GitHub Link */}
                            <div>
                              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1.5">
                                <Github className="w-3.5 h-3.5 text-slate-400" />
                                GitHub URL
                              </label>
                              <input
                                type="url"
                                value={projectSubmission.evidence.externalLink}
                                onChange={(e) => setProjectSubmission({
                                  ...projectSubmission,
                                  evidence: { ...projectSubmission.evidence, externalLink: e.target.value }
                                })}
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary/20 focus:ring-0 transition-all text-sm outline-none"
                                placeholder="https://github.com/..."
                              />
                            </div>
                          </div>
                        </div>

                        {/* 4. Attachments */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                            <ImageIcon className="w-4 h-4 text-primary" />
                            Attachments (Images & PDFs)
                          </h4>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Images */}
                            <div>
                              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-2">
                                Image URLs
                              </label>

                              {projectSubmission.attachments.images.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {projectSubmission.attachments.images.map((url, idx) => (
                                    <span
                                      key={idx}
                                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-full text-xs"
                                    >
                                      <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                                      <span className="max-w-[120px] truncate">{url.split('/').pop() || `Image ${idx + 1}`}</span>
                                      <button
                                        type="button"
                                        onClick={() => setProjectSubmission({
                                          ...projectSubmission,
                                          attachments: {
                                            ...projectSubmission.attachments,
                                            images: projectSubmission.attachments.images.filter((_, i) => i !== idx)
                                          }
                                        })}
                                        className="ml-1 hover:text-red-500 p-0.5 hover:bg-slate-200 rounded-full transition-all"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              )}

                              <div className="flex gap-2">
                                <input
                                  type="url"
                                  id="imageInput"
                                  placeholder="https://cdn.example.com/image.jpg"
                                  className="flex-1 px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary/20 focus:ring-0 transition-all text-sm outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const input = document.getElementById('imageInput') as HTMLInputElement;
                                    const value = input.value.trim();
                                    if (value) {
                                      setProjectSubmission({
                                        ...projectSubmission,
                                        attachments: {
                                          ...projectSubmission.attachments,
                                          images: [...projectSubmission.attachments.images, value]
                                        }
                                      });
                                      input.value = '';
                                    }
                                  }}
                                  className="px-4 py-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center flex-shrink-0"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* PDFs */}
                            <div>
                              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-2">
                                PDF Document URLs
                              </label>

                              {projectSubmission.attachments.pdfs.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {projectSubmission.attachments.pdfs.map((url, idx) => (
                                    <span
                                      key={idx}
                                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-full text-xs"
                                    >
                                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                                      <span className="max-w-[120px] truncate">{url.split('/').pop() || `PDF ${idx + 1}`}</span>
                                      <button
                                        type="button"
                                        onClick={() => setProjectSubmission({
                                          ...projectSubmission,
                                          attachments: {
                                            ...projectSubmission.attachments,
                                            pdfs: projectSubmission.attachments.pdfs.filter((_, i) => i !== idx)
                                          }
                                        })}
                                        className="ml-1 hover:text-red-500 p-0.5 hover:bg-slate-200 rounded-full transition-all"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              )}

                              <div className="flex gap-2">
                                <input
                                  type="url"
                                  id="pdfInput"
                                  placeholder="https://cdn.example.com/doc.pdf"
                                  className="flex-1 px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary/20 focus:ring-0 transition-all text-sm outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const input = document.getElementById('pdfInput') as HTMLInputElement;
                                    const value = input.value.trim();
                                    if (value) {
                                      setProjectSubmission({
                                        ...projectSubmission,
                                        attachments: {
                                          ...projectSubmission.attachments,
                                          pdfs: [...projectSubmission.attachments.pdfs, value]
                                        }
                                      });
                                      input.value = '';
                                    }
                                  }}
                                  className="px-4 py-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center flex-shrink-0"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Sticky Footer */}
                      <div className="bg-slate-50/80 backdrop-blur-md border-t border-slate-100 p-6 flex justify-between items-center">
                        <p className="text-[10px] text-slate-400">
                          <span className="text-red-500">*</span> Required fields
                        </p>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => setSelectedMilestone(null)}
                            className="px-6 py-2.5 text-slate-600 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors font-semibold text-xs"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleProjectSubmit}
                            disabled={loading || !projectSubmission.title.trim() || !projectSubmission.description.trim()}
                            className="bg-primary text-slate-900 px-6 py-2.5 rounded-full font-bold hover:shadow-xl hover:shadow-primary/20 transition-all flex items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                          >
                            {loading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Submitting...
                              </>
                            ) : (
                              <>
                                Submit Evidence
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="placeholder"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="bg-white rounded-[40px] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] p-12 text-center flex flex-col items-center justify-center min-h-[500px]"
                    >
                      <div className="relative w-20 h-20 mb-6">
                        <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping" />
                        <div className="relative w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
                          <Sparkles className="w-10 h-10 text-primary animate-pulse" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-playfair font-semibold text-slate-900 mb-2">Ready to submit?</h3>
                      <p className="text-slate-500 font-light max-w-sm leading-relaxed mb-6">
                        Please select a milestone from your active roadmap on the left to submit project completion evidence.
                      </p>
                      <div className="w-8 h-[2px] bg-primary rounded-full shadow-lg shadow-primary/20" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function StudentRoadmapCreatePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen lg:h-screen bg-[#fafaf7] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-slate-500 font-medium">Preparing workspace...</p>
        </div>
      </div>
    }>
      <CreatePageContent />
    </Suspense>
  );
}
