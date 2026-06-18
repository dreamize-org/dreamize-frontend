"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Booking, TrainerApprovalRequest } from "@/types/booking";
import { bookingService } from "@/services/booking";
import { useAuth } from "./AuthContext";
import { UserRole } from "@/types";

interface BookingContextType {
    trainerPendingBookings: Booking[];
    trainerAllBookings: Booking[];
    studentBookings: Booking[];
    loading: boolean;
    error: string | null;
    approveBooking: (bookingId: string, approvalData: TrainerApprovalRequest) => Promise<void>;
    rejectBooking: (bookingId: string, reason: string) => Promise<void>;
    cancelBooking: (bookingId: string) => Promise<void>;
    refreshBookings: () => Promise<void>;
}

const BookingContext = createContext<BookingContextType | null>(null);

export const BookingProvider = ({ children }: { children: React.ReactNode }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [trainerPendingBookings, setTrainerPendingBookings] = useState<Booking[]>([]);
    const [trainerAllBookings, setTrainerAllBookings] = useState<Booking[]>([]);
    const [studentBookings, setStudentBookings] = useState<Booking[]>([]);
    const { user, isLoading: authLoading, sessionEpoch } = useAuth();

    const fetchStudentBookings = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await bookingService.getStudentBookings();
            setStudentBookings(response.data ?? []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch student bookings');
            setStudentBookings([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchTrainerBookings = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const [pendingResponse, allResponse] = await Promise.all([
                bookingService.getTrainerPendingBookings(),
                bookingService.getTrainerAllBookings(),
            ]);

            setTrainerPendingBookings(pendingResponse.data ?? []);
            setTrainerAllBookings(allResponse.data ?? []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
            setTrainerPendingBookings([]);
            setTrainerAllBookings([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (authLoading) return;

        if (user?.role === UserRole.STUDENT) {
            fetchStudentBookings();
            return;
        }

        if (user?.role === UserRole.TRAINER) {
            fetchTrainerBookings();
            return;
        }

        setLoading(false);
        setStudentBookings([]);
        setTrainerPendingBookings([]);
        setTrainerAllBookings([]);
    }, [authLoading, user?.role, user?._id, sessionEpoch, fetchStudentBookings, fetchTrainerBookings]);

    const approveBooking = async (bookingId: string, approvalData: TrainerApprovalRequest) => {
        try {
            await bookingService.approveBooking(bookingId, approvalData);
            await fetchTrainerBookings();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to approve booking';
            setError(message);
            throw err;
        }
    };

    const rejectBooking = async (bookingId: string, reason: string) => {
        try {
            await bookingService.rejectBooking(bookingId, reason);
            await fetchTrainerBookings();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to reject booking';
            setError(message);
            throw err;
        }
    };

    const cancelBooking = async (bookingId: string) => {
        try {
            await bookingService.cancelBooking(bookingId);
            await fetchStudentBookings();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to cancel booking';
            setError(message);
            throw err;
        }
    };

    const refreshBookings = async () => {
        if (user?.role === UserRole.STUDENT) {
            await fetchStudentBookings();
        } else if (user?.role === UserRole.TRAINER) {
            await fetchTrainerBookings();
        }
    };

    return (
        <BookingContext.Provider value={{
            trainerPendingBookings,
            trainerAllBookings,
            studentBookings,
            loading: authLoading || loading,
            error,
            approveBooking,
            rejectBooking,
            cancelBooking,
            refreshBookings
        }}>
            {children}
        </BookingContext.Provider>
    );
};

export const useBooking = () => {
    const context = useContext(BookingContext);
    if (!context) {
        throw new Error('useBooking must be used within a BookingProvider');
    }
    return context;
};
