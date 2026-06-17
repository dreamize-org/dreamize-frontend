import { BaseUser } from "./user";

export enum BookingStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface StudentBookingRequest {
  trainerId: string;
  requestedTime: Date;
  learningGoals: string;
}

export interface TrainerApprovalRequest {
  approvalNotes: string;
  sessionDuration: number; // in minutes
  sessionFormat: 'online' | 'in-person';
  sessionLocation?: string; // optional for online — Zoom link is auto-generated on the backend
  preparationRequirements: string;
  nextSteps: string;
}

export interface Booking  {
  id: string;
  student: BaseUser;
  trainer: BaseUser;
  requestedTime: Date;
  learningGoals: string;
  status: BookingStatus;
  rejectionReason?: string;
  
  // Approval details (when approved)
  approvalNotes?: string;
  sessionDuration?: number; // in minutes
  sessionFormat?: 'online' | 'in-person';
  sessionLocation?: string; // URL or physical address
  preparationRequirements?: string;
  nextSteps?: string;
  
  approvedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
