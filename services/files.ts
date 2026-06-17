import { apiClient } from './client';
import { API_ENDPOINTS } from './constants';

export interface MessageAttachment {
  url: string;
  name: string;
  mimeType: string;
  size: number;
}

interface UploadMessageFileResponse {
  success: boolean;
  data: MessageAttachment;
  message?: string;
}

class FileService {
  async uploadMessageFile(file: File): Promise<MessageAttachment> {
    const response = await apiClient.uploadFile<UploadMessageFileResponse>(
      API_ENDPOINTS.FILES.UPLOAD_MESSAGE,
      file
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to upload file');
    }

    return response.data;
  }
}

export const fileService = new FileService();
