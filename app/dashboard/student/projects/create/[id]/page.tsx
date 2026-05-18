'use client'

import Sidebar from "@/components/dashboard/Sidebar";
import { useRoadmaps } from "@/contexts";
import { roadmapService } from "@/services/roadmap";
import { Milestone, Roadmap, UserRole } from "@/types";
import { Briefcase, CheckCircle, Code, ExternalLink, Figma, FilePlus, FileText, Github, ImageIcon, Layers, Link2, Plus, Target, Trash2, X, Youtube } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";


export default function CreateProjectPage() {
    const { roadmaps, refreshRoadmaps } = useRoadmaps()
    const { id } = useParams() as { id: string }
    const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null);
    const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
    const [loading, setLoading] = useState(false);

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
    useEffect(() => {
        if (roadmaps.length > 0) {
            const roadmap = roadmaps.find(r => r.id === id) || null;
            setSelectedRoadmap(roadmap);
        }
    }, [id])
    const handleProjectSubmit = async () => {

        if (!selectedMilestone || !projectSubmission.description.trim() || !selectedRoadmap) {
            return;
        }
        setLoading(true);
        try {
            // Submit project and complete milestone
            await roadmapService.completeMilestone(selectedRoadmap.id, selectedMilestone.order, projectSubmission);

            // Refresh roadmaps to get updated data
            await refreshRoadmaps();


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
        <div className="fixed bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full flex justify-center items-start">
            <Sidebar userType={UserRole.STUDENT} />
            <div className="relative bg-white max-w-full w-full max-h-[100vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6">

                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <Target className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-playfair font-semibold text-white">
                                Complete Milestone
                            </h3>
                            <p className="text-white/80 text-sm font-light">{selectedMilestone?.title}</p>
                        </div>
                    </div>
                </div>

                {/* Form Content */}
                <div className="p-6 space-y-6">
                    {/* Project Overview Section */}
                    <div className="bg-slate-50 rounded-[32px] p-5 border border-slate-100">
                        <h4 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-primary" />
                            Project Overview
                        </h4>
                        <div className="space-y-4">
                            {/* Project Title */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Project Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={projectSubmission.title}
                                    onChange={(e) => setProjectSubmission({ ...projectSubmission, title: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:bg-white focus:border-primary/20 focus:ring-0 transition-all text-sm"
                                    placeholder="e.g., Smart Home Automation System"
                                />
                            </div>

                            {/* Category & Role Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Category
                                    </label>
                                    <select
                                        value={projectSubmission.category}
                                        onChange={(e) => setProjectSubmission({ ...projectSubmission, category: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:bg-white focus:border-primary/20 focus:ring-0 transition-all text-sm"
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
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Your Role
                                    </label>
                                    <input
                                        type="text"
                                        value={projectSubmission.studentRole}
                                        onChange={(e) => setProjectSubmission({ ...projectSubmission, studentRole: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:bg-white focus:border-primary/20 focus:ring-0 transition-all text-sm"
                                        placeholder="e.g., Lead Developer"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={projectSubmission.description}
                                    onChange={(e) => setProjectSubmission({ ...projectSubmission, description: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:bg-white focus:border-primary/20 focus:ring-0 transition-all text-sm resize-none"
                                    placeholder="Describe your project, what problem it solves, and what you learned from it..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tools Used Section */}
                    <div className="bg-slate-50 rounded-[32px] p-5 border border-slate-100">
                        <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                            <Layers className="w-4 h-4 text-primary" />
                            Tools & Technologies Used
                        </h4>
                        <div className="space-y-3">
                            {/* Tags Display */}
                            {projectSubmission.toolsUsed.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {projectSubmission.toolsUsed.map((tool, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-xl text-sm font-medium"
                                        >
                                            <Code className="w-3.5 h-3.5" />
                                            {tool}
                                            <button
                                                onClick={() => setProjectSubmission({
                                                    ...projectSubmission,
                                                    toolsUsed: projectSubmission.toolsUsed.filter((_, i) => i !== index)
                                                })}
                                                className="ml-1 text-primary hover:text-primary/80"
                                            >
                                                <X className="w-3.5 h-3.5" />
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
                                    placeholder="e.g., Python, React Native, OpenCV"
                                    className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-sm"
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
                                    className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-xs text-gray-500">Press Enter or click + to add a tool</p>
                        </div>
                    </div>

                    {/* Project Evidence Section */}
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                        <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Link2 className="w-4 h-4 text-green-600" />
                            Project Evidence (Links)
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Demo Link */}
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    Live Demo URL
                                </label>
                                <input
                                    type="url"
                                    value={projectSubmission.evidence.demoLink}
                                    onChange={(e) => setProjectSubmission({
                                        ...projectSubmission,
                                        evidence: { ...projectSubmission.evidence, demoLink: e.target.value }
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-sm"
                                    placeholder="https://my-demo.example.com"
                                />
                            </div>

                            {/* Video Demo Link */}
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
                                    <Youtube className="w-3.5 h-3.5" />
                                    Video Demo (YouTube, etc.)
                                </label>
                                <input
                                    type="url"
                                    value={projectSubmission.evidence.videoDemoLink}
                                    onChange={(e) => setProjectSubmission({
                                        ...projectSubmission,
                                        evidence: { ...projectSubmission.evidence, videoDemoLink: e.target.value }
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-sm"
                                    placeholder="https://youtube.com/watch?v=..."
                                />
                            </div>

                            {/* Design Link */}
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
                                    <Figma className="w-3.5 h-3.5" />
                                    Design (Figma, Adobe XD)
                                </label>
                                <input
                                    type="url"
                                    value={projectSubmission.evidence.designLink}
                                    onChange={(e) => setProjectSubmission({
                                        ...projectSubmission,
                                        evidence: { ...projectSubmission.evidence, designLink: e.target.value }
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-sm"
                                    placeholder="https://figma.com/file/..."
                                />
                            </div>

                            {/* Documentation Link */}
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
                                    <FileText className="w-3.5 h-3.5" />
                                    Documentation
                                </label>
                                <input
                                    type="url"
                                    value={projectSubmission.evidence.documentationLink}
                                    onChange={(e) => setProjectSubmission({
                                        ...projectSubmission,
                                        evidence: { ...projectSubmission.evidence, documentationLink: e.target.value }
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-sm"
                                    placeholder="https://docs.example.com"
                                />
                            </div>

                            {/* File Download Link */}
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
                                    <FilePlus className="w-3.5 h-3.5" />
                                    File Download
                                </label>
                                <input
                                    type="url"
                                    value={projectSubmission.evidence.fileDownloadLink}
                                    onChange={(e) => setProjectSubmission({
                                        ...projectSubmission,
                                        evidence: { ...projectSubmission.evidence, fileDownloadLink: e.target.value }
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-sm"
                                    placeholder="https://drive.google.com/file/..."
                                />
                            </div>

                            {/* External Link */}
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
                                    <Github className="w-3.5 h-3.5" />
                                    GitHub / Other External
                                </label>
                                <input
                                    type="url"
                                    value={projectSubmission.evidence.externalLink}
                                    onChange={(e) => setProjectSubmission({
                                        ...projectSubmission,
                                        evidence: { ...projectSubmission.evidence, externalLink: e.target.value }
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-sm"
                                    placeholder="https://github.com/..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Attachments Section */}
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                        <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-purple-600" />
                            Attachments (Images & PDFs)
                        </h4>

                        {/* Images */}
                        <div className="mb-4">
                            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-2">
                                <ImageIcon className="w-3.5 h-3.5" />
                                Image URLs
                            </label>
                            {projectSubmission.attachments.images.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {projectSubmission.attachments.images.map((url, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm"
                                        >
                                            <ImageIcon className="w-3.5 h-3.5" />
                                            <span className="max-w-[150px] truncate">{url.split('/').pop() || `Image ${index + 1}`}</span>
                                            <button
                                                onClick={() => setProjectSubmission({
                                                    ...projectSubmission,
                                                    attachments: {
                                                        ...projectSubmission.attachments,
                                                        images: projectSubmission.attachments.images.filter((_, i) => i !== index)
                                                    }
                                                })}
                                                className="ml-1 text-purple-500 hover:text-purple-700"
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
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-sm"
                                />
                                <button
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
                                    className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* PDFs */}
                        <div>
                            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-2">
                                <FileText className="w-3.5 h-3.5" />
                                PDF Document URLs
                            </label>
                            {projectSubmission.attachments.pdfs.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {projectSubmission.attachments.pdfs.map((url, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-sm"
                                        >
                                            <FileText className="w-3.5 h-3.5" />
                                            <span className="max-w-[150px] truncate">{url.split('/').pop() || `PDF ${index + 1}`}</span>
                                            <button
                                                onClick={() => setProjectSubmission({
                                                    ...projectSubmission,
                                                    attachments: {
                                                        ...projectSubmission.attachments,
                                                        pdfs: projectSubmission.attachments.pdfs.filter((_, i) => i !== index)
                                                    }
                                                })}
                                                className="ml-1 text-orange-500 hover:text-orange-700"
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
                                    placeholder="https://cdn.example.com/document.pdf"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-sm"
                                />
                                <button
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
                                    className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 ">
                    <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500">
                            <span className="text-red-500">*</span> Required fields
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setLoading(false)}
                                className="px-5 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleProjectSubmit}
                                disabled={loading || !projectSubmission.title.trim() || !projectSubmission.description.trim()}
                                className="px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Submitting...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        Submit Project
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}