'use client';

import { useState, useRef } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { User, Mail, Shield, Bell, Calendar, MapPin, Edit2, Check, Phone, Globe, Briefcase, Award, ChevronRight, Settings, Star, Zap, Upload } from 'lucide-react';
import { useAuth } from '@/contexts';
import { UserRole } from '@/types';
import { BASE_URL, userService } from '@/services';
import Image from 'next/image';

export default function AdminProfilePage() {
    const { user, updateUserProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [profileData, setProfileData] = useState({
        name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Super Admin',
        email: user?.email || 'admin@dreamize.rw',
        phone: '+250 788 111 222',
        location: 'Kigali, Rwanda',
        bio: 'System Administrator with full access to all platform features and security protocols. Responsible for managing user accounts, system configurations, and maintaining platform integrity.',
        expertise: ['System Administration', 'Security Management', 'Database Operations', 'Network Infrastructure'],
        experience: '5+ Years',
        field: 'System Administration',
        joinDate: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Jan 2025'
    });

    const handleSave = () => {
        setIsEditing(false);
    };

    const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const uploadResponse = await userService.uploadProfilePicture(file);
            if (uploadResponse.url) {
                await updateUserProfile({ profilePicture: uploadResponse.url });
            }
        } catch (error) {
            console.error('Error uploading profile picture:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleProfilePictureClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="flex min-h-screen lg:h-screen bg-[#FDF9F2]">
            <Sidebar activeItem="Profile" userType={UserRole.ADMIN} />

            <div className="flex-1 flex flex-col min-w-0">
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    <div className="max-w-full mx-auto">
                        {/* Profile Header Card */}
                        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden mb-8">
                            <div className="h-40 bg-gradient-to-br from-slate-900 to-slate-800 relative overflow-hidden">
                                {/* Decorative Abstract Shapes */}
                                <div className="absolute top-0 left-0 w-full h-full opacity-20">
                                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary rounded-full blur-3xl" />
                                    <div className="absolute top-1/2 -right-12 w-48 h-48 bg-white rounded-full blur-2xl" />
                                </div>
                            </div>

                            <div className="px-8 py-8">
                                <div className="flex flex-col md:flex-row md:items-end -mt-12 gap-6">
                                    <div className="relative group">
                                        <div className="w-32 h-32 rounded-full bg-white p-1.5 shadow-2xl shadow-slate-200/50 transform group-hover:scale-105 transition-all duration-500">
                                            <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 rounded-full flex items-center justify-center overflow-hidden">
                                                {user?.profilePicture ? (
                                                    <Image
                                                        src={`${BASE_URL}${user.profilePicture}`}
                                                        alt={profileData.name}
                                                        className=" object-cover"
                                                        height={500}
                                                        width={500}
                                                    />
                                                ) : (
                                                    <span className="text-slate-700 text-4xl font-extrabold">
                                                        {profileData.name.split(' ').map(n => n[0]).join('')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-primary border-4 border-white rounded-full flex items-center justify-center" title="Verified Admin">
                                            <Check className="w-5 h-5 text-white" />
                                        </div>
                                        <button
                                            onClick={handleProfilePictureClick}
                                            disabled={isUploading}
                                            className="absolute inset-0 w-32 h-32 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300"
                                            title="Change profile picture"
                                        >
                                            {isUploading ? (
                                                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <Upload className="w-6 h-6 text-white" />
                                            )}
                                        </button>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleProfilePictureUpload}
                                            className="hidden"
                                        />
                                    </div>

                                    <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h1 className="text-3xl font-playfair font-semibold text-slate-900">{profileData.name}</h1>
                                                <div className="px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-bold uppercase tracking-wider">System Admin</div>
                                            </div>
                                            <p className="text-slate-500 font-light flex items-center gap-2 mt-1.5">
                                                <Briefcase className="w-4.5 h-4.5 text-slate-600" />
                                                <span className="text-slate-600 capitalize">{profileData.field.replace(/-/g, ' ')} Field</span>
                                                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                                <span className="text-slate-400">Root Administrator</span>
                                            </p>
                                        </div>

                                        <div className="flex gap-4">
                                            {isEditing ? (
                                                <>
                                                    <button
                                                        onClick={() => setIsEditing(false)}
                                                        className="px-6 py-3 border border-slate-200 text-slate-600 rounded-full font-semibold hover:bg-slate-50 transition-all active:scale-95"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={handleSave}
                                                        className="px-8 py-3 bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 shadow-xl shadow-slate-200 active:scale-95 transition-all"
                                                    >
                                                        Save Changes
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => setIsEditing(true)}
                                                    className="flex items-center gap-2.5 px-8 py-3 bg-white border border-slate-200 text-slate-800 rounded-full font-semibold hover:border-primary hover:text-slate-600 shadow-sm hover:shadow-slate-100/50 transition-all active:scale-95 group"
                                                >
                                                    <Edit2 className="w-4.5 h-4.5 group-hover:rotate-12 transition-transform" />
                                                    Edit Profile
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column - Personal Info */}
                            <div className="lg:col-span-2 space-y-8">
                                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600">
                                            <User className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-playfair font-semibold text-slate-900">Personal Information</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={profileData.name}
                                                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-xl focus:bg-white focus:border-primary/20 focus:ring-0 outline-none transition-all font-medium"
                                                />
                                            ) : (
                                                <div className="px-5 py-3.5 bg-slate-50/50 border border-transparent rounded-xl">
                                                    <p className="text-slate-900 font-semibold">{profileData.name}</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
                                            {isEditing ? (
                                                <input
                                                    type="email"
                                                    value={profileData.email}
                                                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-xl focus:bg-white focus:border-primary/20 focus:ring-0 outline-none transition-all font-medium"
                                                />
                                            ) : (
                                                <div className="px-5 py-3.5 bg-slate-50/50 border border-transparent rounded-xl flex items-center justify-between">
                                                    <p className="text-slate-900 font-semibold">{profileData.email}</p>
                                                    <Mail className="w-4 h-4 text-slate-300" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Phone Number</label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={profileData.phone}
                                                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-xl focus:bg-white focus:border-primary/20 focus:ring-0 outline-none transition-all font-medium"
                                                />
                                            ) : (
                                                <div className="px-5 py-3.5 bg-slate-50/50 border border-transparent rounded-xl flex items-center justify-between">
                                                    <p className="text-slate-900 font-semibold">{profileData.phone}</p>
                                                    <Phone className="w-4 h-4 text-slate-300" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Location</label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={profileData.location}
                                                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                                                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-xl focus:bg-white focus:border-primary/20 focus:ring-0 outline-none transition-all font-medium"
                                                />
                                            ) : (
                                                <div className="px-5 py-3.5 bg-slate-50/50 border border-transparent rounded-xl flex items-center justify-between">
                                                    <p className="text-slate-900 font-semibold">{profileData.location}</p>
                                                    <MapPin className="w-4 h-4 text-slate-300" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-10 pt-10 border-t border-slate-50">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 mb-4">Professional Bio</label>
                                        {isEditing ? (
                                            <textarea
                                                value={profileData.bio}
                                                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                                rows={4}
                                                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-xl focus:bg-white focus:border-primary/20 focus:ring-0 outline-none transition-all font-medium resize-none leading-relaxed"
                                            />
                                        ) : (
                                            <div className="p-6 bg-slate-50/50 rounded-xl border border-transparent">
                                                <p className="text-slate-700 font-light leading-relaxed">{profileData.bio}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600">
                                            <Award className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-playfair font-semibold text-slate-900">Expertise & Experience</h3>
                                    </div>

                                    <div className="space-y-8">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 mb-4">Top Skills & Specialties</label>
                                            <div className="flex flex-wrap gap-3">
                                                {profileData.expertise.map((skill, i) => (
                                                    <span key={i} className="px-4 py-2 bg-slate-50 text-slate-700 border border-slate-100 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm">
                                                        {skill}
                                                    </span>
                                                ))}
                                                {isEditing && (
                                                    <button className="px-4 py-2 border-2 border-dashed border-slate-200 text-slate-400 rounded-xl text-xs font-bold uppercase tracking-wider hover:border-slate-500 hover:text-slate-500 transition-all active:scale-95">
                                                        + Add Expertise
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                            <div className="flex items-center gap-6 p-6 bg-slate-50/30 rounded-[32px] border border-slate-100/50 group hover:bg-slate-50 transition-colors">
                                                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-slate-600 shadow-sm transform group-hover:scale-110 transition-transform duration-500">
                                                    <Zap className="w-7 h-7" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-800/60 uppercase tracking-wider mb-1">Experience</p>
                                                    <p className="text-lg font-playfair font-semibold text-slate-900">{profileData.experience}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6 p-6 bg-slate-50/30 rounded-[32px] border border-slate-100/50 group hover:bg-slate-50 transition-colors">
                                                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-slate-600 shadow-sm transform group-hover:scale-110 transition-transform duration-500">
                                                    <Calendar className="w-7 h-7" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-800/60 uppercase tracking-wider mb-1">Active Since</p>
                                                    <p className="text-lg font-playfair font-semibold text-slate-900">{profileData.joinDate}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Stats & Settings */}
                            <div className="space-y-8">
                                <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/30 p-8">
                                    <h3 className="text-xl font-playfair font-semibold text-slate-900 mb-8 flex items-center gap-3">
                                        <Star className="w-5 h-5 text-slate-500" />
                                        Performance Stats
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center group hover:bg-white hover:shadow-lg transition-all">
                                            <span className="text-sm text-slate-500 font-bold uppercase tracking-wider">Users Managed</span>
                                            <span className="text-2xl font-playfair font-semibold text-slate-900">1,248</span>
                                        </div>
                                        <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center group hover:bg-white hover:shadow-lg transition-all border-l-4 border-l-primary">
                                            <span className="text-sm text-slate-500 font-bold uppercase tracking-wider">System Uptime</span>
                                            <div className="flex items-center gap-2">
                                                <Star className="w-4 h-4 text-primary fill-primary" />
                                                <span className="text-2xl font-playfair font-semibold text-slate-900">99.9%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/30 p-8">
                                    <h3 className="text-xl font-playfair font-semibold text-slate-900 mb-8 flex items-center gap-3">
                                        <Settings className="w-5 h-5 text-slate-400" />
                                        Admin Hub
                                    </h3>
                                    <div className="space-y-3">
                                        <SettingsItem icon={<Shield className="w-4.5 h-4.5" />} label="Security Settings" color="slate" />
                                        <SettingsItem icon={<Bell className="w-4.5 h-4.5" />} label="System Alerts" color="slate" />
                                        <SettingsItem icon={<Globe className="w-4.5 h-4.5" />} label="Platform Settings" color="slate" />
                                    </div>
                                </div>

                                <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden group">
                                    <div className="relative z-10 text-center">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-wider mb-4">
                                            <Shield className="w-3 h-3" />
                                            Root Access Verified
                                        </div>
                                        <h3 className="text-xl font-playfair font-semibold mb-2">Admin Badge</h3>
                                        <p className="text-slate-400 text-xs font-medium mb-6 leading-relaxed">Your administrative credentials have been fully verified by the Academy board.</p>
                                        <div className="w-16 h-16 bg-gradient-to-br from-slate-400 to-slate-600 rounded-xl mx-auto flex items-center justify-center shadow-lg shadow-slate-600/20 transform group-hover:rotate-12 transition-transform duration-500">
                                            <Check className="w-8 h-8 text-white" />
                                        </div>
                                    </div>
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-600/10 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

function SettingsItem({ icon, label, color }: { icon: React.ReactNode, label: string, color: string }) {
    const colors = {
        gray: 'bg-gray-50 text-gray-600 group-hover:bg-yellow-600',
    };

    const colorClasses = colors[color as keyof typeof colors] || colors.gray;

    return (
        <button className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 group">
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center group-hover:text-white transition-all duration-300 ${colorClasses}`}>
                    {icon}
                </div>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">{label}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-900 group-hover:translate-x-1 transition-all" />
        </button>
    );
}
