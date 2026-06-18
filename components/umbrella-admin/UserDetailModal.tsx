'use client';

import {
  X,
  Mail,
  Phone,
  Calendar,
  Shield,
  GraduationCap,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit2,
  Clock,
  FileText,
  Award,
  Briefcase,
} from 'lucide-react';
import { BaseUser, UserRole, Student, Trainer, Guardian } from '@/types';
import {
  formatUserRole,
  getAvatarColor,
  getRoleBadgeClasses,
  getStatusBadgeClasses,
  getStatusLabel,
  getUserAccountStatus,
  getUserInitials,
} from '@/lib/admin/userDisplay';

interface UserDetailModalProps {
  user: BaseUser;
  onClose: () => void;
  onEdit: () => void;
}

const isStudent = (user: BaseUser): user is Student => user.role === UserRole.STUDENT;
const isTrainer = (user: BaseUser): user is Trainer => user.role === UserRole.TRAINER;
const isGuardian = (user: BaseUser): user is Guardian => user.role === UserRole.GUARDIAN;

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-slate-100">
      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-slate-900 mt-0.5 break-words">{value}</p>
      </div>
    </div>
  );
}

export default function UserDetailModal({ user, onClose, onEdit }: UserDetailModalProps) {
  const student = isStudent(user) ? user : null;
  const trainer = isTrainer(user) ? user : null;
  const guardian = isGuardian(user) ? user : null;
  const accountStatus = getUserAccountStatus(user);

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none" />

        <div className="relative z-10 p-6 sm:p-8 border-b border-slate-100 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg ${getAvatarColor(user.role)}`}
            >
              {getUserInitials(user.firstName, user.lastName)}
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-playfair font-bold text-slate-900 truncate">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-slate-500 text-sm truncate">{user.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span
                  className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${getStatusBadgeClasses(accountStatus)}`}
                >
                  {getStatusLabel(accountStatus)}
                </span>
                <span
                  className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold border ${getRoleBadgeClasses(user.role)}`}
                >
                  {formatUserRole(user.role)}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all shrink-0"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="relative z-10 flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          <section>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Account Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoRow icon={<Mail className="w-5 h-5 text-slate-400" />} label="Email" value={user.email} />
              <InfoRow
                icon={<Phone className="w-5 h-5 text-slate-400" />}
                label="Phone"
                value={user.phoneNumber || 'Not provided'}
              />
              <InfoRow
                icon={<Calendar className="w-5 h-5 text-slate-400" />}
                label="Joined"
                value={new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              />
              <InfoRow
                icon={<Clock className="w-5 h-5 text-slate-400" />}
                label="Last updated"
                value={new Date(user.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              />
            </div>
          </section>

          {student && (
            <section className="bg-blue-50/80 rounded-[24px] p-6 border border-blue-100">
              <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Student Profile
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-blue-700">Subscription</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      student.hasActiveSubscription ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {student.hasActiveSubscription ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {student.subscriptionExpiryDate && (
                  <div className="flex justify-between gap-4">
                    <span className="text-blue-700">Expires</span>
                    <span className="font-medium text-blue-900">
                      {new Date(student.subscriptionExpiryDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <span className="text-blue-700">Orientation paid</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      student.hasPaidOrientation ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {student.hasPaidOrientation ? 'Yes' : 'Pending'}
                  </span>
                </div>
                {student.onboardingStatus && (
                  <div className="pt-3 border-t border-blue-200">
                    <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">Onboarding</p>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(student.onboardingStatus).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${value ? 'bg-green-500' : 'bg-slate-300'}`} />
                          <span className="text-xs text-blue-800 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {trainer && (
            <section className="bg-purple-50/80 rounded-[24px] p-6 border border-purple-100">
              <h3 className="text-sm font-bold text-purple-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Award className="w-4 h-4" />
                Trainer Profile
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-purple-700">Approval</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                      trainer.approvalStatus === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : trainer.approvalStatus === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {trainer.approvalStatus}
                  </span>
                </div>
                {trainer.experience && (
                  <>
                    <div className="flex justify-between gap-4">
                      <span className="text-purple-700">Experience</span>
                      <span className="font-medium text-purple-900">
                        {trainer.experience.yearsOfExperience} years
                      </span>
                    </div>
                    {trainer.experience.specializations.length > 0 && (
                      <div>
                        <p className="text-purple-700 mb-2">Specializations</p>
                        <div className="flex flex-wrap gap-2">
                          {trainer.experience.specializations.map((spec) => (
                            <span
                              key={spec}
                              className="px-2.5 py-1 bg-white text-purple-800 text-xs font-medium rounded-lg border border-purple-100"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
                {trainer.skills?.length > 0 && (
                  <div>
                    <p className="text-purple-700 mb-2">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {trainer.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-1 bg-slate-900 text-white text-xs font-medium rounded-lg"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {guardian && (
            <section className="bg-teal-50/80 rounded-[24px] p-6 border border-teal-100">
              <h3 className="text-sm font-bold text-teal-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Guardian Profile
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-teal-700">Invite status</span>
                  <span className="font-medium text-teal-900 capitalize">{guardian.inviteState}</span>
                </div>
                {guardian.linkedStudentIds?.length > 0 && (
                  <div className="flex justify-between gap-4">
                    <span className="text-teal-700">Linked students</span>
                    <span className="font-medium text-teal-900">{guardian.linkedStudentIds.length}</span>
                  </div>
                )}
              </div>
            </section>
          )}

          <section className="bg-slate-50 rounded-[24px] p-6 border border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-primary" />
              Additional Info
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-slate-500">Gender</p>
                <p className="font-medium text-slate-900 capitalize">{user.gender || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Date of birth</p>
                <p className="font-medium text-slate-900">
                  {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not provided'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Email verified</p>
                <p className="font-medium text-slate-900 flex items-center gap-1.5">
                  {user.isVerified ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" /> Yes
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-orange-500" /> No
                    </>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Account active</p>
                <p className="font-medium text-slate-900 flex items-center gap-1.5">
                  {user.isActive ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" /> Yes
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-red-500" /> No
                    </>
                  )}
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="relative z-10 p-6 sm:p-8 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={onEdit}
            className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
          >
            <Edit2 className="w-4 h-4 text-primary" />
            Edit User
          </button>
        </div>
      </div>
    </div>
  );
}
