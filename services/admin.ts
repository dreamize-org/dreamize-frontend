import { apiClient } from './client';
import { API_ENDPOINTS } from './constants';
import { ApiResponse, BaseUser, Trainer, Student } from '@/types';
import { Roadmap } from '@/types/roadmap';

// Admin-specific types
export interface AdminPayment {
  _id: string;
  userId: string;
  amount: number;
  type: 'orientation' | 'subscription';
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
}

export interface AdminAnalytics {
  usersByRole: {
    student: number;
    trainer: number;
  };
  totalRevenue: number;
  monthlyRevenue: number;
  activeRoadmaps: number;
  pendingTrainers: number;
  activeSubscriptions: number;
  totalCertificates: number;
}

export interface FeedbackTicket {
  _id: string;
  userId: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
}

export interface TrainerApprovalRequest {
  trainerId: string;
  approvedBy: string;
  rejectionReason?: string;
}

class AdminService {
  // Users Management
  async getUsers(): Promise<ApiResponse<BaseUser[]>> {
    const response = await apiClient.get<BaseUser[]>(API_ENDPOINTS.USERS);
    return response;
  }

  async getUserById(userId: string): Promise<ApiResponse<BaseUser>> {
    const response = await apiClient.get<BaseUser>(API_ENDPOINTS.USER_BY_ID(userId));
    return response;
  }

  async updateUserStatus(userId: string, status: string): Promise<ApiResponse<BaseUser>> {
    const response = await apiClient.patch<BaseUser>(API_ENDPOINTS.USER_STATUS(userId), { status });
    return response;
  }

  // Trainers Management
  async getTrainers(): Promise<ApiResponse<Trainer[]>> {
    const response = await apiClient.get<Trainer[]>(API_ENDPOINTS.USERS_TRAINERS);
    return response;
  }

  async getPendingTrainers(): Promise<ApiResponse<Trainer[]>> {
    const response = await apiClient.get<Trainer[]>(API_ENDPOINTS.TRAINERS_PENDING)
    return response
  }

  async approveTrainer(trainerId: string, approvedBy: string): Promise<ApiResponse<Trainer>> {
    const response = await apiClient.post<Trainer>(API_ENDPOINTS.ADMIN_APPROVE_TRAINER(trainerId), { approvedBy });
    return response;
  }

  async rejectTrainer(trainerId: string, rejectionReason: string): Promise<ApiResponse<Trainer>> {
    const response = await apiClient.post<Trainer>(API_ENDPOINTS.ADMIN_REJECT_TRAINER(trainerId), { rejectionReason });
    return response;
  }

  // Students Management
  async getStudents(): Promise<ApiResponse<Student[]>> {
    const response = await apiClient.get<Student[]>(API_ENDPOINTS.USERS_STUDENTS);
    return response;
  }

  async getStudentById(studentId: string): Promise<ApiResponse<Student>> {
    const response = await apiClient.get<Student>(API_ENDPOINTS.USER_BY_ID(studentId));
    return response;
  }

  // Payments Management
  async getPayments(): Promise<ApiResponse<AdminPayment[]>> {
    // For now, return mock data since the endpoint might not exist
    const mockPayments: AdminPayment[] = [
      {
        _id: '1',
        userId: 'user1',
        amount: 50000,
        type: 'orientation',
        status: 'completed',
        createdAt: new Date().toISOString(),
      },
      {
        _id: '2',
        userId: 'user2',
        amount: 100000,
        type: 'subscription',
        status: 'pending',
        createdAt: new Date().toISOString(),
      }
    ];

    return {
      success: true,
      data: mockPayments,
      message: 'Payments retrieved successfully'
    };
  }

  async updatePaymentStatus(paymentId: string, status: 'completed' | 'failed'): Promise<ApiResponse<AdminPayment>> {
    // This would typically call an API endpoint
    // For now, return a mock response
    return {
      success: true,
      data: {
        _id: paymentId,
        userId: 'user1',
        amount: 50000,
        type: 'orientation',
        status,
        createdAt: new Date().toISOString(),
        completedAt: status === 'completed' ? new Date().toISOString() : undefined
      },
      message: `Payment status updated to ${status}`
    };
  }

  // Analytics
  async getAnalytics(): Promise<ApiResponse<AdminAnalytics>> {
    return apiClient.get<AdminAnalytics>(API_ENDPOINTS.ADMIN_ANALYTICS);
  }

  async getCertificates(search?: string): Promise<ApiResponse<import('./certificates').CertificateRecord[]>> {
    const suffix = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiClient.get(`${API_ENDPOINTS.ADMIN_CERTIFICATES}${suffix}`);
  }

  // Feedback & Support
  async getFeedbackTickets(): Promise<ApiResponse<FeedbackTicket[]>> {
    // For now, return mock data since the endpoint might not exist
    const mockTickets: FeedbackTicket[] = [
      {
        _id: '1',
        userId: 'user1',
        subject: 'Login Issue',
        message: 'User cannot login to their account',
        status: 'open',
        createdAt: new Date().toISOString(),
      },
      {
        _id: '2',
        userId: 'user2',
        subject: 'Payment Problem',
        message: 'Payment was processed but subscription not activated',
        status: 'in_progress',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];

    return {
      success: true,
      data: mockTickets,
      message: 'Feedback tickets retrieved successfully'
    };
  }

  async updateTicketStatus(ticketId: string, status: FeedbackTicket['status']): Promise<ApiResponse<FeedbackTicket>> {
    // This would typically call an API endpoint
    // For now, return a mock response
    return {
      success: true,
      data: {
        _id: ticketId,
        userId: 'user1',
        subject: 'Login Issue',
        message: 'User cannot login to their account',
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        resolvedAt: status === 'resolved' ? new Date().toISOString() : undefined
      },
      message: `Ticket status updated to ${status}`
    };
  }

  // Roadmaps Management
  async getRoadmaps(): Promise<ApiResponse<Roadmap[]>> {
    const response = await apiClient.get<Roadmap[]>(API_ENDPOINTS.ROADMAPS)
    return response
  }

  async getPendingRoadmaps(): Promise<ApiResponse<Roadmap[]>> {
    const allRoadmaps = await this.getRoadmaps();
    const pendingRoadmaps = allRoadmaps.data?.filter(roadmap => roadmap.status === 'pending-approval') || [];

    return {
      success: true,
      data: pendingRoadmaps,
      message: 'Pending roadmaps retrieved successfully'
    };
  }

  async approveRoadmap(roadmapId: string, approvedBy: string): Promise<ApiResponse<Roadmap>> {
    // This would typically call API_ENDPOINTS.ROADMAP_APPROVE(roadmapId)
    const response = await apiClient.post<Roadmap>(API_ENDPOINTS.ROADMAP_APPROVE(roadmapId), { approvedBy });
    return response;
  }

  async rejectRoadmap(roadmapId: string, rejectionReason: string): Promise<ApiResponse<Roadmap>> {
    // This would typically call API_ENDPOINTS.ROADMAP_REJECT(roadmapId)
    const response = await apiClient.post<Roadmap>(API_ENDPOINTS.ROADMAP_REJECT(roadmapId), { rejectionReason });
    return response;
  }

  // Dashboard Data
  async getDashboardData(): Promise<ApiResponse<{
    users: BaseUser[];
    trainers: Trainer[];
    students: Student[];
    payments: AdminPayment[];
    analytics: AdminAnalytics;
    tickets: FeedbackTicket[];
    roadmaps: Roadmap[];
  }>> {
    const [users, trainers, students, payments, analytics, tickets, roadmaps] = await Promise.all([
      this.getUsers(),
      this.getTrainers(),
      this.getStudents(),
      this.getPayments(),
      this.getAnalytics(),
      this.getFeedbackTickets(),
      this.getRoadmaps(),
    ]);

    if (!users.data || !trainers.data || !students.data || !payments.data || !analytics.data || !tickets.data || !roadmaps.data) {
      return {
        success: false,
        data: {
          users: [],
          trainers: [],
          students: [],
          payments: [],
          analytics: {
            usersByRole: { student: 0, trainer: 0 },
            totalRevenue: 0,
            monthlyRevenue: 0,
            activeRoadmaps: 0,
            pendingTrainers: 0,
            activeSubscriptions: 0,
            totalCertificates: 0,
          },
          tickets: [],
          roadmaps: []
        },
        message: 'Failed to load dashboard data'
      };
    }

    return {
      success: true,
      data: {
        users: users.data,
        trainers: trainers.data,
        students: students.data,
        payments: payments.data,
        analytics: analytics.data,
        tickets: tickets.data,
        roadmaps: roadmaps.data
      },
      message: 'Dashboard data retrieved successfully'
    };
  }
}

export const adminService = new AdminService();
