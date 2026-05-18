'use client';

import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import {
  Users, UserCheck, Shield, GraduationCap, X, Search,
  Mail, Phone,
  Eye, Edit2, Trash2,
  CheckCircle, XCircle, AlertCircle, Download, UserCircle,
  UserPlus, SlidersHorizontal, Lock, Clock
} from 'lucide-react';
import { useAdminContext } from '@/contexts';
import { useAdmin } from '@/hooks/useAdmin';
import { BaseUser, UserRole } from '@/types';
import UserDetailModal from '@/components/umbrella-admin/UserDetailModal';
import EditUserModal from '@/components/umbrella-admin/EditUserModal';
import { PremiumInput } from '@/components/ui/premium-input';
import { PremiumButton } from '@/components/ui/premium-button';

interface CreateUserForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  phoneNumber: string;
}

const ROLES: { value: UserRole; label: string }[] = [
  { value: UserRole.STUDENT, label: 'Student' },
  { value: UserRole.TRAINER, label: 'Trainer' },
  { value: UserRole.ADMIN, label: 'Admin' },
  { value: UserRole.GUARDIAN, label: 'Guardian' },
  { value: UserRole.SALES_MANAGER, label: 'Sales Manager' },
];

const EMPTY_FORM: CreateUserForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: UserRole.STUDENT,
  phoneNumber: ''
};

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

const getAvatarColor = (role: UserRole) => {
  switch (role) {
    case UserRole.STUDENT: return 'bg-blue-500';
    case UserRole.TRAINER: return 'bg-purple-500';
    case UserRole.GUARDIAN: return 'bg-teal-500';
    case UserRole.ADMIN: return 'bg-slate-900';
    default: return 'bg-slate-400';
  }
};

export default function AdminUsersPage() {
  const [selectedTab, setSelectedTab] = useState<'students' | 'trainers' | 'guardians' | 'admins' | 'sales_managers'>('students');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');

  const { users, trainers, usersLoading, refreshUsers } = useAdminContext();
  const { createUser, updateUser, deleteUser, isLoading: processing } = useAdmin();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<BaseUser | null>(null);

  const [form, setForm] = useState<CreateUserForm>(EMPTY_FORM);
  const [success, setSuccess] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const getFilteredUsers = () => {
    let filtered = users;
    switch (selectedTab) {
      case 'students': filtered = users.filter(u => u.role === UserRole.STUDENT); break;
      case 'trainers': filtered = users.filter(u => u.role === UserRole.TRAINER); break;
      case 'guardians': filtered = users.filter(u => u.role === UserRole.GUARDIAN); break;
      case 'sales_managers': filtered = users.filter(u => u.role === UserRole.SALES_MANAGER); break;
      case 'admins': filtered = users.filter(u => u.role === UserRole.ADMIN); break;
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(u =>
        u.firstName.toLowerCase().includes(query) ||
        u.lastName.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.phoneNumber?.toLowerCase().includes(query)
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(u => {
        if (statusFilter === 'active') return u.isActive && u.isVerified;
        if (statusFilter === 'inactive') return !u.isActive;
        if (statusFilter === 'pending') return u.isActive && !u.isVerified;
        return true;
      });
    }
    return filtered;
  };

  const filteredUsers = getFilteredUsers();
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.isActive && u.isVerified).length;
  const pendingUsers = users.filter(u => u.isActive && !u.isVerified).length;
  const inactiveUsers = users.filter(u => !u.isActive).length;

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccess(false);

    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.password.trim()) {
      setLocalError('All fields are required');
      return;
    }

    const result = await createUser({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      password: form.password,
      role: form.role,
    });

    if (result) {
      setSuccess(true);
      setForm(EMPTY_FORM);
      await refreshUsers();
      setTimeout(() => { setShowCreateModal(false); setSuccess(false); }, 1200);
    } else {
      setLocalError('Failed to create user');
    }
  };

  const handleViewUser = (user: BaseUser) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const handleEditUser = (user: BaseUser) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    await deleteUser(userId);
    await refreshUsers();
  };

  const tabs = [
    { key: 'students', label: 'Students', count: users.filter(u => u.role === UserRole.STUDENT).length, icon: GraduationCap },
    { key: 'trainers', label: 'Trainers', count: trainers.length, icon: Users },
    { key: 'guardians', label: 'Guardians', count: users.filter(u => u.role === UserRole.GUARDIAN).length, icon: UserCircle },
    { key: 'admins', label: 'Admins', count: users.filter(u => u.role === UserRole.ADMIN).length, icon: Shield },
    { key: 'sales_managers', label: 'Sales Managers', count: users.filter(u => u.role === UserRole.SALES_MANAGER).length, icon: UserCheck },
  ] as const;

  return (
    <div className="flex min-h-screen lg:h-screen bg-[#F8FAFC]">
      <Sidebar activeItem="Users" userType={UserRole.ADMIN} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[12px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">System Administration</span>
                <span className="text-slate-300">•</span>
                <span className="text-[12px] font-medium text-slate-400 italic">User Directory</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => { setShowCreateModal(true); setForm({ ...EMPTY_FORM, role: UserRole.SALES_MANAGER }); setLocalError(null); setSuccess(false); }}
                className="px-6 py-2.5 bg-primary text-white rounded-2xl font-bold text-[14px] hover:bg-primary/90 transition-all shadow-lg shadow-blue-600/10 flex items-center gap-2 group"
              >
                <UserPlus className="w-4 h-4 text-white" />
                Add Sales Manager
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            
            {/* Section Header with Badge */}
            <div className="mb-10">
              <div className="relative inline-flex items-center justify-center mb-6">
                <div className="absolute -top-[14px] -left-[14px] w-9 h-9 pointer-events-none text-primary">
                  <svg viewBox="0 0 40 40" strokeWidth="4" stroke="currentColor" fill="none" strokeLinecap="round">
                    <line x1="8" y1="8" x2="14" y2="14" />
                    <line x1="2" y1="20" x2="10" y2="20" />
                    <line x1="20" y1="2" x2="20" y2="10" />
                  </svg>
                </div>
                <span className="text-sm font-semibold tracking-[0.5px] text-primary bg-primary/20 px-5 py-2 rounded-full shadow-sm border border-primary/10">
                  User Directory
                </span>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {[
                { label: 'Total Users', value: totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
                { label: 'Verified', value: activeUsers, icon: UserCheck, color: 'text-green-500', bg: 'bg-green-50' },
                { label: 'Pending', value: pendingUsers, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
                { label: 'Suspended', value: inactiveUsers, icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white border border-slate-100 rounded-[24px] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_25px_45px_rgba(0,0,0,0.1)] hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 group">
                   <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                   </div>
                   <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                   <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Content Container */}
            <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_20px_40px_rgba(0,0,0,0.06)] overflow-hidden">
              
              {/* Tabs & Search Header */}
              <div className="p-8 border-b border-slate-50">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Tabs */}
                  <div className="flex bg-slate-100 p-1.5 rounded-2xl overflow-x-auto">
                    {tabs.map((tab) => {
                      const isActive = selectedTab === tab.key;
                      return (
                        <button
                          key={tab.key}
                          onClick={() => setSelectedTab(tab.key)}
                          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                            isActive 
                              ? 'bg-white text-slate-900 shadow-sm' 
                              : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          <tab.icon className={`w-4 h-4 ${isActive ? 'text-primary' : ''}`} />
                          {tab.label}
                          <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-md ${isActive ? 'bg-primary/10 text-primary' : 'bg-slate-200'}`}>
                            {tab.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative group">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-primary transition-colors" />
                      <input 
                        type="text" 
                        placeholder="Filter by name or email..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all w-full sm:w-64"
                      />
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 rounded-xl border-none">
                      <SlidersHorizontal size={16} className="text-slate-400" />
                      <select
                        value={statusFilter}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v === 'all' || v === 'active' || v === 'inactive' || v === 'pending') {
                            setStatusFilter(v);
                          }
                        }}
                        className="bg-transparent border-none text-sm font-bold text-slate-600 focus:ring-0 cursor-pointer"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Verified</option>
                        <option value="pending">Pending</option>
                        <option value="inactive">Suspended</option>
                      </select>
                    </div>
                    <button className="p-2.5 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl transition-all">
                      <Download size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Table Section */}
              <div className="overflow-x-auto">
                {usersLoading ? (
                  <div className="p-20 text-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-400 font-medium">Updating Directory...</p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-20 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-6">
                      <Users size={40} className="text-slate-200" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No Matches Found</h3>
                    <p className="text-slate-500 font-light">Refine your search parameters to find the user.</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">User Identity</th>
                        <th className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Contact Details</th>
                        <th className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Account Status</th>
                        <th className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Role</th>
                        <th className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 text-right text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredUsers.map((user) => (
                        <tr key={user._id} className="group hover:bg-slate-50/50 transition-all duration-300">
                          <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center text-white font-black text-sm shadow-lg shadow-black/5 transition-transform group-hover:scale-110 ${getAvatarColor(user.role)}`}>
                                {getInitials(user.firstName, user.lastName)}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 group-hover:text-primary transition-colors">
                                  {user.firstName} {user.lastName}
                                </div>
                                <div className="text-sm text-slate-500 font-light">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
                            <div className="flex items-center gap-2 text-[13px] text-slate-600 font-medium">
                              <Phone size={14} className="text-slate-400" />
                              {user.phoneNumber || 'N/A'}
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
                            <span className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                              user.status === 'active' ? 'bg-green-100 text-green-700' :
                              user.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {user.status || 'unknown'}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
                            <span className="text-[12px] font-black uppercase text-slate-400 tracking-widest">{user.role}</span>
                          </td>
                          <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleViewUser(user)}
                                className="p-2.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                                title="Overview"
                              >
                                <Eye size={18} />
                              </button>
                              <button
                                onClick={() => handleEditUser(user)}
                                className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                                title="Modify"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user._id)}
                                className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                title="Terminate"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Footer Info */}
              <div className="p-6 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
                 <p className="text-xs text-slate-400 font-medium italic">Showing {filteredUsers.length} of {totalUsers} registered identities</p>
                 <div className="flex items-center gap-2">
                    <button className="px-4 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">Previous</button>
                    <button className="px-4 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">Next</button>
                 </div>
              </div>
            </div>

            <div className="mt-12 text-center">
               <p className="text-slate-400 text-[11px] font-bold tracking-[0.3em] uppercase italic"> Dreamize Africa 2025 • Admin Directory Protocol</p>
            </div>
          </div>
        </main>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-xl p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full -mr-32 -mt-32" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-playfair font-bold text-slate-900">User Directory</h2>
                  <p className="text-slate-500 text-sm font-light italic">Manage all platform accounts and permissions</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-[20px] flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <p className="text-sm text-green-700 font-bold">Identity established successfully!</p>
                </div>
              )}

              {localError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-[20px] flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-sm text-red-700 font-medium">{localError}</p>
                </div>
              )}

              <form onSubmit={handleCreateSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <PremiumInput
                    label="First Name"
                    icon={<UserCircle size={20} />}
                    placeholder="E.g. David"
                    value={form.firstName}
                    onChange={e => setForm({ ...form, firstName: e.target.value })}
                  />
                  <PremiumInput
                    label="Last Name"
                    icon={<UserCircle size={20} />}
                    placeholder="E.g. Mugisha"
                    value={form.lastName}
                    onChange={e => setForm({ ...form, lastName: e.target.value })}
                  />
                </div>

                <PremiumInput
                  label="Email Address"
                  icon={<Mail size={20} />}
                  type="email"
                  placeholder="name@dreamize.rw"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <PremiumInput
                    label="Phone Number"
                    icon={<Phone size={20} />}
                    placeholder="+250..."
                    value={form.phoneNumber}
                    onChange={e => setForm({ ...form, phoneNumber: e.target.value })}
                  />
                   <div className="space-y-2">
                    <label className="block text-[13px] font-bold text-slate-700 ml-1">Access Role</label>
                    <div className="relative group">
                      <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors z-10" />
                      <select
                        value={form.role}
                        onChange={e => setForm({ ...form, role: e.target.value as UserRole })}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-2xl text-[14px] font-medium focus:bg-white focus:border-primary/20 focus:ring-0 transition-all outline-none appearance-none"
                      >
                        {ROLES.map(r => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <PremiumInput
                  label="Security Password"
                  icon={<Lock size={20} />}
                  type="password"
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                />

                <div className="flex gap-4 pt-4">
                  <PremiumButton
                    type="submit"
                    isLoading={processing}
                    className="flex-1"
                  >
                    Confirm Deployment
                  </PremiumButton>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-8 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Detail & Edit Modals - Assuming they will be updated in separate component files or remain functional */}
      {showDetailModal && selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setShowDetailModal(false)}
          onEdit={() => { setShowDetailModal(false); setShowEditModal(true); }}
        />
      )}

      {showEditModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => setShowEditModal(false)}
          onSave={async (updatedData) => {
            await updateUser(selectedUser._id, updatedData);
            await refreshUsers();
            setShowEditModal(false);
          }}
        />
      )}
    </div>
  );
}
