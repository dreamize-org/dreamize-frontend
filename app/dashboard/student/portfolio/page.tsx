'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useProjects } from '@/contexts/ProjectContext';
import { useRouter } from '@/hooks/useRouter';
import { Student, UserRole } from '@/types';
import Sidebar from '@/components/dashboard/Sidebar';
import {
  Lock as LockIcon,
  Code,
  Palette,
  Briefcase,
  Calendar,
  ExternalLink,
  FileText,
  CreditCard
} from 'lucide-react';

export default function PortfolioPage() {
  const { user, isAuthenticated } = useAuth();
  const { projects, isLoading } = useProjects();
  const router = useRouter();

  // Cast user to Student to access subscription status
  const student = user as Student;
  const hasActiveSubscription = student?.hasActiveSubscription ?? false;

  if (!isAuthenticated) {
    router.push('/auth/login');
    return null;
  }

  // Locked state - subscription required
  if (!hasActiveSubscription) {
    return (
      <div className="flex min-h-screen lg:h-screen bg-[#FDF9F2]">
        <Sidebar activeItem="Portfolio" userType={UserRole.STUDENT} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-8">
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-playfair font-semibold text-slate-900">My Portfolio</h1>
                <p className="text-slate-500 font-light mt-1">Showcase your work and achievements</p>
              </div>

              {/* Locked Message */}
              <div className="bg-white rounded-[40px] border border-slate-100 p-12 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LockIcon className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-playfair font-semibold text-slate-900 mb-2">Portfolio Locked</h2>
                <p className="text-slate-500 font-light mb-6 max-w-md mx-auto">
                  Your portfolio is where you showcase completed projects and achievements.
                  Subscribe to unlock this feature and build your professional profile.
                </p>
                <button
                  onClick={() => router.push('/dashboard/student/pay/subscription')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors"
                >
                  <CreditCard className="w-5 h-5" />
                  Subscribe to Unlock (100,000 RWF/month)
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'web': return <Code className="w-5 h-5" />;
      case 'mobile': return <Briefcase className="w-5 h-5" />;
      case 'design': return <Palette className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'pending_approval': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Filter approved projects only for display
  const approvedProjects = projects.filter(p => p.status === 'approved');

  return (
    <div className="flex min-h-screen lg:h-screen bg-[#FDF9F2]">
      <Sidebar activeItem="Portfolio" userType={UserRole.STUDENT} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div>
                <h1 className="text-3xl font-playfair font-semibold text-slate-900">My Portfolio</h1>
                <p className="text-slate-500 font-light mt-1">Showcase your approved projects</p>
              </div>
            </div>

            {/* Content */}
            <div>
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="bg-white rounded-[32px] p-6 border border-slate-100 animate-pulse">
                        <div className="h-4 w-3/4 bg-slate-200 rounded-xl mb-3" />
                        <div className="h-3 w-full bg-slate-200 rounded-xl mb-2" />
                        <div className="h-3 w-2/3 bg-slate-200 rounded-xl" />
                      </div>
                    ))}
                  </div>
                ) : approvedProjects.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Briefcase className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-playfair font-semibold text-slate-900 mb-2">No Projects Yet</h3>
                    <p className="text-slate-500 font-light mb-4">
                      Complete and get your projects approved to showcase them here.
                    </p>
                    <button
                      onClick={() => router.push('/dashboard/student/projects')}
                      className="px-6 py-3 bg-slate-900 text-white rounded-full hover:bg-slate-800"
                    >
                      View My Projects
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {approvedProjects.map((project) => (
                      <div key={project.id} className="bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                        <div className="p-6">
                          {/* Header */}
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                              {getTypeIcon(project.category)}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-playfair font-semibold text-slate-900 group-hover:text-primary transition-colors">
                                {project.title}
                              </h3>
                              <p className="text-sm text-slate-500 font-light">{project.category}</p>
                            </div>
                          </div>

                          {/* Status */}
                          <div className="mb-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                              {project.status.replace('_', ' ').charAt(0).toUpperCase() + project.status.slice(1).replace('_', ' ')}
                            </span>
                          </div>

                          {/* Description */}
                          <p className="text-slate-600 font-light text-sm mb-4 line-clamp-2">
                            {project.description}
                          </p>

                          {/* Tools */}
                          {project.toolsUsed && project.toolsUsed.length > 0 && (
                            <div className="mb-4">
                              <div className="flex flex-wrap gap-1">
                                {project.toolsUsed.slice(0, 3).map((tool, i) => (
                                  <span key={i} className="px-2 py-1 bg-slate-100 text-slate-700 rounded-xl text-xs">
                                    {tool}
                                  </span>
                                ))}
                                {project.toolsUsed.length > 3 && (
                                  <span className="px-2 py-1 text-slate-500 text-xs">
                                    +{project.toolsUsed.length - 3}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <div className="flex items-center gap-3 text-sm text-slate-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(project.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <button className="text-primary hover:text-primary/80 transition-colors">
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
