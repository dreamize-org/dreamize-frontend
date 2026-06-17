'use client';

import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { Booking, BookingStatus } from '@/types/booking';
import { UserRole } from '@/types/user';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  AlertCircle,
  Hourglass,
  XCircle,
  RefreshCw,
  User,
} from 'lucide-react';
import { useBooking } from '@/contexts/BookingContext';
import { useNavigationWithLoading } from '@/lib/utils/navigation';

function getStatusBadge(status: BookingStatus) {
  switch (status) {
    case BookingStatus.PENDING:
      return { text: 'Pending Approval', color: 'bg-yellow-100 text-yellow-800' };
    case BookingStatus.APPROVED:
      return { text: 'Approved', color: 'bg-green-100 text-green-800' };
    case BookingStatus.REJECTED:
      return { text: 'Rejected', color: 'bg-red-100 text-red-800' };
    case BookingStatus.COMPLETED:
      return { text: 'Completed', color: 'bg-blue-100 text-blue-800' };
    case BookingStatus.CANCELLED:
      return { text: 'Cancelled', color: 'bg-slate-100 text-slate-700' };
    default:
      return { text: status, color: 'bg-slate-100 text-slate-700' };
  }
}

function getSessionTiming(session: Booking) {
  const now = new Date();
  const sessionTime = new Date(session.requestedTime);

  if (session.status === BookingStatus.COMPLETED || sessionTime < now) {
    return { text: 'Past Session', color: 'bg-slate-100 text-slate-700' };
  }

  const hoursUntil = Math.floor((sessionTime.getTime() - now.getTime()) / (1000 * 60 * 60));
  if (hoursUntil <= 24) {
    return { text: 'Today', color: 'bg-green-100 text-green-700' };
  }
  if (hoursUntil <= 72) {
    return { text: 'This Week', color: 'bg-blue-100 text-blue-700' };
  }
  return { text: 'Upcoming', color: 'bg-yellow-100 text-yellow-700' };
}

export default function StudentCalendarPage() {
  const { studentBookings: sessions, loading, error, cancelBooking, refreshBookings } = useBooking();
  const { navigate } = useNavigationWithLoading();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const formatTime = (date: Date) =>
    new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

  const handleCancel = async (bookingId: string) => {
    setCancellingId(bookingId);
    try {
      await cancelBooking(bookingId);
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen lg:h-screen bg-[#FDF9F2]">
        <Sidebar activeItem="Sessions & Calendar" userType={UserRole.STUDENT} />
        <div className="flex-1 flex flex-col">
          <div className="h-16 bg-slate-100 animate-pulse" />
          <div className="flex-1 p-8 space-y-6">
            <div className="h-8 bg-slate-200 rounded-xl animate-pulse" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-200 rounded-[32px] animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const approvedSessions = sessions.filter((session) => session.status === BookingStatus.APPROVED);
  const otherSessions = sessions.filter((session) => session.status !== BookingStatus.APPROVED);

  return (
    <div className="flex min-h-screen lg:h-screen bg-[#FDF9F2]">
      <Sidebar activeItem="Sessions & Calendar" userType={UserRole.STUDENT} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-100 px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-playfair font-semibold text-slate-900">My Sessions</h1>
              <p className="text-slate-500 font-light">Orientation requests and approved mentorship sessions</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500 hidden sm:inline">
                {sessions.length} booking{sessions.length !== 1 ? 's' : ''}
              </span>
              <button
                onClick={refreshBookings}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-auto">
          {error && (
            <div className="mb-6 flex items-start gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-playfair font-semibold text-slate-900 mb-2">No Sessions Yet</h3>
              <p className="text-slate-500 font-light mb-6 max-w-md mx-auto">
                Book an orientation session from your dashboard after completing orientation payment.
              </p>
              <button
                onClick={() => navigate('/dashboard/student')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {otherSessions.length > 0 && (
                <section>
                  <h2 className="text-lg font-playfair font-semibold text-slate-900 mb-4">Booking Requests</h2>
                  <div className="space-y-4">
                    {otherSessions.map((session) => {
                      const status = getStatusBadge(session.status);
                      return (
                        <div
                          key={session.id}
                          className="bg-white border border-slate-100 rounded-[32px] p-6"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                  {status.text}
                                </span>
                                {session.status === BookingStatus.PENDING && (
                                  <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                                    <Hourglass className="w-3 h-3" />
                                    Awaiting trainer response
                                  </span>
                                )}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-slate-400" />
                                  <span className="text-sm text-slate-600">
                                    {formatDate(session.requestedTime)} at {formatTime(session.requestedTime)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-slate-400" />
                                  <span className="text-sm text-slate-600">
                                    {session.trainer.firstName} {session.trainer.lastName}
                                  </span>
                                </div>
                              </div>

                              <p className="text-sm text-slate-600 font-light bg-slate-50 rounded-xl p-3">
                                {session.learningGoals}
                              </p>

                              {session.status === BookingStatus.REJECTED && session.rejectionReason && (
                                <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <XCircle className="w-4 h-4 text-red-500" />
                                    <span className="text-sm font-medium text-red-700">Rejection Reason</span>
                                  </div>
                                  <p className="text-sm text-red-600">{session.rejectionReason}</p>
                                </div>
                              )}
                            </div>

                            {session.status === BookingStatus.PENDING && (
                              <button
                                onClick={() => handleCancel(session.id)}
                                disabled={cancellingId === session.id}
                                className="px-4 py-2 text-sm border border-slate-200 text-slate-700 rounded-full hover:bg-slate-50 disabled:opacity-60"
                              >
                                {cancellingId === session.id ? 'Cancelling...' : 'Cancel Request'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              <section>
                <h2 className="text-lg font-playfair font-semibold text-slate-900 mb-4">
                  Approved Sessions ({approvedSessions.length})
                </h2>
                {approvedSessions.length === 0 ? (
                  <div className="rounded-[32px] border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500 font-light">
                    Approved sessions will appear here once your trainer confirms a booking.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {approvedSessions.map((session) => {
                      const timing = getSessionTiming(session);
                      return (
                        <div
                          key={session.id}
                          className="bg-white border border-slate-100 rounded-[32px] p-6 hover:shadow-xl transition-all"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                  <Video className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                  <h3 className="font-playfair font-semibold text-slate-900">Mentorship Session</h3>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${timing.color}`}>
                                      {timing.text}
                                    </span>
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      Approved
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-slate-400" />
                                  <span className="text-sm text-slate-600">
                                    {formatDate(session.requestedTime)} at {formatTime(session.requestedTime)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-slate-400" />
                                  <span className="text-sm text-slate-600">
                                    Duration: {session.sessionDuration ?? 60} minutes
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-slate-400" />
                                  <span className="text-sm text-slate-600">
                                    {session.sessionFormat === 'online' ? 'Online Session' : 'In-Person'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-slate-400" />
                                  <span className="text-sm text-slate-600">
                                    {session.trainer.firstName} {session.trainer.lastName}
                                  </span>
                                </div>
                              </div>

                              {session.approvalNotes && (
                                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-4">
                                  <p className="text-sm text-slate-700 font-light mb-2">{session.approvalNotes}</p>
                                  {session.sessionLocation && (
                                    <div className="mt-3 pt-3 border-t border-primary/20">
                                    <p className="text-sm font-medium text-primary mb-1">
                                      {session.sessionFormat === 'online' ? 'Zoom Meeting Link' : 'Location'}
                                    </p>
                                      {session.sessionFormat === 'online' ? (
                                        <a
                                          href={session.sessionLocation}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-sm text-primary hover:text-primary/80 underline break-all"
                                        >
                                          {session.sessionLocation}
                                        </a>
                                      ) : (
                                        <p className="text-sm text-slate-700">{session.sessionLocation}</p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}

                              {session.preparationRequirements && (
                                <div className="mb-4 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                                  <p className="text-sm font-medium text-slate-700 mb-1">Preparation Required</p>
                                  <p className="text-sm text-slate-700 font-light">{session.preparationRequirements}</p>
                                </div>
                              )}

                              {session.nextSteps && (
                                <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                                  <p className="text-sm font-medium text-slate-700 mb-1">Next Steps</p>
                                  <p className="text-sm text-slate-700 font-light">{session.nextSteps}</p>
                                </div>
                              )}
                            </div>

                            {new Date(session.requestedTime) > new Date() && session.sessionLocation && (
                              <a
                                href={session.sessionLocation}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors text-sm whitespace-nowrap"
                              >
                                Join Session
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
