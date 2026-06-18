'use client';

import { useMemo, useState } from 'react';
import {
  AdminEmptyState,
  AdminFooter,
  AdminHeader,
  AdminLoadingState,
  AdminMain,
  AdminPanel,
  AdminSectionBadge,
  AdminShell,
  AdminStatCard,
} from '@/components/admin/AdminLayout';
import UserDetailModal from '@/components/umbrella-admin/UserDetailModal';
import EditUserModal from '@/components/umbrella-admin/EditUserModal';
import { PremiumInput } from '@/components/ui/premium-input';
import { PremiumButton } from '@/components/ui/premium-button';
import { useAdminContext } from '@/contexts';
import { useAdmin } from '@/hooks/useAdmin';
import {
  formatUserRole,
  getAvatarColor,
  getRoleBadgeClasses,
  getStatusBadgeClasses,
  getStatusLabel,
  getUserAccountStatus,
  getUserInitials,
  type UserAccountStatus,
} from '@/lib/admin/userDisplay';
import { BaseUser, UserRole } from '@/types';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Edit2,
  Eye,
  GraduationCap,
  Lock,
  Mail,
  Phone,
  Search,
  Shield,
  SlidersHorizontal,
  Trash2,
  UserCheck,
  UserCircle,
  UserPlus,
  Users,
  X,
  XCircle,
} from 'lucide-react';

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
  role: UserRole.SALES_MANAGER,
  phoneNumber: '',
};

type RoleTab = 'students' | 'trainers' | 'guardians' | 'admins' | 'sales_managers';

const PAGE_SIZE = 10;

export default function AdminUsersPage() {
  const [selectedTab, setSelectedTab] = useState<RoleTab>('students');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | UserAccountStatus>('all');
  const [page, setPage] = useState(1);

  const { users, trainers, usersLoading, refreshUsers } = useAdminContext();
  const { createUser, updateUser, deleteUser, isLoading: processing } = useAdmin();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<BaseUser | null>(null);

  const [form, setForm] = useState<CreateUserForm>(EMPTY_FORM);
  const [success, setSuccess] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const tabs = useMemo(
    () =>
      [
        {
          key: 'students' as const,
          label: 'Students',
          shortLabel: 'Students',
          count: users.filter((u) => u.role === UserRole.STUDENT).length,
          icon: GraduationCap,
        },
        {
          key: 'trainers' as const,
          label: 'Trainers',
          shortLabel: 'Trainers',
          count: trainers.length,
          icon: Users,
        },
        {
          key: 'guardians' as const,
          label: 'Guardians',
          shortLabel: 'Guardians',
          count: users.filter((u) => u.role === UserRole.GUARDIAN).length,
          icon: UserCircle,
        },
        {
          key: 'admins' as const,
          label: 'Admins',
          shortLabel: 'Admins',
          count: users.filter((u) => u.role === UserRole.ADMIN).length,
          icon: Shield,
        },
        {
          key: 'sales_managers' as const,
          label: 'Sales',
          shortLabel: 'Sales',
          count: users.filter((u) => u.role === UserRole.SALES_MANAGER).length,
          icon: UserCheck,
        },
      ] as const,
    [users, trainers.length]
  );

  const filteredUsers = useMemo(() => {
    let filtered = users;

    switch (selectedTab) {
      case 'students':
        filtered = users.filter((u) => u.role === UserRole.STUDENT);
        break;
      case 'trainers':
        filtered = users.filter((u) => u.role === UserRole.TRAINER);
        break;
      case 'guardians':
        filtered = users.filter((u) => u.role === UserRole.GUARDIAN);
        break;
      case 'sales_managers':
        filtered = users.filter((u) => u.role === UserRole.SALES_MANAGER);
        break;
      case 'admins':
        filtered = users.filter((u) => u.role === UserRole.ADMIN);
        break;
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.firstName.toLowerCase().includes(query) ||
          u.lastName.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query) ||
          u.phoneNumber?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((u) => getUserAccountStatus(u) === statusFilter);
    }

    return filtered;
  }, [users, selectedTab, searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.isActive && u.isVerified).length;
  const pendingUsers = users.filter((u) => u.isActive && !u.isVerified).length;
  const inactiveUsers = users.filter((u) => !u.isActive).length;

  const openCreateModal = (role?: UserRole) => {
    setShowCreateModal(true);
    setForm({ ...EMPTY_FORM, role: role ?? UserRole.SALES_MANAGER });
    setLocalError(null);
    setSuccess(false);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccess(false);

    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.password.trim()) {
      setLocalError('First name, last name, email, and password are required.');
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
      setTimeout(() => {
        setShowCreateModal(false);
        setSuccess(false);
      }, 1200);
    } else {
      setLocalError('Failed to create user. Please try again.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Delete this user? This action cannot be undone.')) return;
    await deleteUser(userId);
    await refreshUsers();
  };

  const exportCsv = () => {
    const rows = [
      ['First Name', 'Last Name', 'Email', 'Phone', 'Role', 'Status', 'Joined'].join(','),
      ...filteredUsers.map((user) => {
        const status = getStatusLabel(getUserAccountStatus(user));
        return [
          user.firstName,
          user.lastName,
          user.email,
          user.phoneNumber ?? '',
          formatUserRole(user.role),
          status,
          new Date(user.createdAt).toLocaleDateString(),
        ].join(',');
      }),
    ].join('\n');

    const blob = new Blob([rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `users-${selectedTab}-${new Date().toISOString().split('T')[0]}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminShell activeItem="users">
      <AdminHeader
        badge="People"
        subtitle="User Directory"
        title="User Management"
        actions={
          <button
            onClick={() => openCreateModal()}
            className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4 text-primary" />
            Add User
          </button>
        }
      />

      <AdminMain>
        <AdminSectionBadge label="Platform Accounts" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <AdminStatCard label="Total Users" value={totalUsers} icon={Users} iconClassName="text-blue-500" iconBgClassName="bg-blue-50" />
          <AdminStatCard label="Verified" value={activeUsers} icon={UserCheck} iconClassName="text-green-500" iconBgClassName="bg-green-50" />
          <AdminStatCard label="Pending" value={pendingUsers} icon={Clock} iconClassName="text-orange-500" iconBgClassName="bg-orange-50" />
          <AdminStatCard label="Suspended" value={inactiveUsers} icon={XCircle} iconClassName="text-red-500" iconBgClassName="bg-red-50" />
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-2xl overflow-x-auto mb-6 w-full max-w-full">
          {tabs.map((tab) => {
            const isActive = selectedTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setSelectedTab(tab.key);
                  setPage(1);
                }}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                  isActive ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <tab.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary' : ''}`} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                    isActive ? 'bg-primary/10 text-primary' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <AdminPanel
          title={`${tabs.find((t) => t.key === selectedTab)?.label ?? 'Users'} Directory`}
          description={`${filteredUsers.length} account${filteredUsers.length === 1 ? '' : 's'} matching your filters`}
          headerRight={
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <div className="relative group flex-1 sm:flex-none min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Search name, email, phone..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 rounded-xl">
                <SlidersHorizontal size={16} className="text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === 'all' || value === 'verified' || value === 'pending' || value === 'suspended') {
                      setStatusFilter(value);
                      setPage(1);
                    }
                  }}
                  className="bg-transparent border-none text-sm font-bold text-slate-600 focus:ring-0 cursor-pointer"
                >
                  <option value="all">All statuses</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <button
                onClick={exportCsv}
                disabled={filteredUsers.length === 0}
                className="p-2.5 bg-slate-50 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all disabled:opacity-40"
                title="Export CSV"
              >
                <Download size={18} />
              </button>
            </div>
          }
        >
          {usersLoading ? (
            <AdminLoadingState label="Loading users..." />
          ) : filteredUsers.length === 0 ? (
            <AdminEmptyState
              icon={Users}
              title="No users found"
              description="Try a different role tab, search term, or status filter."
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50">
                      {['User', 'Contact', 'Status', 'Role', 'Joined', 'Actions'].map((heading) => (
                        <th
                          key={heading}
                          className={`px-4 sm:px-6 lg:px-8 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400 ${
                            heading === 'Actions' ? 'text-right' : ''
                          }`}
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {paginatedUsers.map((user) => {
                      const accountStatus = getUserAccountStatus(user);
                      return (
                        <tr key={user._id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 sm:px-6 lg:px-8 py-4">
                            <div className="flex items-center gap-3 min-w-[200px]">
                              <div
                                className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-md transition-transform group-hover:scale-105 ${getAvatarColor(user.role)}`}
                              >
                                {getUserInitials(user.firstName, user.lastName)}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-900 truncate group-hover:text-primary transition-colors">
                                  {user.firstName} {user.lastName}
                                </p>
                                <p className="text-xs text-slate-400 capitalize">{formatUserRole(user.role)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 lg:px-8 py-4">
                            <div className="space-y-1.5 text-sm text-slate-600">
                              <div className="flex items-center gap-2">
                                <Mail size={14} className="text-slate-400 shrink-0" />
                                <span className="truncate max-w-[180px]">{user.email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone size={14} className="text-slate-400 shrink-0" />
                                <span>{user.phoneNumber || '—'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 lg:px-8 py-4">
                            <span
                              className={`inline-flex px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${getStatusBadgeClasses(accountStatus)}`}
                            >
                              {getStatusLabel(accountStatus)}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 lg:px-8 py-4">
                            <span
                              className={`inline-flex px-3 py-1 rounded-full text-[11px] font-bold border ${getRoleBadgeClasses(user.role)}`}
                            >
                              {formatUserRole(user.role)}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 lg:px-8 py-4 text-sm text-slate-600 whitespace-nowrap">
                            {new Date(user.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="px-4 sm:px-6 lg:px-8 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowDetailModal(true);
                                }}
                                className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                                title="View details"
                              >
                                <Eye size={17} />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowEditModal(true);
                                }}
                                className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                                title="Edit user"
                              >
                                <Edit2 size={17} />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user._id)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                title="Delete user"
                              >
                                <Trash2 size={17} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="px-6 sm:px-8 py-4 bg-slate-50/50 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-slate-500">
                  Showing {(currentPage - 1) * PAGE_SIZE + 1}–
                  {Math.min(currentPage * PAGE_SIZE, filteredUsers.length)} of {filteredUsers.length}
                  {filteredUsers.length !== totalUsers ? ` (${totalUsers} total on platform)` : ''}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="px-4 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="text-xs font-bold text-slate-400 px-2">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className="px-4 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </AdminPanel>

        <AdminFooter label="© Dreamize Africa 2025 • User Directory" />
      </AdminMain>

      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-xl p-8 sm:p-10 relative overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full -mr-32 -mt-32" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-playfair font-bold text-slate-900">Create User Account</h2>
                  <p className="text-slate-500 text-sm font-light mt-1">Add a new platform account with a chosen role.</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <p className="text-sm text-green-700 font-medium">User created successfully.</p>
                </div>
              )}

              {localError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-sm text-red-700 font-medium">{localError}</p>
                </div>
              )}

              <form onSubmit={handleCreateSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <PremiumInput
                    label="First Name"
                    icon={<UserCircle size={20} />}
                    placeholder="David"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  />
                  <PremiumInput
                    label="Last Name"
                    icon={<UserCircle size={20} />}
                    placeholder="Mugisha"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  />
                </div>

                <PremiumInput
                  label="Email Address"
                  icon={<Mail size={20} />}
                  type="email"
                  placeholder="name@dreamize.rw"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <PremiumInput
                    label="Phone Number"
                    icon={<Phone size={20} />}
                    placeholder="+250..."
                    value={form.phoneNumber}
                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                  />
                  <div className="space-y-2">
                    <label className="block text-[13px] font-bold text-slate-700 ml-1">Role</label>
                    <div className="relative group">
                      <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors z-10" />
                      <select
                        value={form.role}
                        onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-2xl text-[14px] font-medium focus:bg-white focus:border-primary/20 focus:ring-0 transition-all outline-none appearance-none"
                      >
                        {ROLES.map((role) => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <PremiumInput
                  label="Password"
                  icon={<Lock size={20} />}
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />

                <div className="flex gap-3 pt-2">
                  <PremiumButton type="submit" isLoading={processing} className="flex-1">
                    Create Account
                  </PremiumButton>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showDetailModal && selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setShowDetailModal(false)}
          onEdit={() => {
            setShowDetailModal(false);
            setShowEditModal(true);
          }}
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
    </AdminShell>
  );
}
