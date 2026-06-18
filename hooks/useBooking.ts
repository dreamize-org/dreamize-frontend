import { bookingService } from '@/services/booking';
import { StudentBookingRequest } from '@/types';
import { useRefreshAppData } from '@/hooks/useRefreshAppData';
import { useState } from 'react';

export function useCreateBooking() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshAfterStudentMutation } = useRefreshAppData();

  const createBooking = async (data: StudentBookingRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      await bookingService.createBooking(data);
      await refreshAfterStudentMutation();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Booking creation failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    createBooking,
  };
}
