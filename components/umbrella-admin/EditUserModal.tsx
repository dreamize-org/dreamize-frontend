'use client';

import { useState } from 'react';
import { X, Mail, Phone, User, CheckCircle, AlertCircle, Save, Shield } from 'lucide-react';
import { BaseUser, UserRole, Student } from '@/types';
import {
  formatUserRole,
  getAvatarColor,
  getUserInitials,
} from '@/lib/admin/userDisplay';
import { PremiumInput } from '@/components/ui/premium-input';
import { PremiumButton } from '@/components/ui/premium-button';

interface EditUserModalProps {
  user: BaseUser;
  onClose: () => void;
  onSave: (data: Partial<BaseUser>) => Promise<void>;
}

const isStudent = (user: BaseUser): user is Student => user.role === UserRole.STUDENT;

function ToggleRow({
  enabled,
  onChange,
  title,
  description,
  enabledIcon,
  disabledIcon,
  enabledColor,
}: {
  enabled: boolean;
  onChange: () => void;
  title: string;
  description: string;
  enabledIcon: React.ReactNode;
  disabledIcon: React.ReactNode;
  enabledColor: string;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${enabled ? enabledColor : 'bg-slate-100'}`}>
          {enabled ? enabledIcon : disabledIcon}
        </div>
        <div>
          <p className="font-semibold text-slate-900 text-sm">{title}</p>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
          enabled ? 'bg-primary shadow-[0_0_12px_rgba(205,164,41,0.35)]' : 'bg-slate-200'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

export default function EditUserModal({ user, onClose, onSave }: EditUserModalProps) {
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phoneNumber: user.phoneNumber || '',
    isActive: user.isActive,
    isVerified: user.isVerified,
    gender: user.gender || '',
    dateOfBirth: user.dateOfBirth || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      await onSave(formData);
    } catch {
      setError('Failed to update user. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none" />

        <div className="relative z-10 p-6 sm:p-8 border-b border-slate-100">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg ${getAvatarColor(user.role)}`}
              >
                {getUserInitials(user.firstName, user.lastName)}
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-playfair font-bold text-slate-900">Edit User</h2>
                <p className="text-slate-500 text-sm truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all shrink-0"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="relative z-10 flex-1 overflow-y-auto p-6 sm:p-8 space-y-5">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PremiumInput
              label="First Name"
              icon={<User size={20} />}
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            />
            <PremiumInput
              label="Last Name"
              icon={<User size={20} />}
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
          </div>

          <PremiumInput
            label="Email Address"
            icon={<Mail size={20} />}
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <PremiumInput
            label="Phone Number"
            icon={<Phone size={20} />}
            type="tel"
            placeholder="+250 788 123 456"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-[13px] font-bold text-slate-700 ml-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-2xl text-[14px] font-medium focus:bg-white focus:border-primary/20 focus:ring-0 transition-all outline-none"
              >
                <option value="">Not specified</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-[13px] font-bold text-slate-700 ml-1">Date of Birth</label>
              <input
                type="date"
                value={formData.dateOfBirth ? formData.dateOfBirth.split('T')[0] : ''}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-2xl text-[14px] font-medium focus:bg-white focus:border-primary/20 focus:ring-0 transition-all outline-none"
              />
            </div>
          </div>

          <div className="bg-slate-50 rounded-[24px] p-5 border border-slate-100 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Account Status</h3>
            <ToggleRow
              enabled={formData.isActive}
              onChange={() => setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))}
              title="Account active"
              description={formData.isActive ? 'User can sign in' : 'User cannot sign in'}
              enabledIcon={<CheckCircle className="w-5 h-5 text-green-600" />}
              disabledIcon={<AlertCircle className="w-5 h-5 text-red-500" />}
              enabledColor="bg-green-50"
            />
            <ToggleRow
              enabled={formData.isVerified}
              onChange={() => setFormData((prev) => ({ ...prev, isVerified: !prev.isVerified }))}
              title="Email verified"
              description={formData.isVerified ? 'Email confirmed' : 'Awaiting verification'}
              enabledIcon={<CheckCircle className="w-5 h-5 text-blue-600" />}
              disabledIcon={<AlertCircle className="w-5 h-5 text-orange-500" />}
              enabledColor="bg-blue-50"
            />
          </div>

          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <Shield className="w-5 h-5 text-slate-400" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900">{formatUserRole(user.role)}</p>
              <p className="text-xs text-slate-500">Role cannot be changed here</p>
            </div>
          </div>

          {isStudent(user) && (
            <div className="bg-blue-50/80 rounded-[24px] p-5 border border-blue-100 space-y-3">
              <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider">Student Billing</h3>
              <div className="flex justify-between text-sm">
                <span className="text-blue-700">Orientation paid</span>
                <span className="font-medium text-blue-900">{user.hasPaidOrientation ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-700">Active subscription</span>
                <span className="font-medium text-blue-900">{user.hasActiveSubscription ? 'Yes' : 'No'}</span>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 py-3 border border-slate-200 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <PremiumButton type="submit" isLoading={isSaving} className="flex-1">
              <span className="flex items-center justify-center gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </span>
            </PremiumButton>
          </div>
        </form>
      </div>
    </div>
  );
}
