'use client';

import { useState, useMemo } from 'react';
import { Mail, Calendar, Eye, CheckCircle, XCircle, AlertCircle, GraduationCap } from 'lucide-react';
import DataTable from '@/components/ui/DataTable';
import { useUsers } from '@/contexts/UserContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRoadmaps } from '@/contexts/RoadmapContext';
import { Student } from '@/types';
import { RoadmapStepStatus } from '@/types/roadmap';
import StudentDetailModal from './StudentDetailModal';

interface StudentsTableProps {
  searchQuery: string;
  selectedStatus: string;
}

// Status badge component
const StatusBadge = ({ isActive, isVerified }: { isActive: boolean; isVerified: boolean }) => {
  if (!isActive) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-red-100 text-red-700 uppercase tracking-widest border border-red-200">
        <XCircle className="w-3 h-3 mr-1" />
        Inactive
      </span>
    );
  }
  if (!isVerified) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-orange-100 text-orange-700 uppercase tracking-widest border border-orange-200">
        <AlertCircle className="w-3 h-3 mr-1" />
        Pending
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-green-100 text-green-700 uppercase tracking-widest border border-green-200">
      <CheckCircle className="w-3 h-3 mr-1" />
      Active
    </span>
  );
};

export default function StudentsTable({ searchQuery, selectedStatus }: StudentsTableProps) {
  const [selectedStudents, setSelectedStudents] = useState<Record<string, unknown>[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const { students, isLoading } = useUsers();
  const { user } = useAuth();
  const { getRoadmapByIdFromContext } = useRoadmaps();

  // Filter students assigned to current trainer
  const myStudents = useMemo(() => {
    if (!user) return [];
    return students.filter(student => student.assignedTrainerId === user._id);
  }, [students, user]);

  // Filter students based on search and status
  const filteredStudents = useMemo(() => {
    return myStudents.filter(student => {
      const studentName = `${student.firstName} ${student.lastName}`;
      const matchesSearch = searchQuery === '' ||
        studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter logic
      let matchesStatus = true;
      if (selectedStatus === 'active') {
        matchesStatus = student.isActive && student.isVerified;
      } else if (selectedStatus === 'inactive') {
        matchesStatus = !student.isActive;
      } else if (selectedStatus === 'pending') {
        matchesStatus = student.isActive && !student.isVerified;
      }

      return matchesSearch && matchesStatus;
    });
  }, [myStudents, searchQuery, selectedStatus]);

  // Calculate progress from roadmap
  const getStudentProgress = (student: Student): number => {
    if (!student.currentRoadmapId) return 0;
    const roadmap = getRoadmapByIdFromContext(student.currentRoadmapId);
    if (!roadmap || !roadmap.milestones || roadmap.milestones.length === 0) return 0;
    const completed = roadmap.milestones.filter(m => m.status === RoadmapStepStatus.COMPLETED).length;
    return Math.round((completed / roadmap.milestones.length) * 100);
  };

  // Get student's roadmap
  const getStudentRoadmap = (student: Student) => {
    if (!student.currentRoadmapId) return undefined;
    return getRoadmapByIdFromContext(student.currentRoadmapId);
  };

  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student);
    setShowDetailModal(true);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-slate-50 border border-slate-100 rounded-2xl" />
        ))}
      </div>
    );
  }

  // Empty state
  if (filteredStudents.length === 0) {
    return (
      <div className="text-center py-20 bg-slate-50 rounded-[32px] border border-slate-100">
        <div className="w-20 h-20 bg-white shadow-sm rounded-[24px] flex items-center justify-center mx-auto mb-6">
          <GraduationCap className="w-10 h-10 text-slate-300" />
        </div>
        <h3 className="text-xl font-black text-slate-900 mb-2">
          {myStudents.length === 0 ? 'No Mentees Assigned' : 'No Matches Found'}
        </h3>
        <p className="text-slate-500 font-medium max-w-sm mx-auto">
          {myStudents.length === 0 
            ? 'Students assigned to your mentorship group will appear here.' 
            : 'Try adjusting your search query or filters.'}
        </p>
      </div>
    );
  }

  // Transform data for DataTable
  const tableData = filteredStudents.map(student => {
    const studentName = `${student.firstName} ${student.lastName}`;
    const avatar = getInitials(student.firstName, student.lastName);
    const joinDate = student.createdAt;
    const progress = getStudentProgress(student);
    const roadmap = getStudentRoadmap(student);

    return {
      id: student._id,
      student: (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-900 rounded-[16px] flex items-center justify-center text-primary font-black text-sm shadow-md">
            {avatar}
          </div>
          <div>
            <div className="text-[14px] font-black text-slate-900">{studentName}</div>
            <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3 h-3" />
              {student.email}
            </div>
          </div>
        </div>
      ),
      roadmap: (
        <div>
          <div className="text-[13px] font-bold text-slate-900">
            {roadmap?.title || 'No architecture assigned'}
          </div>
          <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mt-0.5 uppercase tracking-widest">
            <Calendar className="w-3 h-3" />
            Joined {new Date(joinDate).toLocaleDateString()}
          </div>
        </div>
      ),
      status: (
        <StatusBadge isActive={student.isActive} isVerified={student.isVerified} />
      ),
      subscription: (
        <div>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${
            student.hasActiveSubscription ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-slate-100 text-slate-500 border border-slate-200'
          }`}>
            {student.hasActiveSubscription ? 'Premium' : 'Standard'}
          </span>
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">
            {student.hasPaidOrientation ? 'Orientation Complete' : 'Awaiting Orientation'}
          </div>
        </div>
      ),
      progress: (
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-slate-100 rounded-full h-2 w-24 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-black text-slate-700 w-10">{progress}%</span>
        </div>
      ),
      actions: (
        <button
          onClick={() => handleViewDetails(student)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 text-slate-700 border border-slate-200 text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-slate-900 hover:text-primary hover:border-slate-900 transition-all group"
        >
          <Eye className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          Dossier
        </button>
      ),
      _original: student
    };
  });

  const columns = [
    { key: 'student', label: 'Student', sortable: true, filterable: true, searchable: true },
    { key: 'roadmap', label: 'Roadmap', sortable: true, filterable: true, searchable: true },
    { key: 'status', label: 'Status', sortable: true, filterable: true, searchable: false },
    { key: 'subscription', label: 'Subscription', sortable: true, filterable: true, searchable: false },
    { key: 'progress', label: 'Progress', sortable: true, filterable: false, searchable: false },
    { key: 'actions', label: 'Actions', sortable: false, filterable: false, searchable: false }
  ];

  const handleSelectionChange = (selectedItems: Record<string, unknown>[]) => {
    setSelectedStudents(selectedItems);
  };

  const handleFilterChange = (_filters: Record<string, unknown>) => {
    // Client-side filtering is handled in the table component
  };

  const handleSearchChange = (_searchQuery: string) => {
    // Client-side search is handled in the table component
  };

  return (
    <div className="space-y-6">
      {/* Selected Actions */}
      {selectedStudents.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-[20px] p-4 animate-in fade-in slide-in-from-top-2">
          <span className="text-[13px] font-black text-slate-900 flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            {selectedStudents.length} Mentee{selectedStudents.length > 1 ? 's' : ''} Selected
          </span>
        </div>
      )}

      {/* Results Count */}
      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
        Showing {filteredStudents.length} of {myStudents.length} total mentees
      </div>

      {/* DataTable */}
      <DataTable
        data={tableData}
        columns={columns}
        hasCheckboxes={true}
        hasFilters={true}
        hasSearch={true}
        onSelectionChange={handleSelectionChange}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
      />

      {/* Student Detail Modal */}
      {showDetailModal && selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          roadmap={getStudentRoadmap(selectedStudent)}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedStudent(null);
          }}
        />
      )}
    </div>
  );
}

// Helper function
const getInitials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};
