import { useAuth } from "@/contexts/AuthContext";
import { bookingService } from "@/services/booking";
import { StudentBookingRequest } from "@/types";
import { useState } from "react";

export function useCreateBooking() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { fetchOnboardingChecklist } = useAuth();
    
    const createBooking = async (data: StudentBookingRequest) => {
        setIsLoading(true);
        setError(null);
        try {
            await bookingService.createBooking(data);
            await fetchOnboardingChecklist();
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
