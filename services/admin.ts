import { apiClient } from './client';
import { API_ENDPOINTS } from './constants';
import { ApiResponse, BaseUser, Trainer, Student, Payment } from '@/types';
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
    const response = await apiClient.get<Payment[]>(API_ENDPOINTS.ADMIN_PAYMENTS);
    if (!response.success || !response.data) {
      return {
        success: false,
        data: [],
        message: response.message || 'Failed to load payments',
      };
    }

    const payments: AdminPayment[] = response.data.map((payment) => ({
      _id: payment.id,
      userId: payment.student?._id || '',
      amount: payment.finalAmount ?? payment.amount,
      type: payment.type,
      status:
        payment.status === 'success'
          ? 'completed'
          : payment.status === 'failed'
            ? 'failed'
            : 'pending',
      createdAt: new Date(payment.paidAt).toISOString(),
      completedAt: payment.status === 'success' ? new Date(payment.paidAt).toISOString() : undefined,
    }));

    return {
      success: true,
      data: payments,
      message: 'Payments retrieved successfully',
    };
  }

  async updatePaymentStatus(paymentId: string, status: 'completed' | 'failed'): Promise<ApiResponse<AdminPayment>> {
    if (status !== 'completed') {
      return {
        success: false,
        data: {
          _id: paymentId,
          userId: '',
          amount: 0,
          type: 'orientation',
          status: 'failed',
          createdAt: new Date().toISOString(),
        },
        message: 'Only payment confirmation is supported',
      };
    }

    const response = await apiClient.post<Payment>(`${API_ENDPOINTS.ADMIN_PAYMENTS}/${paymentId}/confirm`, {});
    if (!response.success || !response.data) {
      return {
        success: false,
        data: {
          _id: paymentId,
          userId: '',
          amount: 0,
          type: 'orientation',
          status: 'pending',
          createdAt: new Date().toISOString(),
        },
        message: response.message || 'Failed to confirm payment',
      };
    }

    const payment = response.data;
    return {
      success: true,
      data: {
        _id: payment.id,
        userId: payment.student?._id || '',
        amount: payment.finalAmount ?? payment.amount,
        type: payment.type,
        status: 'completed',
        createdAt: new Date(payment.paidAt).toISOString(),
        completedAt: new Date(payment.paidAt).toISOString(),
      },
      message: 'Payment confirmed successfully',
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

  // Feedback & Support — no backend module yet; return empty list instead of mock data
  async getFeedbackTickets(): Promise<ApiResponse<FeedbackTicket[]>> {
    return {
      success: true,
      data: [],
      message: 'Feedback module not configured',
    };
  }

  async updateTicketStatus(_ticketId: string, _status: FeedbackTicket['status']): Promise<ApiResponse<FeedbackTicket>> {
    return {
      success: false,
      data: {
        _id: _ticketId,
        userId: '',
        subject: '',
        message: '',
        status: 'open',
        createdAt: new Date().toISOString(),
      },
      message: 'Feedback module not configured',
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
    const response = await apiClient.post<Roadmap>(API_ENDPOINTS.ROADMAP_REJECT(roadmapId), { rejectionReason });
    return response;
  }

  async activateRoadmap(roadmapId: string): Promise<ApiResponse<Roadmap>> {
    const response = await apiClient.post<Roadmap>(API_ENDPOINTS.ROADMAP_ACTIVATE(roadmapId), {});
    return response;
  }

  async setMilestoneLockState(
    roadmapId: string,
    milestoneOrder: number,
    locked: boolean
  ): Promise<ApiResponse<Roadmap>> {
    const response = await apiClient.patch<Roadmap>(
      API_ENDPOINTS.MILESTONE_LOCK(roadmapId, milestoneOrder),
      { locked }
    );
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
