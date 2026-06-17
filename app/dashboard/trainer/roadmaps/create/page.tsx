'use client';

import { useState } from 'react';
import { useRouter } from '@/hooks/useRouter';;
import { useAuth, useUsers, useRoadmaps } from '@/contexts';
import { getAuthUserId } from '@/lib/auth/session';
import { filterStudentsForTrainer } from '@/lib/users/trainerStudents';
import { Student, UserRole } from '@/types';
import { CreateRoadmapData, Milestone, RoadmapStepStatus } from '@/types/roadmap';
import Sidebar from '@/components/dashboard/Sidebar';
import { CommaSeparatedInput } from '@/components/ui/CommaSeparatedInput';
import {
  Map, Search, User, Plus, X, ChevronLeft, CheckCircle,
  Clock, Target, ArrowRight, Loader2
} from 'lucide-react';

type Step = 'student' | 'details' | 'milestones' | 'review';

export default function CreateRoadmapPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { students } = useUsers();
  const { createRoadmap } = useRoadmaps();

  const [currentStep, setCurrentStep] = useState<Step>('student');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roadmapTitle, setRoadmapTitle] = useState('');
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Filter students assigned to this trainer
  const assignedStudents = filterStudentsForTrainer(students, getAuthUserId(user));

  // Filter by search query
  const filteredStudents = assignedStudents.filter(student => {
    const query = searchQuery.toLowerCase();
    return (
      student.firstName?.toLowerCase().includes(query) ||
      student.lastName?.toLowerCase().includes(query) ||
      student.email?.toLowerCase().includes(query)
    );
  });

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setCurrentStep('details');
  };

  const handleAddMilestone = () => {
    const newMilestone: Milestone = {
      order: milestones.length + 1,
      title: '',
      description: '',
      skillsToLearn: [],
      tasks: [],
      requiredProjects: [],
      estimatedDurationDays: 7,
      status: RoadmapStepStatus.LOCKED,
      completedAt: null
    };
    setMilestones([...milestones, newMilestone]);
  };

  const handleRemoveMilestone = (index: number) => {
    const updated = milestones.filter((_, i) => i !== index);
    // Re-order remaining milestones
    updated.forEach((m, i) => m.order = i + 1);
    setMilestones(updated);
  };

  const handleUpdateMilestone = (index: number, field: keyof Milestone, value: string[] | number | string) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: value };
    setMilestones(updated);
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!selectedStudent || !roadmapTitle.trim() || milestones.length === 0) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Prepare data according to backend requirements
      const roadmapData: CreateRoadmapData = {
        studentId: selectedStudent._id,
        trainerId: user._id,
        title: roadmapTitle,
        status: 'pending-approval',
        milestones: milestones.map(m => ({
          ...m,
          tasks: m.tasks || [],
          skillsToLearn: m.skillsToLearn || [],
          requiredProjects: m.requiredProjects || []
        })),

      };

      await createRoadmap(roadmapData);

      // Show success and redirect
      alert('Roadmap created successfully!');
      router.push('/dashboard/trainer/roadmaps');
    } catch (error) {
      console.error('Failed to create roadmap:', error);
      setSubmitError('Failed to create roadmap. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 'student', label: 'Select Student', icon: User },
    { id: 'details', label: 'Roadmap Details', icon: Map },
    { id: 'milestones', label: 'Add Milestones', icon: Target },
    { id: 'review', label: 'Review & Create', icon: CheckCircle }
  ];

  return (
    <div className="flex min-h-screen lg:h-screen bg-gray-50">
      <Sidebar activeItem="Roadmaps" userType={UserRole.TRAINER} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={() => router.push('/dashboard/trainer/roadmaps')}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Create New Roadmap</h1>
                <p className="text-gray-600 mt-1">Design a personalized learning path for your student</p>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-4 mb-8">
              {steps.map((step, index) => {
                const isActive = currentStep === step.id;
                const isCompleted = steps.findIndex(s => s.id === currentStep) > index;
                const Icon = step.icon;

                return (
                  <div key={step.id} className="flex items-center gap-2">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isActive ? 'bg-yellow-100 text-yellow-700' :
                      isCompleted ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{step.label}</span>
                    </div>
                    {index < steps.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Error Message */}
            {submitError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {submitError}
              </div>
            )}

            {/* Step 1: Select Student */}
            {currentStep === 'student' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Select a Student</h2>

                  {/* Search */}
                  <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search students by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>

                  {/* Student Grid */}
                  {assignedStudents.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Assigned Students</h3>
                      <p className="text-gray-600">
                        You don't have any students assigned to you yet. Students will appear here after admin assigns them.
                      </p>
                    </div>
                  ) : filteredStudents.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No students match your search</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredStudents.map((student) => (
                        <button
                          key={student._id}
                          onClick={() => handleSelectStudent(student)}
                          className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-yellow-400 hover:shadow-md transition-all text-left"
                        >
                          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-6 h-6 text-yellow-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {student.firstName} {student.lastName}
                            </h3>
                            <p className="text-sm text-gray-500 truncate">{student.email}</p>
                            <p className="text-sm text-gray-400 mt-1">
                              {student.currentRoadmapId ? 'Has roadmap' : 'No roadmap yet'}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Roadmap Details */}
            {currentStep === 'details' && selectedStudent && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Roadmap Details</h2>

                  {/* Selected Student */}
                  <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg mb-6">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Creating roadmap for</p>
                      <p className="font-semibold text-gray-900">
                        {selectedStudent.firstName} {selectedStudent.lastName}
                      </p>
                    </div>
                    <button
                      onClick={() => setCurrentStep('student')}
                      className="ml-auto text-sm text-yellow-600 hover:text-yellow-700"
                    >
                      Change
                    </button>
                  </div>

                  {/* Title Input */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Roadmap Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={roadmapTitle}
                      onChange={(e) => setRoadmapTitle(e.target.value)}
                      placeholder="e.g., Full-Stack Web Development Journey"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                    <p className="text-sm text-gray-500">
                      Give your roadmap a clear, descriptive title
                    </p>
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-end mt-6">
                    <button
                      onClick={() => setCurrentStep('milestones')}
                      disabled={!roadmapTitle.trim()}
                      className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continue to Milestones
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Add Milestones */}
            {currentStep === 'milestones' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Learning Milestones</h2>
                      <p className="text-gray-600 mt-1">
                        Add milestones one by one. Each milestone represents a learning phase.
                      </p>
                    </div>
                    <button
                      onClick={handleAddMilestone}
                      className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Milestone
                    </button>
                  </div>

                  {milestones.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Milestones Yet</h3>
                      <p className="text-gray-600 mb-4">Click "Add Milestone" to start building the roadmap</p>
                      <button
                        onClick={handleAddMilestone}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                      >
                        Add First Milestone
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {milestones.map((milestone, index) => (
                        <div key={index} className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-yellow-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                                {milestone.order}
                              </div>
                              <h3 className="font-semibold text-gray-900">Milestone {milestone.order}</h3>
                            </div>
                            <button
                              onClick={() => handleRemoveMilestone(index)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="space-y-4">
                            {/* Title */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Title <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={milestone.title}
                                onChange={(e) => handleUpdateMilestone(index, 'title', e.target.value)}
                                placeholder="e.g., React Fundamentals"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                              />
                            </div>

                            {/* Description */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                              </label>
                              <textarea
                                value={milestone.description}
                                onChange={(e) => handleUpdateMilestone(index, 'description', e.target.value)}
                                placeholder="What will the student learn in this milestone?"
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Skills */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Skills to Learn
                                </label>
                                <CommaSeparatedInput
                                  value={milestone.skillsToLearn || []}
                                  onChange={(skillsToLearn) =>
                                    handleUpdateMilestone(index, 'skillsToLearn', skillsToLearn)
                                  }
                                  placeholder="React, JavaScript, CSS..."
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">Comma separated</p>
                              </div>

                              {/* Duration */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Duration (days)
                                </label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    value={milestone.estimatedDurationDays}
                                    onChange={(e) => handleUpdateMilestone(
                                      index,
                                      'estimatedDurationDays',
                                      parseInt(e.target.value) || 7
                                    )}
                                    min={1}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                  />
                                  <Clock className="w-5 h-5 text-gray-400" />
                                </div>
                              </div>
                            </div>

                            {/* Required Projects */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Required Projects
                              </label>
                              <CommaSeparatedInput
                                value={milestone.requiredProjects || []}
                                onChange={(requiredProjects) =>
                                  handleUpdateMilestone(index, 'requiredProjects', requiredProjects)
                                }
                                placeholder="E-commerce site, Portfolio website..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                              />
                              <p className="text-xs text-gray-500 mt-1">Comma separated project names</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex justify-between mt-6">
                    <button
                      onClick={() => setCurrentStep('details')}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setCurrentStep('review')}
                      disabled={milestones.length === 0 || milestones.some(m => !m.title.trim())}
                      className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Review Roadmap
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review & Create */}
            {currentStep === 'review' && selectedStudent && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Review Your Roadmap</h2>

                  {/* Summary */}
                  <div className="space-y-4 mb-8">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Student</p>
                      <p className="font-semibold text-gray-900">
                        {selectedStudent.firstName} {selectedStudent.lastName} ({selectedStudent.email})
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Roadmap Title</p>
                      <p className="font-semibold text-gray-900">{roadmapTitle}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Total Milestones</p>
                      <p className="font-semibold text-gray-900">{milestones.length}</p>
                    </div>
                  </div>

                  {/* Milestones Preview */}
                  <div className="mb-8">
                    <h3 className="font-semibold text-gray-900 mb-4">Milestones Overview</h3>
                    <div className="space-y-3">
                      {milestones.map((milestone, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-6 h-6 bg-yellow-600 text-white rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">
                            {milestone.order}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{milestone.title}</p>
                            <p className="text-sm text-gray-600">{milestone.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <span>{milestone.estimatedDurationDays} days</span>
                              {milestone.skillsToLearn && milestone.skillsToLearn.length > 0 && (
                                <span>{milestone.skillsToLearn.length} skills</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between">
                    <button
                      onClick={() => setCurrentStep('milestones')}
                      disabled={isSubmitting}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="flex items-center gap-2 px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Create Roadmap
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
