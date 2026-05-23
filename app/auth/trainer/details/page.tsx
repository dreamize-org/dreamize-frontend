'use client'

import { useState, type SVGProps } from 'react';
import { useRouter } from '@/hooks/useRouter';
import { AuthContainer } from '@/components/auth/auth-container';
import { AuthCard } from '@/components/auth/auth-card';
import { PremiumInput } from '@/components/ui/premium-input';
import { PremiumButton } from '@/components/ui/premium-button';
import { Calendar, Clock, FileText, Video, ArrowLeft, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Trainer, UserRole } from '@/types';

export default function TrainerDetailsPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    dateOfBirth: '',
    gender: '',
    cvUrl: '',
    introVideoUrl: '',
    yearsOfExperience: '',
    specializations: [] as string[],
    skills: [] as string[],
  });
  const [errors, setErrors] = useState({
    dateOfBirth: '',
    gender: '',
    cvUrl: '',
    introVideoUrl: '',
    yearsOfExperience: '',
    specializations: '',
    skills: '',
  });

  const expertiseOptions = [
    "Web Development", "Mobile Development", "Data Science", "Machine Learning",
    "UI/UX Design", "Digital Marketing", "Business Strategy", "Finance",
    "Photography", "Video Production", "Content Writing", "Graphic Design",
    "Project Management", "Cybersecurity", "Cloud Computing", "DevOps"
  ];

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const toggleSpecialization = (specialization: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(specialization)
        ? prev.specializations.filter(s => s !== specialization)
        : [...prev.specializations, specialization]
    }));
  };

  const { registerTrainer, isLoading } = useAuth();

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = {
      dateOfBirth: '',
      gender: '',
      cvUrl: '',
      introVideoUrl: '',
      yearsOfExperience: '',
      specializations: '',
      skills: ''
    };

    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Please select your gender';
    if (!formData.cvUrl) newErrors.cvUrl = 'CV URL is required';
    if (!formData.introVideoUrl) newErrors.introVideoUrl = 'Intro video URL is required';
    if (!formData.yearsOfExperience) newErrors.yearsOfExperience = 'Years of experience is required';
    if (formData.specializations.length === 0) newErrors.specializations = 'Please select at least one specialization';
    if (formData.skills.length === 0) newErrors.skills = 'Please select at least one skill';

    setErrors(newErrors);

    if (Object.values(newErrors).some(error => error !== '')) {
      return;
    }

    try {
      const baseData = {
        firstName: localStorage.getItem('userFirstName') || '',
        lastName: localStorage.getItem('userLastName') || '',
        email: localStorage.getItem('userEmail') || '',
        password: localStorage.getItem('userPassword') || '',
        phoneNumber: localStorage.getItem('userPhoneNumber') || ''
      };

      const trainerData: Partial<Trainer> = {
        email: baseData.email,
        password: baseData.password,
        firstName: baseData.firstName,
        lastName: baseData.lastName,
        phoneNumber: baseData.phoneNumber,
        role: UserRole.TRAINER as const,
        isActive: true,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        isVerified: false,
        otpCode: '',
        otpExpiry: '',
        resetToken: '',
        resetTokenExpiry: '',
        createdAt: '',
        updatedAt: '',
        cvUrl: formData.cvUrl,
        introVideoUrl: formData.introVideoUrl,
        experience: {
          yearsOfExperience: parseInt(formData.yearsOfExperience) || 0,
          specializations: formData.specializations
        },
        skills: formData.skills,
        approvalStatus: 'pending' as const
      };

      await registerTrainer(trainerData);

    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setErrors({
        dateOfBirth: '',
        gender: '',
        cvUrl: '',
        introVideoUrl: '',
        yearsOfExperience: '',
        specializations: '',
        skills: '',
      })
    }
  };

  return (
    <AuthContainer>
      <AuthCard
        title="Professional Profile"
        subtitle="Showcase your expertise and join our network of world-class trainers."
      >
        <button
          onClick={() => router.push('/auth/trainer/register')}
          className="absolute top-5 left-5 sm:top-8 sm:left-8 p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-full transition-all group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        </button>

        <form onSubmit={handleContinue} className="space-y-6 mt-4">
          {/* Section 1: Personal Info */}
          <div className="space-y-4">
            <h3 className="text-[14px] font-bold text-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-[12px]">1</span>
              Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PremiumInput
                label="Date of Birth"
                type="date"
                id="dateOfBirth"
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
                    className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all appearance-none text-slate-900 font-medium"
                    required
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Links */}
          <div className="space-y-4">
            <h3 className="text-[14px] font-bold text-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-[12px]">2</span>
              Professional Links
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PremiumInput
                label="CV/Portfolio URL"
                type="url"
                id="cvUrl"
                value={formData.cvUrl}
                onChange={(e) => handleChange('cvUrl', e.target.value)}
                placeholder="https://linkedin.com/in/..."
                error={errors.cvUrl}
                icon={<FileText size={18} />}
                required
              />
              <PremiumInput
                label="Intro Video URL"
                type="url"
                id="introVideoUrl"
                value={formData.introVideoUrl}
                onChange={(e) => handleChange('introVideoUrl', e.target.value)}
                placeholder="https://youtube.com/..."
                error={errors.introVideoUrl}
                icon={<Video size={18} />}
                required
              />
            </div>
          </div>

          {/* Section 3: Experience */}
          <div className="space-y-4">
            <h3 className="text-[14px] font-bold text-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-[12px]">3</span>
              Expertise & Skills
            </h3>

            <PremiumInput
              label="Years of Experience"
              type="number"
              id="yearsOfExperience"
              value={formData.yearsOfExperience}
              onChange={(e) => handleChange('yearsOfExperience', e.target.value)}
              placeholder="e.g. 5"
              error={errors.yearsOfExperience}
              icon={<Clock size={18} />}
              required
            />

            <div className="space-y-3">
              <label className="block text-[13px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Specializations <span className="text-primary">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {expertiseOptions.slice(0, 8).map((spec) => (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => toggleSpecialization(spec)}
                    className={`
                      px-4 py-2 rounded-full text-[13px] font-medium transition-all border
                      ${formData.specializations.includes(spec)
                        ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-primary/30 hover:bg-primary/5'}
                    `}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-[13px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Top Skills <span className="text-primary">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {expertiseOptions.slice(8).map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`
                      px-4 py-2 rounded-full text-[13px] font-medium transition-all border
                      ${formData.skills.includes(skill)
                        ? 'bg-slate-800 border-slate-800 text-white shadow-lg shadow-slate-200 scale-105'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50'}
                    `}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4">
            <PremiumButton
              type="submit"
              isLoading={isLoading}
            >
              {isLoading ? 'Submitting Application...' : 'Submit Application'}
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
