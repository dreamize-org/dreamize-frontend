import { apiClient } from './client';
import { API_ENDPOINTS } from './constants';
import { Payment } from '@/types';
import { ApiResponse } from '@/types/api';

export interface InitiatePaymentData {
  promocode?: string
}

class PaymentService {
  async payOriantaionPayment(data: InitiatePaymentData): Promise<ApiResponse<Payment>> {
    return apiClient.post<Payment>(API_ENDPOINTS.PAYMENT_ORIANTATION, {
      promoCode: data.promocode,
    });
  }

  async paySubscriptionPayment(data: InitiatePaymentData): Promise<ApiResponse<Payment>> {
    return apiClient.post<Payment>(API_ENDPOINTS.PAYMENT_SUBSCRIPTION, {
      promoCode: data.promocode,
    });
  }
}

export const paymentService = new PaymentService();
