'use client'

import { useState, type SVGProps } from 'react';
import { useRouter } from '@/hooks/useRouter';
import { AuthContainer } from '@/components/auth/auth-container';
import { AuthCard } from '@/components/auth/auth-card';
import { PremiumInput } from '@/components/ui/premium-input';
import { PremiumButton } from '@/components/ui/premium-button';
import { Calendar, User, Mail, Phone, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, StudentRegister } from '@/types';

export default function StudentDetailsPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    dateOfBirth: '',
    gender: '',
    guardianName: '',
    guardianEmail: '',
    guardianPhoneNumber: ''
  });
  const [errors, setErrors] = useState({
    dateOfBirth: '',
    gender: '',
    guardianName: '',
    guardianEmail: '',
    guardianPhoneNumber: ''
  });
  const [showGuardianFields, setShowGuardianFields] = useState(false);

  const { registerStudent, isLoading } = useAuth();

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));

    // Check if student is under 15 to show guardian fields
    if (field === 'dateOfBirth' && value) {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;
      setShowGuardianFields(actualAge < 15);
    }
  };

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = {
      dateOfBirth: '',
      gender: '',
      guardianName: '',
      guardianEmail: '',
      guardianPhoneNumber: ''
    };

    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Please select your gender';

    // Check if guardian fields are required
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;

      if (actualAge < 15) {
        if (!formData.guardianName) newErrors.guardianName = 'Guardian name is required for students under 15';
        if (!formData.guardianEmail) newErrors.guardianEmail = 'Guardian email is required for students under 15';
        if (!formData.guardianPhoneNumber) newErrors.guardianPhoneNumber = 'Guardian phone number is required for students under 15';
      }
    }

    setErrors(newErrors);

    if (Object.values(newErrors).some(error => error !== '')) {
      return;
    }

    try {
      const baseData = {
        phoneNumber: localStorage.getItem('userPhoneNumber') || '',
        firstName: localStorage.getItem('userFirstName') || '',
        lastName: localStorage.getItem('userLastName') || '',
        email: localStorage.getItem('userEmail') || '',
        password: localStorage.getItem('userPassword') || ''
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
        dateOfBirth: new Date(formData.dateOfBirth).toISOString().split('T')[0],
        isVerified: false,
        otpCode: '',
        otpExpiry: "",
        resetToken: '',
        resetTokenExpiry: "",
        createdAt: "",
        updatedAt: "",
        guardianName: formData.guardianName,
        guardianEmail: formData.guardianEmail,
        guardianPhoneNumber: formData.guardianPhoneNumber
      };

      await registerStudent(studentData);
      router.push('/auth/verify');
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setErrors({
        dateOfBirth: '',
        gender: '',
        guardianName: '',
        guardianEmail: '',
        guardianPhoneNumber: ''
      })
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
            <PremiumInput
              label="Date of Birth"
              type="date"
              id="dateOfBirth"
              max={new Date().toISOString().split('T')[0]}
              value={formData.dateOfBirth}
              onChange={(e) => handleChange('dateOfBirth', e.target.value)}
              error={errors.dateOfBirth}
              icon={<Calendar size={18} />}
              required
            />

            <div className="space-y-2">
              <label className="block text-[13px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Gender
              </label>
              <div className="relative">
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className={`
                    w-full pl-4 pr-10 py-3 bg-slate-50 border rounded-xl 
                    focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary 
                    transition-all appearance-none text-slate-900 font-medium
                    ${errors.gender ? 'border-red-500' : 'border-slate-100'}
                  `}
                  required
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">N/A</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              {errors.gender && <p className="text-[12px] text-red-500 font-medium ml-1 italic">{errors.gender}</p>}
            </div>
          </div>

          {/* Guardian Fields - Show for students under 15 */}
          {showGuardianFields && (
            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-slate-800">Guardian Information</h3>
                  <p className="text-[12px] text-slate-500">Required for students under 15 years old.</p>
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
                required={showGuardianFields}
              />

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
                  required={showGuardianFields}
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
                  required={showGuardianFields}
                />
              </div>
            </div>
          )}

          <div className="pt-2">
            <PremiumButton
              type="submit"
              isLoading={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Complete Registration'}
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </PremiumButton>
          </div>

          {/* Progress indicators */}
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
