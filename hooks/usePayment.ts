import { useAuth } from "@/contexts";
import { paymentService } from "@/services";
import { useState } from "react";

export function usePayment() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const {fetchOnboardingChecklist}=useAuth()

    const payOriantaionPayment = async (promocode?: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await paymentService.payOriantaionPayment({ promocode });
            if (!response.success) {
                throw new Error(response.message || 'Payment processing failed');
            }
            await fetchOnboardingChecklist();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Payment processing failed';
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const paySubscriptionPayment = async (promocode?: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await paymentService.paySubscriptionPayment({ promocode });
            if (!response.success) {
                throw new Error(response.message || 'Payment processing failed');
            }
            await fetchOnboardingChecklist();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Payment processing failed';
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };


    return {
        isLoading,
        error,
        payOriantaionPayment,
        paySubscriptionPayment,
    }
}