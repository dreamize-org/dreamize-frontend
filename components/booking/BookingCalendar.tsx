'use client';

import { useState } from 'react';
import { X, Calendar, Clock, User, CheckCircle, MessageSquare, AlertCircle } from 'lucide-react';
import { useUsers } from '@/contexts';
import { Trainer, StudentBookingRequest } from '@/types';
import { useCreateBooking } from '@/hooks/useBooking';

interface BookingCalendarProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function BookingCalendar({ onClose, onSuccess }: BookingCalendarProps) {
  const { trainers } = useUsers();
  const { createBooking, isLoading, error } = useCreateBooking();
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [learningGoals, setLearningGoals] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [bookingStep, setBookingStep] = useState<'select' | 'confirm' | 'submitting' | 'success'>('select');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTrainer || !selectedDate || !selectedTime || !learningGoals.trim()) {
      setSubmitError('Please fill in all fields');
      return;
    }

    setSubmitError('');
    setBookingStep('submitting');

    const bookingRequest: StudentBookingRequest = {
      trainerId: selectedTrainer._id,
      requestedTime: new Date(`${selectedDate}T${selectedTime}`),
      learningGoals: learningGoals.trim(),
    };

    try {
      await createBooking(bookingRequest);
      setBookingStep('success');
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Booking failed. Please try again.');
      setBookingStep('confirm');
    }
  };

  const handleClose = () => {
    if (bookingStep !== 'submitting') {
      onClose();
    }
  };

  const canProceed = selectedTrainer && selectedDate && selectedTime && learningGoals.trim();
  const displayError = submitError || error;

  if (bookingStep === 'submitting') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-[32px] max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <h3 className="text-lg font-playfair font-semibold text-slate-900 mb-2">Booking Orientation Session</h3>
          <p className="text-slate-500 font-light">Please wait while we submit your request...</p>
        </div>
      </div>
    );
  }

  if (bookingStep === 'success') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-[32px] max-w-md w-full p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-playfair font-semibold text-slate-900 mb-2">Request Submitted!</h3>
            <p className="text-slate-500 font-light mb-4">
              Your mentor will review and confirm your orientation session.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-left">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700">
                    Trainer: {selectedTrainer?.firstName} {selectedTrainer?.lastName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700">
                    Date:{' '}
                    {selectedDate
                      ? new Date(selectedDate).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })
                      : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700">Time: {selectedTime}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onSuccess}
              className="w-full bg-slate-900 text-white py-3 rounded-full font-medium hover:bg-slate-800 transition-colors mt-6"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[32px] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-playfair font-semibold text-slate-900">Book Orientation Session</h2>
            <p className="text-sm text-slate-500 font-light mt-1">Choose a mentor and preferred time</p>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {displayError && (
            <div className="mb-6 flex items-start gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{displayError}</span>
            </div>
          )}

          {bookingStep === 'select' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-slate-900 mb-4">Choose Your Mentor</h3>
                {trainers.length === 0 ? (
                  <div className="text-center py-8 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-slate-500 font-light">No available trainers at this time.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {trainers.map((trainer) => (
                      <button
                        type="button"
                        key={trainer._id}
                        className={`w-full text-left p-4 border rounded-2xl transition-colors ${
                          selectedTrainer?._id === trainer._id
                            ? 'border-primary bg-primary/5'
                            : 'border-slate-100 hover:border-slate-200'
                        }`}
                        onClick={() => setSelectedTrainer(trainer)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-slate-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-slate-900">
                              {trainer.firstName} {trainer.lastName}
                            </h4>
                            <p className="text-sm text-slate-500">
                              {trainer.experience.yearsOfExperience} years experience
                            </p>
                            <p className="text-sm text-slate-500">
                              Specializations: {trainer.experience.specializations.join(', ')}
                            </p>
                          </div>
                          {selectedTrainer?._id === trainer._id && (
                            <CheckCircle className="w-5 h-5 text-primary" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedTrainer && (
                <div>
                  <h3 className="font-medium text-slate-900 mb-3">Select Date</h3>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary/20 focus:ring-0 transition-all outline-none"
                  />
                </div>
              )}

              {selectedTrainer && selectedDate && (
                <div>
                  <h3 className="font-medium text-slate-900 mb-3">Select Time</h3>
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary/20 focus:ring-0 transition-all outline-none"
                  />
                </div>
              )}

              {selectedTrainer && selectedDate && selectedTime && (
                <div>
                  <h3 className="font-medium text-slate-900 mb-3">Your Learning Goals</h3>
                  <textarea
                    value={learningGoals}
                    onChange={(e) => setLearningGoals(e.target.value)}
                    placeholder="Tell your mentor what you want to learn and achieve..."
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary/20 focus:ring-0 transition-all outline-none resize-none"
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-full font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setBookingStep('confirm')}
                  disabled={!canProceed}
                  className="flex-1 px-4 py-3 bg-slate-900 text-white rounded-full font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {bookingStep === 'confirm' && (
            <div className="space-y-6">
              <h3 className="font-medium text-slate-900">Confirm Your Booking</h3>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-900">Trainer</p>
                      <p className="text-sm text-slate-600">
                        {selectedTrainer?.firstName} {selectedTrainer?.lastName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-900">Date & Time</p>
                      <p className="text-sm text-slate-600">
                        {selectedDate} at {selectedTime}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-900">Learning Goals</p>
                      <p className="text-sm text-slate-600">{learningGoals}</p>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
                  <p className="text-sm text-slate-700 font-light">
                    Your mentor will review this request and confirm the session. You can track the status under Sessions & Calendar.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setBookingStep('select')}
                    className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-full font-medium hover:bg-slate-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-slate-900 text-white rounded-full font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
