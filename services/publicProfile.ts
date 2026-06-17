import { apiClient } from './client';
import { API_ENDPOINTS, BASE_URL } from './constants';
import type { ApiResponse } from '@/types';

export interface PublicCertificate {
  _id: string;
  certificateNumber: string;
  milestoneName: string;
  trainerName: string;
  completionDate: string;
}

export interface PublicProject {
  _id: string;
  title: string;
  description: string;
  category: string;
  toolsUsed: string[];
  studentRole: string;
  evidence: Record<string, string | undefined>;
  trainerFeedback: string | null;
  approvedAt?: string;
  createdAt: string;
}

export interface PublicStudentProfile {
  studentId: string;
  slug: string;
  fullName: string;
  bio: string;
  avatarUrl: string;
  certificates: PublicCertificate[];
  approvedProjects: PublicProject[];
  trainerFeedback: string[];
}

class PublicProfileService {
  async getStudentProfile(identifier: string): Promise<ApiResponse<PublicStudentProfile>> {
    return apiClient.get<PublicStudentProfile>(API_ENDPOINTS.PUBLIC_STUDENT_PROFILE(identifier));
  }

  getPublicProfileUrl(slug: string): string {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/u/${slug}`;
    }
    return `/u/${slug}`;
  }

  getCertificateDownloadUrl(certificateId: string): string {
    return `${BASE_URL}${API_ENDPOINTS.CERTIFICATE_DOWNLOAD(certificateId)}`;
  }
}

export const publicProfileService = new PublicProfileService();
