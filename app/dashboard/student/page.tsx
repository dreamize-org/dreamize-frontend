'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Lock, CreditCard, Calendar, BookOpen, ArrowRight, Zap, Star, Trophy, Target } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigationWithLoading } from '@/lib/utils/navigation';
import { OnboardingChecklist, UserRole } from '@/types';
import BookingCalendar from '@/components/booking/BookingCalendar';
import Sidebar from '@/components/dashboard/Sidebar';

export default function StudentDashboard() {
  const { user, isAuthenticated, isLoading: authLoading, onboardingChecklist } = useAuth();
  const { navigate } = useNavigationWithLoading();

  // Modal states
  const [showBookingCalendar, setShowBookingCalendar] = useState(false);

  // Redirect if not authenticated or not a student
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth/login');
      return;
    }

    if (!authLoading && user && user.role !== 'student') {
      navigate('/dashboard/trainer');
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="flex min-h-screen lg:h-screen bg-white">
        <Sidebar activeItem="Home" userType={UserRole.STUDENT} />
        <div className="flex-1 flex flex-col">
          <div className="h-20 bg-slate-50 border-b border-slate-100 animate-pulse"></div>
          <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8">
            <div className="h-10 w-64 bg-slate-100 rounded-lg animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-50 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Don't render if user is not authenticated or not a student
  if (!user || user.role !== 'student' || !onboardingChecklist) {
    return null;
  }

  // Calculate overall progress
  const completedSteps = Object.values(onboardingChecklist).filter(Boolean).length;
  const totalSteps = Object.keys(onboardingChecklist).length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  return (
    <div className="flex min-h-screen lg:h-screen bg-[#FDF9F2]">
      <Sidebar
        activeItem="Home"
        userType={UserRole.STUDENT}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 pl-16 pr-4 sm:px-6 lg:px-8 py-4 sm:py-5 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[12px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Student Portal</span>
                <span className="text-slate-300">•</span>
                <span className="text-[12px] font-medium text-slate-400 italic">Level 1 Mentee</span>
              </div>
              <h1 className="text-3xl font-playfair font-semibold text-slate-900 flex items-center gap-2">
                Welcome back, {user.firstName}
                <span className="animate-bounce">👋</span>
              </h1>
            </div>

            <div className="flex items-center gap-3">
               {!onboardingChecklist.bookingPayed && (
                <button
                  onClick={() => navigate('/dashboard/student/pay/orientation')}
                  className="px-6 py-2.5 bg-slate-900 text-white rounded-full font-bold text-[14px] hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 flex items-center gap-2 group"
                >
                  <CreditCard className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  Complete Orientation
                </button>
              )}

              {onboardingChecklist.bookingPayed && !onboardingChecklist.subscriptionPayed && (
                <button
                  onClick={() => navigate('/dashboard/student/pay/subscription')}
                  className="px-6 py-2.5 bg-slate-900 text-white rounded-full font-bold text-[14px] hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 flex items-center gap-2 group"
                >
                  <Zap className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                  Activate Full Access
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 pl-16 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            
            {/* Top Grid: Progress & Featured Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
              {/* Progress Card */}
              <div className="lg:col-span-2 bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                  <Trophy size={160} />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                      <Target size={24} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Your Learning Progress</h2>
                      <p className="text-sm text-slate-500 font-light">Complete steps to unlock your personalized roadmap</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-end justify-between">
                      <div>
                        <span className="text-4xl font-black text-slate-900">{Math.round(progressPercentage)}%</span>
                        <span className="text-slate-400 ml-2 font-medium">Completed</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-slate-600 italic">{completedSteps} of {totalSteps} Tasks</span>
                      </div>
                    </div>
                    
                    <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1) shadow-[0_0_20px_rgba(205,164,41,0.4)]"
                        style={{ width: `${progressPercentage}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Card */}
              <div className="bg-slate-900 rounded-[32px] p-8 border border-slate-800 shadow-xl relative overflow-hidden">
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
                <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                  <Star className="text-primary w-5 h-5 fill-primary" />
                  Upcoming Session
                </h3>
                
                {!onboardingChecklist.orientationBooked ? (
                  <div className="space-y-4">
                    <p className="text-slate-400 text-sm leading-relaxed font-light italic">
                      Schedule your orientation to meet your mentor and start your path.
                    </p>
                    {onboardingChecklist.bookingPayed ? (
                      <button 
                        onClick={() => setShowBookingCalendar(true)}
                        className="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm hover:scale-[1.02] transition-transform"
                      >
                        Book Now
                      </button>
                    ) : (
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                        <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Locked</span>
                        <p className="text-white text-sm mt-1">Complete payment first</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                     <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                        <Calendar className="text-primary w-6 h-6" />
                        <div>
                          <p className="text-white font-bold">Orientation Call</p>
                          <p className="text-slate-400 text-xs">Confirmed • Zoom Link in Email</p>
                        </div>
                     </div>
                  </div>
                )}
              </div>
            </div>

            {/* Onboarding Checklist - Grid Layout */}
            <div className="mb-12">
              <h2 className="text-2xl font-playfair font-semibold text-slate-900 mb-6 ml-1 flex items-center gap-2">
                Journey Checklist
                <div className="h-px bg-slate-100 flex-1 ml-4" />
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { key: 'accountCreated', label: 'Account Set Up', description: 'Personalize your profile' },
                  { key: 'bookingPayed', label: 'Orientation Access', description: 'Activation of roadmap path' },
                  { key: 'orientationBooked', label: 'Mentor Meeting', description: 'Booked your first session' },
                  { key: 'subscriptionPayed', label: 'Premium Membership', description: 'Full access to all content' },
                  { key: 'roadmapReceived', label: 'Roadmap Blueprint', description: 'Your custom learning path' },
                  { key: 'learningStarted', label: 'Kickstart Learning', description: 'First milestone achieved' },
                ].map((step, idx) => {
                  const isDone = onboardingChecklist[step.key as keyof OnboardingChecklist];
                  return (
                    <div
                      key={step.key}
                      className={`group p-6 rounded-3xl border transition-all duration-300 relative overflow-hidden ${
                        isDone 
                        ? 'bg-white border-primary/20 shadow-lg shadow-primary/5' 
                        : 'bg-white/50 border-slate-100 opacity-80'
                      }`}
                    >
                      <div className="flex items-start gap-4 relative z-10">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-sm ${
                          isDone ? 'bg-primary text-white shadow-primary/20' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {isDone ? <CheckCircle size={20} /> : <Lock size={20} />}
                        </div>
                        <div className="flex-1">
                          <h3 className={`text-[15px] font-playfair font-semibold ${isDone ? 'text-slate-900' : 'text-slate-400'}`}>{step.label}</h3>
                          <p className="text-[13px] text-slate-500 font-light mt-0.5">{step.description}</p>
                        </div>
                        <div className="text-slate-200 font-black text-2xl group-hover:text-primary/10 transition-colors">
                          0{idx + 1}
                        </div>
                      </div>
                      
                      {isDone && (
                        <div className="absolute bottom-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Zap size={40} className="text-primary/5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions - Modernized */}
            <div className="bg-slate-900 rounded-[40px] p-10 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[120px] rounded-full -mr-48 -mt-48" />
               
               <div className="relative z-10">
                  <h2 className="text-2xl font-playfair font-semibold text-white mb-8">Priority Actions</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {!onboardingChecklist.bookingPayed && (
                      <button
                        onClick={() => navigate('/dashboard/student/pay/orientation')}
                        className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-[32px] p-6 transition-all group text-left"
                      >
                        <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <CreditCard className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-white font-playfair font-semibold mb-1">Pay Fee</h3>
                        <p className="text-slate-500 text-sm font-light">Start your roadmap path</p>
                        <div className="mt-4 flex items-center text-primary text-xs font-bold gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          GO TO PAYMENT <ArrowRight size={14} />
                        </div>
                      </button>
                    )}

                    {onboardingChecklist.bookingPayed && !onboardingChecklist.orientationBooked && (
                      <button
                        onClick={() => setShowBookingCalendar(true)}
                        className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-[32px] p-6 transition-all group text-left"
                      >
                        <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Calendar className="w-6 h-6 text-blue-400" />
                        </div>
                        <h3 className="text-white font-playfair font-semibold mb-1">Book Meeting</h3>
                        <p className="text-slate-500 text-sm font-light">Talk to your mentor</p>
                        <div className="mt-4 flex items-center text-blue-400 text-xs font-bold gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          OPEN CALENDAR <ArrowRight size={14} />
                        </div>
                      </button>
                    )}

                    {onboardingChecklist.orientationBooked && !onboardingChecklist.subscriptionPayed && (
                      <button
                        onClick={() => navigate('/dashboard/student/pay/subscription')}
                        className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-[32px] p-6 transition-all group text-left"
                      >
                        <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Zap className="w-6 h-6 text-purple-400" />
                        </div>
                        <h3 className="text-white font-playfair font-semibold mb-1">Upgrade Now</h3>
                        <p className="text-slate-500 text-sm font-light">Unlock all features</p>
                        <div className="mt-4 flex items-center text-purple-400 text-xs font-bold gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          BECOME PREMIUM <ArrowRight size={14} />
                        </div>
                      </button>
                    )}

                    <button
                      onClick={() => navigate('/dashboard/student/roadmap')}
                      disabled={!onboardingChecklist.roadmapReceived}
                      className={`border rounded-[32px] p-6 transition-all group text-left ${
                        onboardingChecklist.roadmapReceived 
                        ? 'bg-white/5 hover:bg-white/10 border-white/10' 
                        : 'bg-black/20 border-white/5 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${
                        onboardingChecklist.roadmapReceived ? 'bg-green-500/20' : 'bg-slate-800'
                      }`}>
                        <BookOpen className={`w-6 h-6 ${onboardingChecklist.roadmapReceived ? 'text-green-400' : 'text-slate-600'}`} />
                      </div>
                      <h3 className="text-white font-playfair font-semibold mb-1">My Roadmap</h3>
                      <p className="text-slate-500 text-sm font-light">View your blueprint</p>
                    </button>
                  </div>
               </div>
            </div>

            <div className="mt-12 text-center">
               <p className="text-slate-400 text-[13px] font-medium tracking-widest uppercase italic">© Dreamize Africa 2025 • Empowering Talent</p>
            </div>

          </div>
        </main>
      </div>

      {/* Modals */}
      {showBookingCalendar && (
        <BookingCalendar
          onClose={() => setShowBookingCalendar(false)}
          onSuccess={() => setShowBookingCalendar(false)}
        />
      )}
    </div>
  );
}