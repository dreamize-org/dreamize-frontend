'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/dashboard/Sidebar';
import { useAuth, useRoadmaps, useUsers, useFinancial } from '@/contexts';
import { useBooking } from '@/contexts/BookingContext';
import { useNavigationWithLoading } from '@/lib/utils/navigation';
import { getAuthUserId } from '@/lib/auth/session';
import { filterStudentsForTrainer } from '@/lib/users/trainerStudents';
import { BookingStatus } from '@/types/booking';
import { 
  Users, 
  CalendarCheck, 
  Wallet,
  ArrowRight,
  TrendingUp,
  Award,
  Zap,
  Star,
  Compass,
  CheckCircle,
  Clock,
  ChevronRight,
  Sparkles,
  Book,
  Sun
} from 'lucide-react';
import { UserRole } from '@/types';

export default function TrainerDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { studentRoadmaps, isLoading: roadmapsLoading } = useRoadmaps();
  const { students, isLoading: usersLoading } = useUsers();
  const { isLoading: financialLoading } = useFinancial();
  const { trainerAllBookings, trainerPendingBookings } = useBooking();
  const { navigate } = useNavigationWithLoading();

  // Redirect if not authenticated or not a trainer
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth/login');
      return;
    }

    if (!authLoading && user && user.role !== 'trainer') {
      const dashboardRoutes: Record<string, string> = {
        'student': '/dashboard/student',
        'admin': '/dashboard/admin',
      };
      navigate(dashboardRoutes[user.role] || '/');
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  const isLoading = authLoading || roadmapsLoading || usersLoading || financialLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-screen lg:h-screen bg-[#FDF9F2]">
        <Sidebar activeItem="Home" userType={UserRole.TRAINER} />
        <div className="flex-1 flex flex-col">
          <div className="h-20 bg-white border-b border-slate-100 animate-pulse"></div>
          <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8">
            <div className="h-10 w-64 bg-slate-100 rounded-[32px] animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-50 rounded-[40px] animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'trainer') {
    return null;
  }

  // Get trainer-specific data
  const trainerStudents = filterStudentsForTrainer(students, getAuthUserId(user));

  const trainerRoadmaps = studentRoadmaps.filter(r => r.trainer._id === user._id);
  const activeRoadmaps = trainerRoadmaps.filter(r => r.status === 'active');
  const pendingProjects = trainerRoadmaps.reduce((count, roadmap) => {
    return count + (roadmap.milestones?.filter(m => 
      m.status === 'pending-approval'
    ).length || 0);
  }, 0);

  const stats = [
    { 
      label: 'Mentees', 
      value: trainerStudents.length, 
      icon: Users, 
      color: 'text-primary', 
      bg: 'bg-primary/10' 
    },
    { 
      label: 'Active Paths', 
      value: activeRoadmaps.length, 
      icon: Compass, 
      color: 'text-primary', 
      bg: 'bg-primary/10' 
    },
    { 
      label: 'Submissions', 
      value: pendingProjects, 
      icon: Zap, 
      color: 'text-primary', 
      bg: 'bg-primary/10' 
    },
    { 
      label: 'Pending Bookings', 
      value: trainerPendingBookings.length, 
      icon: Wallet, 
      color: 'text-primary', 
      bg: 'bg-primary/10' 
    },
  ];

  const quickActions = [
    {
      icon: Compass,
      title: 'Roadmap Architect',
      description: 'Design & refine student learning paths',
      href: '/dashboard/trainer/roadmaps',
      color: 'bg-slate-900',
    },
    {
      icon: Award,
      title: 'Project Review',
      description: 'Audit and grade student submissions',
      href: '/dashboard/trainer/projects',
      color: 'bg-slate-900',
    },
    {
      icon: Users,
      title: 'Mentee Directory',
      description: 'Track student progress & analytics',
      href: '/dashboard/trainer/students',
      color: 'bg-slate-900',
    },
    {
      icon: CalendarCheck,
      title: 'Session Manager',
      description: 'Manage orientations & call bookings',
      href: '/dashboard/trainer/bookings',
      color: 'bg-slate-900',
    }
  ];

  const nextSession = trainerAllBookings
    .filter(
      (booking) =>
        booking.status === BookingStatus.APPROVED &&
        new Date(booking.requestedTime) >= new Date()
    )
    .sort(
      (a, b) => new Date(a.requestedTime).getTime() - new Date(b.requestedTime).getTime()
    )[0];

  const formatSessionTime = (date: Date) =>
    new Date(date).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="flex min-h-screen lg:h-screen bg-[#FDF9F2]">
      <Sidebar activeItem="Home" userType={UserRole.TRAINER} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[12px] font-bold text-primary bg-primary/20 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 border border-primary/10">
                   <Star size={10} className="fill-primary" /> Verified Expert
                </span>
              </div>
              <h1 className="text-2xl font-playfair font-semibold text-slate-900 tracking-tight">
                Trainer Command
              </h1>
            </div>

            <div className="flex items-center gap-4">
               <div className="text-right hidden md:block">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Status</p>
                  <p className="text-sm font-playfair font-semibold text-slate-900">Elite Mentor</p>
               </div>
               <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-primary shadow-xl shadow-slate-900/10 transition-transform hover:scale-105 cursor-pointer">
                  <TrendingUp size={24} />
               </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            
            {/* Hero Banner - Playful Style */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-10 relative pt-[80px] pb-[60px] px-8 bg-slate-900 rounded-[32px] overflow-hidden border border-slate-100"
            >
               {/* Floating Decorative Outline Icons */}
               <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.3]">
                  <motion.div animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }} transition={{ duration: 6, repeat: Infinity }} className="absolute top-20 left-10 text-white">
                    <Star className="w-8 h-8" strokeWidth={1} />
                  </motion.div>
                  <motion.div animate={{ y: [0, 15, 0], rotate: [0, -10, 0] }} transition={{ duration: 8, repeat: Infinity }} className="absolute top-40 right-20 text-white">
                    <Compass className="w-12 h-12" strokeWidth={1} />
                  </motion.div>
                  <motion.div animate={{ y: [0, -15, 0], rotate: [0, 15, 0] }} transition={{ duration: 7, repeat: Infinity }} className="absolute bottom-40 left-32 text-white">
                    <Book className="w-10 h-10" strokeWidth={1} />
                  </motion.div>
                  <motion.div animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }} transition={{ duration: 5, repeat: Infinity }} className="absolute bottom-20 right-40 text-white">
                    <Clock className="w-14 h-14" strokeWidth={1} />
                  </motion.div>
                  <motion.div animate={{ rotate: [0, 20, 0] }} transition={{ duration: 10, repeat: Infinity }} className="absolute top-32 lg:left-1/3 text-white opacity-50">
                    <Sun className="w-8 h-8" strokeWidth={1} />
                  </motion.div>
               </div>
               
               <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                     <Sparkles className="text-primary w-4 h-4" />
                     <span className="text-primary text-[10px] font-bold uppercase tracking-[0.3em]">Knowledge Architect</span>
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-playfair font-semibold text-white mb-4 leading-tight">
                     Good Morning, <br />
                     <span className="relative inline-block px-1">
                        <span className="relative z-20">{user.firstName} {user.lastName}</span>
                        <span className="absolute z-10 inset-0 -top-1 -bottom-1 -left-1 -right-1 bg-primary/30 rounded-[40px] transform -rotate-1"></span>
                     </span>
                  </h2>
                  <p className="text-white/80 font-light max-w-lg leading-relaxed text-sm">
                     Empowering {trainerStudents.length} high-potential students through strategic mentorship and pedagogical excellence.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3 mt-6">
                     <button 
                        onClick={() => navigate('/dashboard/trainer/roadmaps/create')}
                        className="px-6 py-3 bg-primary text-slate-900 rounded-full font-bold text-sm hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                     >
                        New Roadmap Architecture
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                     </button>
                     <div className="bg-white/10 backdrop-blur border border-white/20 rounded-full px-4 py-3 flex items-center justify-between shadow-sm">
                        <div>
                           <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">Queue Status</p>
                           <p className="text-white font-semibold text-sm">{pendingProjects} Pending Audits</p>
                        </div>
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                           <Clock className="text-primary w-4 h-4" />
                        </div>
                     </div>
                  </div>
               </div>
            </motion.div>

            {/* Stats Overview */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <CheckCircle className="text-slate-50 w-6 h-6 group-hover:text-primary/10 transition-colors" />
                  </div>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em]">{stat.label}</p>
                  <div className="flex items-baseline gap-1 mt-1">
                     <p className="text-2xl font-playfair font-semibold text-slate-900">{stat.value}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Management Matrix */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-12"
            >
               <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-playfair font-semibold text-slate-900 flex items-center gap-3">
                    <Zap className="text-primary" />
                    Management Matrix
                  </h2>
                  <div className="h-px bg-slate-100 flex-1 ml-6" />
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {quickActions.map((action) => (
                   <button
                     key={action.title}
                     onClick={() => navigate(action.href)}
                     className="bg-white border border-slate-100 p-6 rounded-[32px] text-left hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all group relative overflow-hidden"
                   >
                     <div className={`w-12 h-12 ${action.color} rounded-[16px] flex items-center justify-center mb-4 shadow-lg shadow-black/5 transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                        <action.icon className="w-6 h-6 text-white" />
                     </div>
                     <h3 className="text-xl font-playfair font-semibold text-slate-900 mb-2 leading-tight">{action.title}</h3>
                     <p className="text-[13px] text-slate-500 font-light leading-relaxed">{action.description}</p>
                     
                     <div className="mt-8 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[11px] font-bold text-primary uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                           Open Console <ChevronRight size={14} />
                        </div>
                        <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-primary transition-colors">
                           <ArrowRight size={16} className="text-slate-300 group-hover:text-slate-900 transition-colors" />
                        </div>
                     </div>
                   </button>
                 ))}
               </div>
            </motion.div>

            {/* Recent Schedule / Activity Widget */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-[40px] p-10 border border-slate-100 flex flex-col lg:flex-row items-center justify-between gap-10 shadow-sm"
            >
               <div className="flex items-center gap-8">
                  <div className="w-20 h-20 bg-primary/10 rounded-[28px] shadow-sm flex items-center justify-center text-primary border border-primary/20 relative">
                     <CalendarCheck size={40} />
                     {trainerPendingBookings.length > 0 && (
                       <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center border-4 border-white text-[10px] font-bold text-slate-900">
                         {trainerPendingBookings.length}
                       </div>
                     )}
                  </div>
                  <div>
                     <p className="text-[11px] font-bold text-primary uppercase tracking-[0.3em] mb-1">Next Session</p>
                     {nextSession ? (
                       <>
                         <h4 className="text-2xl font-playfair font-semibold text-slate-900">
                           {nextSession.student.firstName} {nextSession.student.lastName}
                         </h4>
                         <p className="text-slate-500 text-sm font-light mt-1">
                           {formatSessionTime(nextSession.requestedTime)}
                           {nextSession.sessionFormat === 'online' ? ' • Zoom session' : ' • In-person'}
                         </p>
                       </>
                     ) : trainerPendingBookings.length > 0 ? (
                       <>
                         <h4 className="text-2xl font-playfair font-semibold text-slate-900">
                           {trainerPendingBookings.length} pending request{trainerPendingBookings.length !== 1 ? 's' : ''}
                         </h4>
                         <p className="text-slate-500 text-sm font-light mt-1">Review and approve booking requests</p>
                       </>
                     ) : (
                       <>
                         <h4 className="text-2xl font-playfair font-semibold text-slate-900">No upcoming sessions</h4>
                         <p className="text-slate-500 text-sm font-light mt-1">Approved sessions will appear here</p>
                       </>
                     )}
                  </div>
               </div>
               <div className="flex items-center gap-4 w-full lg:w-auto">
                  {nextSession?.sessionLocation && nextSession.sessionFormat === 'online' ? (
                    <a
                      href={nextSession.sessionLocation}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 lg:flex-none px-8 py-4 bg-slate-900 text-white rounded-full font-bold text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 text-center"
                    >
                       Join Call
                    </a>
                  ) : (
                    <button
                      onClick={() => navigate('/dashboard/trainer/bookings')}
                      className="flex-1 lg:flex-none px-8 py-4 bg-slate-900 text-white rounded-full font-bold text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10"
                    >
                       {trainerPendingBookings.length > 0 ? 'Review Bookings' : 'Open Bookings'}
                    </button>
                  )}
                  <button
                    onClick={() => navigate('/dashboard/trainer/bookings')}
                    className="flex-1 lg:flex-none px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-full font-semibold text-sm hover:bg-slate-50 transition-all"
                  >
                     All Sessions
                  </button>
               </div>
            </motion.div>

            <div className="mt-16 text-center">
               <p className="text-slate-300 text-[12px] font-bold tracking-[0.4em] uppercase">© Dreamize Trainer OS v4.2.0-platinum</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}