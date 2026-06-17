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

  getDownloadUrl(certificateId: string): string {
    return `${BASE_URL}${API_ENDPOINTS.CERTIFICATE_DOWNLOAD(certificateId)}`;
  }

  async downloadCertificate(certificateId: string, filename: string) {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(this.getDownloadUrl(certificateId), {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!response.ok) {
      throw new Error('Unable to download certificate');
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `${filename}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(blobUrl);
  }
}

export const certificateService = new CertificateService();
