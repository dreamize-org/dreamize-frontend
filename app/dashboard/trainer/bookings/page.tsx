'use client';

import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { useBooking } from '@/contexts/BookingContext';
import { BookingStatus, TrainerApprovalRequest, Booking } from '@/types/booking';
import { UserRole } from '@/types/user';
import { Calendar, Clock, User, MessageSquare, CheckCircle, XCircle, AlertCircle, Filter, Search, RefreshCw, Video, MapPin, FileText } from 'lucide-react';

export default function TrainerBookingsPage() {
  const { 
    trainerPendingBookings, 
    trainerAllBookings, 
    loading, 
    error, 
    approveBooking, 
    rejectBooking, 
    refreshBookings 
  } = useBooking();
  
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [rejectingBooking, setRejectingBooking] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Approval modal state
  const [approvingBooking, setApprovingBooking] = useState<string | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approvalData, setApprovalData] = useState<TrainerApprovalRequest>({
    approvalNotes: '',
    sessionDuration: 60, // default 60 minutes
    sessionFormat: 'online',
    sessionLocation: '',
    preparationRequirements: '',
    nextSteps: ''
  });

  const getStudentName = (student: Booking['student']) =>
    `${student.firstName} ${student.lastName}`.trim() || 'Unknown Student';

  const getStudentEmail = (student: Booking['student']) => student.email || 'unknown@example.com';

  const handleApprove = async (bookingId: string) => {
    setApprovingBooking(bookingId);
    setApprovalData({
      approvalNotes: '',
      sessionDuration: 60,
      sessionFormat: 'online',
      sessionLocation: '',
      preparationRequirements: '',
      nextSteps: ''
    });
    setShowApproveModal(true);
  };

  const handleConfirmApprove = async () => {
    if (!approvingBooking || !approvalData.approvalNotes.trim() || !approvalData.sessionLocation.trim()) return;
    
    try {
      await approveBooking(approvingBooking, approvalData);
      setShowApproveModal(false);
      setApprovingBooking(null);
    } catch (err) {
      console.error('Failed to approve booking:', err);
    }
  };

  const closeApproveModal = () => {
    setShowApproveModal(false);
    setApprovingBooking(null);
    setApprovalData({
      approvalNotes: '',
      sessionDuration: 60,
      sessionFormat: 'online',
      sessionLocation: '',
      preparationRequirements: '',
      nextSteps: ''
    });
  };

  const handleReject = async () => {
    if (!rejectingBooking || !rejectionReason.trim()) return;
    
    try {
      await rejectBooking(rejectingBooking, rejectionReason.trim());
      setShowRejectModal(false);
      setRejectingBooking(null);
      setRejectionReason('');
    } catch (err) {
      console.error('Failed to reject booking:', err);
    }
  };

  const openRejectModal = (bookingId: string) => {
    setRejectingBooking(bookingId);
    setShowRejectModal(true);
    setRejectionReason('');
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setRejectingBooking(null);
    setRejectionReason('');
  };

  const filteredBookings = (activeTab === 'pending' ? trainerPendingBookings : trainerAllBookings).filter(booking => {
    const matchesSearch = getStudentName(booking.student).toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getStudentEmail(booking.student).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.PENDING:
        return 'bg-primary/10 text-primary border-primary/20';
      case BookingStatus.APPROVED:
        return 'bg-green-100 text-green-800 border-green-200';
      case BookingStatus.REJECTED:
        return 'bg-red-100 text-red-800 border-red-200';
      case BookingStatus.COMPLETED:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case BookingStatus.CANCELLED:
        return 'bg-slate-100 text-slate-800 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen lg:h-screen bg-white">
        <Sidebar activeItem="Bookings" userType={UserRole.TRAINER} />
        <div className="flex-1 flex flex-col">
          <div className="h-16 bg-gray-100 animate-pulse"></div>
          <div className="flex-1 p-6 space-y-6">
            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen lg:h-screen bg-[#FDF9F2]">
      <Sidebar activeItem="Bookings" userType={UserRole.TRAINER} />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-slate-100 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-playfair font-semibold text-slate-900">Booking Management</h1>
              <p className="text-slate-500 font-light">Manage student booking requests</p>
            </div>
            <button
              onClick={refreshBookings}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-auto">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="mb-8">
            <div className="flex gap-4 border-b border-slate-100">
              <button
                onClick={() => setActiveTab('pending')}
                className={`pb-3 px-1 font-medium text-sm transition-colors ${
                  activeTab === 'pending'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Pending ({trainerPendingBookings.length})
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`pb-3 px-1 font-medium text-sm transition-colors ${
                  activeTab === 'all'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                All Bookings ({trainerAllBookings.length})
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-8 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by student name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary/20 focus:ring-0 transition-all outline-none"
                />
              </div>
            </div>
            {activeTab === 'all' && (
              <div className="sm:w-48">
                <div className="relative">
                  <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as BookingStatus | 'all')}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary/20 focus:ring-0 transition-all outline-none appearance-none cursor-pointer text-slate-700"
                  >
                    <option value="all">All Status</option>
                    <option value={BookingStatus.PENDING}>Pending</option>
                    <option value={BookingStatus.APPROVED}>Approved</option>
                    <option value={BookingStatus.REJECTED}>Rejected</option>
                    <option value={BookingStatus.COMPLETED}>Completed</option>
                    <option value={BookingStatus.CANCELLED}>Cancelled</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Bookings List */}
          <div className="space-y-4">
            {filteredBookings.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-playfair font-semibold text-slate-900 mb-2">No bookings found</h3>
                <p className="text-slate-500 font-light">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your filters' 
                    : activeTab === 'pending' 
                    ? 'No pending booking requests' 
                    : 'No bookings yet'}
                </p>
              </div>
            ) : (
              filteredBookings.map((booking) => (
                <div key={booking.id} className="bg-white border border-slate-100 rounded-[32px] p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Student Info */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-900">{getStudentName(booking.student)}</h3>
                          <p className="text-sm text-slate-500">{getStudentEmail(booking.student)}</p>
                        </div>
                      </div>

                      {/* Booking Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-600">
                            {formatDate(booking.requestedTime)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </div>
                        </div>
                      </div>

                      {/* Learning Goals */}
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-medium text-slate-700">Learning Goals</span>
                        </div>
                        <p className="text-sm text-slate-600 font-light bg-slate-50 rounded-xl p-3">
                          {booking.learningGoals}
                        </p>
                      </div>

                      {/* Rejection Reason */}
                      {booking.status === BookingStatus.REJECTED && booking.rejectionReason && (
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <XCircle className="w-4 h-4 text-red-500" />
                            <span className="text-sm font-medium text-red-700">Rejection Reason</span>
                          </div>
                          <p className="text-sm text-red-600 font-light bg-red-50 rounded-xl p-3">
                            {booking.rejectionReason}
                          </p>
                        </div>
                      )}

                      {/* Approval Details */}
                      {booking.status === BookingStatus.APPROVED && (
                        <div className="mb-4 space-y-4">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm font-medium text-green-700">Session Details</span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-slate-400" />
                              <span className="text-sm text-slate-600">
                                Duration: {booking.sessionDuration} minutes
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Video className="w-4 h-4 text-slate-400" />
                              <span className="text-sm text-slate-600">
                                Format: {booking.sessionFormat}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-slate-400" />
                              <span className="text-sm text-slate-600">
                                Location: {booking.sessionLocation}
                              </span>
                            </div>
                          </div>

                          {booking.approvalNotes && (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <MessageSquare className="w-4 h-4 text-slate-400" />
                                <span className="text-sm font-medium text-slate-700">Approval Notes</span>
                              </div>
                              <p className="text-sm text-slate-600 font-light bg-green-50 rounded-xl p-3">
                                {booking.approvalNotes}
                              </p>
                            </div>
                          )}

                          {booking.preparationRequirements && (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <FileText className="w-4 h-4 text-slate-400" />
                                <span className="text-sm font-medium text-slate-700">Preparation Requirements</span>
                              </div>
                              <p className="text-sm text-slate-600 font-light bg-blue-50 rounded-xl p-3">
                                {booking.preparationRequirements}
                              </p>
                            </div>
                          )}

                          {booking.nextSteps && (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="w-4 h-4 text-slate-400" />
                                <span className="text-sm font-medium text-slate-700">Next Steps</span>
                              </div>
                              <p className="text-sm text-slate-600 font-light bg-primary/5 rounded-xl p-3">
                                {booking.nextSteps}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="ml-4">
                      {booking.status === BookingStatus.PENDING && (
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleApprove(booking.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => openRejectModal(booking.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-full hover:bg-red-100 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-[32px] max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-playfair font-semibold text-slate-900 mb-4">Reject Booking Request</h3>
            <p className="text-sm text-slate-600 font-light mb-4">
              Please provide a reason for rejecting this booking request. This will be shared with the student.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:bg-white focus:border-primary/20 focus:ring-0 transition-all outline-none resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={closeRejectModal}
                className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-full hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reject Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-[32px] max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-playfair font-semibold text-slate-900 mb-4">Approve Booking Request</h3>
            <p className="text-sm text-slate-600 font-light mb-6">
              Provide session details and guidance for the student. This information will help them prepare for the orientation session.
            </p>
            
            <div className="space-y-4">
              {/* Session Format */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Session Format</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="online"
                      checked={approvalData.sessionFormat === 'online'}
                      onChange={() => setApprovalData({...approvalData, sessionFormat: 'online'})}
                      className="mr-2"
                    />
                    <span className="text-sm text-slate-700">Online</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="in-person"
                      checked={approvalData.sessionFormat === 'in-person'}
                      onChange={() => setApprovalData({...approvalData, sessionFormat: 'in-person'})}
                      className="mr-2"
                    />
                    <span className="text-sm text-slate-700">In-Person</span>
                  </label>
                </div>
              </div>

              {/* Session Duration */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Session Duration (minutes)</label>
                <input
                  type="number"
                  min="30"
                  max="180"
                  value={approvalData.sessionDuration}
                  onChange={(e) => setApprovalData({...approvalData, sessionDuration: parseInt(e.target.value) || 60})}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:bg-white focus:border-primary/20 focus:ring-0 transition-all outline-none"
                />
              </div>

              {/* Session Location */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {approvalData.sessionFormat === 'online' ? 'Meeting Link' : 'Location'}
                </label>
                <input
                  type="text"
                  value={approvalData.sessionLocation}
                  onChange={(e) => setApprovalData({...approvalData, sessionLocation: e.target.value})}
                  placeholder={approvalData.sessionFormat === 'online' ? 'https://zoom.us/j/...' : 'Enter physical address'}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:bg-white focus:border-primary/20 focus:ring-0 transition-all outline-none"
                />
              </div>

              {/* Approval Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Approval Notes</label>
                <textarea
                  value={approvalData.approvalNotes}
                  onChange={(e) => setApprovalData({...approvalData, approvalNotes: e.target.value})}
                  placeholder="Share your thoughts about this booking request..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:bg-white focus:border-primary/20 focus:ring-0 transition-all outline-none resize-none"
                />
              </div>

              {/* Preparation Requirements */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Preparation Requirements</label>
                <textarea
                  value={approvalData.preparationRequirements}
                  onChange={(e) => setApprovalData({...approvalData, preparationRequirements: e.target.value})}
                  placeholder="What should the student prepare before the session?"
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:bg-white focus:border-primary/20 focus:ring-0 transition-all outline-none resize-none"
                />
              </div>

              {/* Next Steps */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Next Steps</label>
                <textarea
                  value={approvalData.nextSteps}
                  onChange={(e) => setApprovalData({...approvalData, nextSteps: e.target.value})}
                  placeholder="What should the student do after this session?"
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:bg-white focus:border-primary/20 focus:ring-0 transition-all outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeApproveModal}
                className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-full hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApprove}
                disabled={!approvalData.approvalNotes.trim() || !approvalData.sessionLocation.trim()}
                className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Approve Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
