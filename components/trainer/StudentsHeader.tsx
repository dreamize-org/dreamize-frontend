'use client';

import { useMemo } from 'react';
import { Users, GraduationCap, CheckCircle, Activity, Award } from 'lucide-react';
import { useUsers } from '@/contexts/UserContext';
import { useAuth } from '@/contexts/AuthContext';
import { getAuthUserId } from '@/lib/auth/session';
import { filterStudentsForTrainer } from '@/lib/users/trainerStudents';
import { useRoadmaps } from '@/contexts/RoadmapContext';
import { RoadmapStepStatus } from '@/types/roadmap';

export default function StudentsHeader() {
  const { students, isLoading } = useUsers();
  const { user } = useAuth();
  const { roadmaps } = useRoadmaps();

  const myStudents = useMemo(() => {
    if (!user) return [];
    return filterStudentsForTrainer(students, getAuthUserId(user));
  }, [students, user]);

  const stats = useMemo(() => {
    const total = myStudents.length;
    const active = myStudents.filter(s => s.isActive && s.isVerified).length;
    const pending = myStudents.filter(s => s.isActive && !s.isVerified).length;
    const withSubscription = myStudents.filter(s => s.hasActiveSubscription).length;

    let totalProgress = 0;
    let studentsWithRoadmap = 0;

    myStudents.forEach(student => {
      if (student.currentRoadmapId) {
        const roadmap = roadmaps.find(r => r.id === student.currentRoadmapId);
        if (roadmap && roadmap.milestones && roadmap.milestones.length > 0) {
          const completed = roadmap.milestones.filter(m => m.status === RoadmapStepStatus.COMPLETED).length;
          totalProgress += (completed / roadmap.milestones.length) * 100;
          studentsWithRoadmap++;
        }
      }
    });

    const avgProgress = studentsWithRoadmap > 0 ? Math.round(totalProgress / studentsWithRoadmap) : 0;

    return {
      total,
      active,
      pending,
      withSubscription,
      avgProgress
    };
  }, [myStudents, roadmaps]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-between animate-pulse">
        <div>
           <div className="h-4 w-32 bg-slate-200 rounded-lg mb-2" />
           <div className="h-8 w-48 bg-slate-200 rounded-xl" />
        </div>
        <div className="flex gap-4">
           {[...Array(4)].map((_, i) => (
             <div key={i} className="h-16 w-32 bg-slate-100 rounded-2xl" />
           ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      icon: Users,
      label: 'Mentees',
      value: String(stats.total),
      color: 'text-blue-500',
      bg: 'bg-blue-50'
    },
    {
      icon: CheckCircle,
      label: 'Active',
      value: String(stats.active),
      color: 'text-green-500',
      bg: 'bg-green-50'
    },
    {
      icon: Activity,
      label: 'Avg Progress',
      value: `${stats.avgProgress}%`,
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    {
      icon: Award,
      label: 'Subscribed',
      value: String(stats.withSubscription),
      color: 'text-purple-500',
      bg: 'bg-purple-50'
    }
  ];

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[12px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
             <GraduationCap size={12} className="text-primary" /> Directory
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-[12px] font-medium text-slate-400 italic">Mentorship Group</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Mentee Roster
        </h1>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {statCards.map((stat, index) => (
          <div 
            key={index}
            className="flex items-center gap-3 bg-white border border-slate-100 rounded-[20px] px-4 py-2.5 shadow-sm hover:shadow-md transition-all group"
          >
            <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center transition-transform group-hover:scale-110`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                {stat.label}
              </p>
              <p className="text-lg font-black text-slate-900 leading-none">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}