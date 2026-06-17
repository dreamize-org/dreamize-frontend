'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { useAuth } from '@/contexts';
import { UserRole } from '@/types';
import { availabilityService, DAY_LABELS, type WeeklySlot } from '@/services';
import { useNavigationWithLoading } from '@/lib/utils/navigation';
import { Calendar, Clock, Loader2, Save } from 'lucide-react';

const defaultSchedule: WeeklySlot[] = DAY_LABELS.map((_label: string, dayOfWeek: number) => ({
  dayOfWeek,
  enabled: dayOfWeek >= 1 && dayOfWeek <= 5,
  startTime: '09:00',
  endTime: '17:00',
}));

export default function TrainerAvailabilityPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { navigate } = useNavigationWithLoading();
  const [schedule, setSchedule] = useState<WeeklySlot[]>(defaultSchedule);
  const [slotDurationMinutes, setSlotDurationMinutes] = useState(60);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || user?.role !== UserRole.TRAINER) {
      navigate('/auth/login');
      return;
    }

    availabilityService
      .getMyAvailability()
      .then((response) => {
        if (response.success && response.data) {
          setSchedule(response.data.weeklySchedule);
          setSlotDurationMinutes(response.data.slotDurationMinutes);
        }
      })
      .finally(() => setLoading(false));
  }, [authLoading, isAuthenticated, user?.role, navigate]);

  const updateDay = (dayOfWeek: number, patch: Partial<WeeklySlot>) => {
    setSchedule((current) =>
      current.map((slot) => (slot.dayOfWeek === dayOfWeek ? { ...slot, ...patch } : slot))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const response = await availabilityService.updateMyAvailability({
        weeklySchedule: schedule,
        slotDurationMinutes,
      });
      if (response.success) {
        setMessage('Availability saved. Students can now book open slots.');
      } else {
        setMessage('Unable to save availability.');
      }
    } catch {
      setMessage('Unable to save availability.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen bg-[#F8FAFC] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen lg:h-screen bg-[#F8FAFC]">
      <Sidebar activeItem="Availability" userType={UserRole.TRAINER} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-slate-100 px-8 py-5">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-900">Availability Calendar</h1>
            <p className="text-slate-500 mt-1">Set the weekly hours students can book orientation sessions.</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <h2 className="font-bold text-slate-900">Session length</h2>
                  <p className="text-sm text-slate-500">Each bookable slot uses this duration.</p>
                </div>
              </div>
              <select
                value={slotDurationMinutes}
                onChange={(e) => setSlotDurationMinutes(Number(e.target.value))}
                className="px-4 py-3 bg-slate-50 rounded-2xl border-none text-sm font-medium"
              >
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
                <option value={90}>90 minutes</option>
              </select>
            </div>

            <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-slate-900">Weekly schedule</h2>
              </div>

              <div className="space-y-4">
                {schedule
                  .slice()
                  .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                  .map((slot) => (
                    <div
                      key={slot.dayOfWeek}
                      className="grid grid-cols-1 md:grid-cols-[140px_80px_1fr_1fr] gap-4 items-center p-4 bg-slate-50 rounded-2xl"
                    >
                      <span className="font-medium text-slate-900">{DAY_LABELS[slot.dayOfWeek]}</span>
                      <label className="flex items-center gap-2 text-sm text-slate-600">
                        <input
                          type="checkbox"
                          checked={slot.enabled}
                          onChange={(e) => updateDay(slot.dayOfWeek, { enabled: e.target.checked })}
                        />
                        Open
                      </label>
                      <input
                        type="time"
                        value={slot.startTime}
                        disabled={!slot.enabled}
                        onChange={(e) => updateDay(slot.dayOfWeek, { startTime: e.target.value })}
                        className="px-3 py-2 rounded-xl bg-white border border-slate-100 disabled:opacity-50"
                      />
                      <input
                        type="time"
                        value={slot.endTime}
                        disabled={!slot.enabled}
                        onChange={(e) => updateDay(slot.dayOfWeek, { endTime: e.target.value })}
                        className="px-3 py-2 rounded-xl bg-white border border-slate-100 disabled:opacity-50"
                      />
                    </div>
                  ))}
              </div>
            </div>

            {message && (
              <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-2xl px-4 py-3">
                {message}
              </p>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-full font-medium hover:bg-slate-800 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save availability
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
