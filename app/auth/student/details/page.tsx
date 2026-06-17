'use client'

import { useState, type SVGProps } from 'react';
import { useRouter } from '@/hooks/useRouter';
import { AuthContainer } from '@/components/auth/auth-container';
import { AuthCard } from '@/components/auth/auth-card';
import { PremiumInput } from '@/components/ui/premium-input';
import { PremiumButton } from '@/components/ui/premium-button';
import { User, Mail, Phone, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AgeRange, UserRole, StudentRegister } from '@/types';

const AGE_RANGE_OPTIONS: { value: AgeRange; label: string }[] = [
  { value: 'under-13', label: 'Under 13' },
  { value: '13-17', label: '13–17' },
  { value: '18-24', label: '18–24' },
  { value: '25-34', label: '25–34' },
  { value: '35+', label: '35+' },
];

const GUARDIAN_RELATIONSHIPS = ['Parent', 'Guardian', 'Sibling', 'Sponsor', 'Other'];

export default function StudentDetailsPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    ageRange: '' as AgeRange | '',
    gender: '',
    guardianName: '',
    guardianRelationship: '',
    guardianEmail: '',
    guardianPhoneNumber: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { registerStudent, isLoading, error, clearError } = useAuth();

  const guardianRequired =
    formData.ageRange === 'under-13' || formData.ageRange === '13-17';

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const newErrors: Record<string, string> = {};

    if (!formData.ageRange) newErrors.ageRange = 'Please select your age range';
    if (!formData.gender) newErrors.gender = 'Please select your gender';

    const hasAnyGuardianField =
      formData.guardianName.trim() ||
      formData.guardianEmail.trim() ||
      formData.guardianPhoneNumber.trim() ||
      formData.guardianRelationship.trim();

    if (guardianRequired || hasAnyGuardianField) {
      if (!formData.guardianName.trim()) {
        newErrors.guardianName = guardianRequired
          ? 'Guardian name is required for students under 18'
          : 'Guardian name is required when adding guardian details';
      }
      if (!formData.guardianEmail.trim()) {
        newErrors.guardianEmail = guardianRequired
          ? 'Guardian email is required for students under 18'
          : 'Guardian email is required when adding guardian details';
      }
      if (guardianRequired && !formData.guardianRelationship.trim()) {
        newErrors.guardianRelationship = 'Relationship is required for students under 18';
      }
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const baseData = {
        phoneNumber: localStorage.getItem('userPhoneNumber') || '',
        firstName: localStorage.getItem('userFirstName') || '',
        lastName: localStorage.getItem('userLastName') || '',
        email: localStorage.getItem('userEmail') || '',
        password: localStorage.getItem('userPassword') || '',
      };

      const studentData: StudentRegister = {
        email: baseData.email,
        password: baseData.password,
        firstName: baseData.firstName,
        lastName: baseData.lastName,
        phoneNumber: baseData.phoneNumber,
        role: UserRole.STUDENT,
        isActive: true,
        gender: formData.gender,
        ageRange: formData.ageRange as AgeRange,
        isVerified: false,
        otpCode: '',
        otpExpiry: '',
        resetToken: '',
        resetTokenExpiry: '',
        createdAt: '',
        updatedAt: '',
        ...(formData.guardianEmail.trim()
          ? {
              guardianName: formData.guardianName.trim(),
              guardianEmail: formData.guardianEmail.trim(),
              guardianPhoneNumber: formData.guardianPhoneNumber.trim(),
              guardianRelationship: formData.guardianRelationship.trim() || undefined,
            }
          : {}),
      };

      await registerStudent(studentData);
    } catch (registrationError) {
      console.error('Registration failed:', registrationError);
    }
  };

  return (
    <AuthContainer>
      <AuthCard
        title="Personalize Your Journey"
        subtitle="Help us tailor the Dreamize experience to your unique profile."
      >
        <button
          onClick={() => router.push('/auth/student/register')}
          className="absolute top-5 left-5 sm:top-8 sm:left-8 p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-full transition-all group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        </button>

        <form onSubmit={handleContinue} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-[13px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Age Range
              </label>
              <div className="relative">
                <select
                  id="ageRange"
                  value={formData.ageRange}
                  onChange={(e) => handleChange('ageRange', e.target.value)}
                  className={`w-full pl-4 pr-10 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all appearance-none text-slate-900 font-medium ${errors.ageRange ? 'border-red-500' : 'border-slate-100'}`}
                  required
                >
                  <option value="">Select age range</option>
                  {AGE_RANGE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              {errors.ageRange && (
                <p className="text-[12px] text-red-500 font-medium ml-1 italic">{errors.ageRange}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-[13px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Gender
              </label>
              <div className="relative">
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className={`w-full pl-4 pr-10 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all appearance-none text-slate-900 font-medium ${errors.gender ? 'border-red-500' : 'border-slate-100'}`}
                  required
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              {errors.gender && (
                <p className="text-[12px] text-red-500 font-medium ml-1 italic">{errors.gender}</p>
              )}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="text-[14px] font-bold text-slate-800">Guardian Information</h3>
                <p className="text-[12px] text-slate-500">
                  {guardianRequired
                    ? 'Required for students under 18. We will email them an invitation.'
                    : 'Optional — add a parent or sponsor who should monitor progress.'}
                </p>
              </div>
            </div>

            <PremiumInput
              label="Guardian Full Name"
              type="text"
              id="guardianName"
              value={formData.guardianName}
              onChange={(e) => handleChange('guardianName', e.target.value)}
              placeholder="Full Name"
              error={errors.guardianName}
              icon={<User size={18} />}
              required={guardianRequired}
            />

            <div className="space-y-2">
              <label className="block text-[13px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Relationship
              </label>
              <div className="relative">
                <select
                  id="guardianRelationship"
                  value={formData.guardianRelationship}
                  onChange={(e) => handleChange('guardianRelationship', e.target.value)}
                  className={`w-full pl-4 pr-10 py-3 bg-white border rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all appearance-none text-slate-900 font-medium ${errors.guardianRelationship ? 'border-red-500' : 'border-slate-100'}`}
                >
                  <option value="">Select relationship</option>
                  {GUARDIAN_RELATIONSHIPS.map((relationship) => (
                    <option key={relationship} value={relationship}>
                      {relationship}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              {errors.guardianRelationship && (
                <p className="text-[12px] text-red-500 font-medium ml-1 italic">
                  {errors.guardianRelationship}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PremiumInput
                label="Guardian Email"
                type="email"
                id="guardianEmail"
                value={formData.guardianEmail}
                onChange={(e) => handleChange('guardianEmail', e.target.value)}
                placeholder="email@example.com"
                error={errors.guardianEmail}
                icon={<Mail size={18} />}
                required={guardianRequired}
              />
              <PremiumInput
                label="Guardian Phone"
                type="tel"
                id="guardianPhoneNumber"
                value={formData.guardianPhoneNumber}
                onChange={(e) => handleChange('guardianPhoneNumber', e.target.value)}
                placeholder="+250..."
                error={errors.guardianPhoneNumber}
                icon={<Phone size={18} />}
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-[14px] text-red-600 text-center font-medium">{error}</p>
            </div>
          )}

          <div className="pt-2">
            <PremiumButton type="submit" isLoading={isLoading}>
              {isLoading ? 'Creating Account...' : 'Complete Registration'}
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </PremiumButton>
          </div>

          <div className="flex justify-center items-center gap-3 pt-4">
            <div className="h-2 w-2 bg-slate-200 rounded-full"></div>
            <div className="h-2 w-12 bg-primary rounded-full shadow-sm shadow-primary/20"></div>
          </div>
        </form>

        <div className="mt-12 text-center text-[12px] text-slate-400 uppercase tracking-widest font-bold">
          © Dreamize 2025
        </div>
      </AuthCard>
    </AuthContainer>
  );
}

function ChevronDown(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
