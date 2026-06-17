export enum UserRole {
  STUDENT = 'student',
  GUARDIAN = 'guardian',
  TRAINER = 'trainer',
  SALES_MANAGER = 'sales_manager',
  ADMIN = 'admin'
}

export enum GuardianInviteState {
  INVITED = 'invited',
  ACTIVE = 'active',
  DECLINED = 'declined'
}



export interface OnboardingChecklist {
  accountCreated: boolean;
  bookingPayed: boolean;
  subscriptionPayed: boolean;
  orientationBooked: boolean;
  roadmapReceived: boolean;
  learningStarted: boolean;
}

export interface Experience {
  yearsOfExperience: number;
  specializations: string[];
}


export interface BaseUser {
  _id: string
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: UserRole;
  isActive: boolean;
  gender: string;
  dateOfBirth: string;
  isVerified: boolean;
  otpCode: string;
  otpExpiry: string;
  resetToken: string;
  resetTokenExpiry: string;
  createdAt: string;
  updatedAt: string;
  status?: 'active' | 'pending' | 'inactive';
  profilePicture?: string;
}

export interface Guardian extends BaseUser {
  role: UserRole.GUARDIAN;
  linkedStudentIds: string[];
  inviteState: GuardianInviteState;
  inviteSentAt: string;
  passwordSetAt: string | null;
}

export type AgeRange = 'under-13' | '13-17' | '18-24' | '25-34' | '35+';

export interface Student extends BaseUser {
  role: UserRole.STUDENT;
  ageRange?: AgeRange;
  guardianIds: string[];
  guardianRelationship?: string | null;
  hasPaidOrientation: boolean;
  hasActiveSubscription: boolean;
  subscriptionExpiryDate: string | null;
  onboardingStatus: OnboardingChecklist;
  assignedTrainerId: string | null;
  currentRoadmapId: string | null;
  bio?: string;
  publicProfileSlug?: string;
  isPublicProfileEnabled?: boolean;
}

export interface Trainer extends BaseUser {
  cvUrl: string;
  introVideoUrl: string;
  experience: Experience;
  skills: string[];
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedBy?: string; // Admin ID who approved/rejected
  approvedAt?: Date;
  rejectionReason?: string;
}


export interface StudentRegister extends Partial<BaseUser> {
  ageRange?: AgeRange;
  guardianName?: string;
  guardianEmail?: string;
  guardianPhoneNumber?: string;
  guardianRelationship?: string;
}