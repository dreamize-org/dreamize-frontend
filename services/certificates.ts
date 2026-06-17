import { apiClient } from './client';
import { API_ENDPOINTS, BASE_URL } from './constants';
import type { ApiResponse } from '@/types';

export interface CertificateRecord {
  _id: string;
  id: string;
  certificateNumber: string;
  student: string;
  studentName: string;
  roadmapId: string;
  milestoneId: string;
  milestoneName: string;
  trainer: string;
  trainerName: string;
  completionDate: string;
  pdfUrl: string;
}

class CertificateService {
  async getMyCertificates(): Promise<ApiResponse<CertificateRecord[]>> {
    return apiClient.get<CertificateRecord[]>(API_ENDPOINTS.CERTIFICATES);
  }

  getViewUrl(certificate: Pick<CertificateRecord, '_id' | 'pdfUrl'>): string {
    if (certificate.pdfUrl.startsWith('http')) {
      return certificate.pdfUrl;
    }
    return `${BASE_URL}${certificate.pdfUrl || API_ENDPOINTS.CERTIFICATE_VIEW(certificate._id)}`;
  }
}

export const certificateService = new CertificateService();
