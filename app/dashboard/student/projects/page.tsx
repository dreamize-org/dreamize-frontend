'use client';

import { useState } from 'react';
import { useRouter } from '@/hooks/useRouter';
import Sidebar from '@/components/dashboard/Sidebar';
import { useProjects } from '@/contexts/ProjectContext';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, ProjectStatus, type Project } from '@/types';
import {
  Folder,
  Clock,
  CheckCircle,
  XCircle,
  Hourglass,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Wrench,
  User,
  Calendar,
  Search,
  Filter,
  Grid,
  List,
  ChevronRight,
  Plus,
  X,
  Award,
  Target,
  Link2,
  Youtube,
  Figma,
  Github,
  FilePlus
} from 'lucide-react';
import Image from 'next/image';

export default function StudentProjectsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { projects, isLoading } = useProjects();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Filter projects for current student
  const studentProjects = projects.filter(p => p.student._id === user?._id);

  // Apply filters
  const filteredProjects = studentProjects.filter(project => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    total: studentProjects.length,
    approved: studentProjects.filter(p => p.status === ProjectStatus.APPROVED).length,
    pending: studentProjects.filter(p => p.status === ProjectStatus.PENDING_APPROVAL).length,
    rejected: studentProjects.filter(p => p.status === ProjectStatus.REJECTED).length,
    draft: studentProjects.filter(p => p.status === ProjectStatus.DRAFT).length,
  };

  const getStatusIcon = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.APPROVED:
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case ProjectStatus.PENDING_APPROVAL:
        return <Hourglass className="w-5 h-5 text-yellow-600" />;
      case ProjectStatus.REJECTED:
        return <XCircle className="w-5 h-5 text-red-600" />;
      case ProjectStatus.DRAFT:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.APPROVED:
        return 'bg-green-50 border-green-200 text-green-700';
      case ProjectStatus.PENDING_APPROVAL:
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case ProjectStatus.REJECTED:
        return 'bg-red-50 border-red-200 text-red-700';
      case ProjectStatus.DRAFT:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getStatusLabel = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.APPROVED:
        return 'Approved';
      case ProjectStatus.PENDING_APPROVAL:
        return 'Pending Approval';
      case ProjectStatus.REJECTED:
        return 'Rejected';
      case ProjectStatus.DRAFT:
        return 'Draft';
    }
  };

  return (
    <div className="flex min-h-screen lg:h-screen bg-[#FDF9F2]">
      <Sidebar activeItem="Projects" userType={UserRole.STUDENT} />

      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <main className="flex-1 overflow-auto">
          <div className="p-4 pl-16 md:p-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-playfair font-semibold text-slate-900">My Projects</h1>
                  <p className="text-slate-500 font-light mt-1">View and manage all your submitted projects</p>
                </div>
                <button
                  onClick={() => router.push('/dashboard/student/roadmap/create')}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-full font-medium hover:bg-slate-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  New Project
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              {[
                { label: 'Total', value: stats.total, icon: Folder, color: 'text-slate-600', bg: 'bg-slate-100' },
                { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
                { label: 'Pending', value: stats.pending, icon: Hourglass, color: 'text-yellow-600', bg: 'bg-yellow-100' },
                { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
                { label: 'Drafts', value: stats.draft, icon: Clock, color: 'text-slate-600', bg: 'bg-slate-100' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-[32px] p-4 border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div>
                      <div className="text-2xl font-playfair font-semibold text-slate-900">{stat.value}</div>
                      <div className="text-xs text-slate-500">{stat.label}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl text-sm focus:bg-white focus:border-primary/20 focus:ring-0 transition-all"
                />
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'all')}
                    className="pl-10 pr-8 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl text-sm focus:bg-white focus:border-primary/20 focus:ring-0 transition-all appearance-none"
                  >
                    <option value="all">All Status</option>
                    <option value={ProjectStatus.APPROVED}>Approved</option>
                    <option value={ProjectStatus.PENDING_APPROVAL}>Pending</option>
                    <option value={ProjectStatus.REJECTED}>Rejected</option>
                    <option value={ProjectStatus.DRAFT}>Draft</option>
                  </select>
                </div>
                <div className="flex border border-slate-300 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-primary/10 text-primary' : 'bg-white text-slate-600'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-primary/10 text-primary' : 'bg-white text-slate-600'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Projects Display */}
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
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Folder className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-playfair font-semibold text-slate-900 mb-2">No Projects Found</h3>
                <p className="text-slate-500 font-light mb-4">
                  {studentProjects.length === 0
                    ? "You haven't submitted any projects yet."
                    : "No projects match your filters."}
                </p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all cursor-pointer group"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                        <div className="flex items-center gap-1.5">
                          {getStatusIcon(project.status)}
                          <span>{getStatusLabel(project.status)}</span>
                        </div>
                      </div>
                      {project.isPublic && (
                        <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                          Public
                        </span>
                      )}
                    </div>

                    {/* Title & Category */}
                    <h3 className="font-playfair font-semibold text-slate-900 text-lg mb-1 group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-sm text-slate-500 font-light mb-3">{project.category}</p>

                    {/* Description */}
                    <p className="text-sm text-slate-600 font-light line-clamp-2 mb-4">
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
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Project</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tools</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProjects.map((project) => (
                      <tr
                        key={project.id}
                        onClick={() => setSelectedProject(project)}
                        className="hover:bg-slate-50 cursor-pointer"
                      >
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-slate-900">{project.title}</p>
                            <p className="text-sm text-slate-500 line-clamp-1">{project.description}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-slate-700">{project.category}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                            {getStatusIcon(project.status)}
                            {getStatusLabel(project.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {project.toolsUsed?.slice(0, 2).map((tool, i) => (
                              <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-xl text-xs">
                                {tool}
                              </span>
                            ))}
                            {project.toolsUsed && project.toolsUsed.length > 2 && (
                              <span className="text-xs text-slate-500">+{project.toolsUsed.length - 2}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-500">
                          {new Date(project.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Project Detail Modal - Full Page Style */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[40px] shadow-2xl max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto">
            {/* Hero Header */}
            <div className="sticky top-0 z-10">
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-t-[40px] relative">
                <button
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors text-white"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Status & Public Badge */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border bg-white/90 backdrop-blur-sm`}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(selectedProject.status)}
                          <span>{getStatusLabel(selectedProject.status)}</span>
                        </div>
                      </span>
                      {selectedProject.isPublic && (
                        <span className="px-2 py-1 bg-primary/20 text-white text-xs rounded-full backdrop-blur-sm border border-primary/30">
                          Public
                        </span>
                      )}
                    </div>

                    <h2 className="text-3xl font-playfair font-semibold text-white mb-2">{selectedProject.title}</h2>
                    <div className="flex items-center gap-4 text-white/90 text-sm">
                      <span className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        {selectedProject.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(selectedProject.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-6">
              {/* Role Card */}
              {selectedProject.studentRole && (
                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                  <h3 className="text-sm font-semibold text-yellow-800 mb-1 flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Your Role
                  </h3>
                  <p className="text-yellow-700 font-medium">{selectedProject.studentRole}</p>
                </div>
              )}

              {/* Description */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-600" />
                  Project Description
                </h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedProject.description}</p>
              </div>

              {/* Tools Used */}
              {selectedProject.toolsUsed && selectedProject.toolsUsed.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-blue-600" />
                    Tools & Technologies Used
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.toolsUsed.map((tool, i) => (
                      <span key={i} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Evidence Links - All 6 Links */}
              {selectedProject.evidence && Object.values(selectedProject.evidence).some(v => v) && (
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-green-600" />
                    Project Evidence & Links
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedProject.evidence.demoLink && (
                      <a
                        href={selectedProject.evidence.demoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl text-blue-700 hover:bg-blue-100 transition-colors group"
                      >
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                          <ExternalLink className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Live Demo</p>
                          <p className="text-xs text-blue-600 truncate max-w-[150px]">{selectedProject.evidence.demoLink}</p>
                        </div>
                      </a>
                    )}
                    {selectedProject.evidence.videoDemoLink && (
                      <a
                        href={selectedProject.evidence.videoDemoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-red-50 rounded-xl text-red-700 hover:bg-red-100 transition-colors group"
                      >
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                          <Youtube className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Video Demo</p>
                          <p className="text-xs text-red-600 truncate max-w-[150px]">{selectedProject.evidence.videoDemoLink}</p>
                        </div>
                      </a>
                    )}
                    {selectedProject.evidence.designLink && (
                      <a
                        href={selectedProject.evidence.designLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl text-purple-700 hover:bg-purple-100 transition-colors group"
                      >
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                          <Figma className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Design Files</p>
                          <p className="text-xs text-purple-600 truncate max-w-[150px]">{selectedProject.evidence.designLink}</p>
                        </div>
                      </a>
                    )}
                    {selectedProject.evidence.documentationLink && (
                      <a
                        href={selectedProject.evidence.documentationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-gray-100 rounded-xl text-gray-700 hover:bg-gray-200 transition-colors group"
                      >
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center group-hover:bg-gray-300 transition-colors">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Documentation</p>
                          <p className="text-xs text-gray-600 truncate max-w-[150px]">{selectedProject.evidence.documentationLink}</p>
                        </div>
                      </a>
                    )}
                    {selectedProject.evidence.fileDownloadLink && (
                      <a
                        href={selectedProject.evidence.fileDownloadLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-green-50 rounded-xl text-green-700 hover:bg-green-100 transition-colors group"
                      >
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                          <FilePlus className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Download Files</p>
                          <p className="text-xs text-green-600 truncate max-w-[150px]">{selectedProject.evidence.fileDownloadLink}</p>
                        </div>
                      </a>
                    )}
                    {selectedProject.evidence.externalLink && (
                      <a
                        href={selectedProject.evidence.externalLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl text-orange-700 hover:bg-orange-100 transition-colors group"
                      >
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                          <Github className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">External Link</p>
                          <p className="text-xs text-orange-600 truncate max-w-[150px]">{selectedProject.evidence.externalLink}</p>
                        </div>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Attachments - Clickable URLs */}
              {selectedProject.attachments && (
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-purple-600" />
                    Attachments
                  </h3>

                  {/* Images - Display as thumbnails */}
                  {selectedProject.attachments.images && selectedProject.attachments.images.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-gray-600 mb-2">
                        Images ({selectedProject.attachments.images.length})
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {selectedProject.attachments.images.map((url, index) => (
                          <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200 hover:border-purple-400 transition-all"
                          >
                            <Image
                              src={url}
                              alt={`Project image ${index + 1}`}
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              width={500}
                              height={500}
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
                  {selectedProject.attachments.pdfs && selectedProject.attachments.pdfs.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-2">
                        PDF Documents ({selectedProject.attachments.pdfs.length})
                      </p>
                      <div className="space-y-2">
                        {selectedProject.attachments.pdfs.map((url, index) => (
                          <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-2.5 bg-orange-50 rounded-lg text-orange-700 hover:bg-orange-100 transition-colors"
                          >
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

              {/* Trainer Feedback */}
              {selectedProject.trainerFeedback && (
                <div className="p-5 bg-blue-50 border border-blue-100 rounded-xl">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Trainer Feedback
                  </h3>
                  <p className="text-sm text-blue-700 leading-relaxed">{selectedProject.trainerFeedback}</p>
                  {selectedProject.approvedAt && (
                    <p className="text-xs text-blue-600 mt-3 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Approved on {new Date(selectedProject.approvedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl flex justify-between items-center">
              <p className="text-sm text-gray-500">
                Project ID: <span className="font-mono text-xs">{selectedProject.id}</span>
              </p>
              <button
                onClick={() => setSelectedProject(null)}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
