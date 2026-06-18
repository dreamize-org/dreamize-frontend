"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { CreateRoadmapData, Roadmap } from "@/types/roadmap";
import { roadmapService } from "@/services/roadmap";
import { useAuth } from "./AuthContext";

interface RoadmapContextType {
    roadmaps: Roadmap[];
    studentRoadmaps: Roadmap[];
    loading: boolean;
    isLoading: boolean;
    error: string | null;
    createRoadmap: (data: CreateRoadmapData) => Promise<Roadmap>;
    refreshRoadmaps: () => Promise<void>;
    // Backward compatibility methods
    getStudentRoadmaps: () => Roadmap[];
    getRoadmapByIdFromContext: (id: string) => Roadmap | undefined;
}

const RoadmapContext = createContext<RoadmapContextType | null>(null);

export const RoadmapProvider = ({ children }: { children: React.ReactNode }) => {
    const { user, sessionEpoch, isSessionReady } = useAuth();
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);

    const fetchRoadmaps = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await roadmapService.getRoadmaps();
            setRoadmaps(response || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch roadmaps');
            setRoadmaps([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const createRoadmap = async (data: CreateRoadmapData): Promise<Roadmap> => {
        try {
            setError(null);
            const newRoadmap = await roadmapService.createRoadmap(data);
            await fetchRoadmaps();
            return newRoadmap!;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create roadmap');
            throw err;
        }
    };

    const refreshRoadmaps = async () => {
        await fetchRoadmaps();
    };

    // Backward compatibility methods
    const getStudentRoadmaps = () => roadmaps;
    const getRoadmapByIdFromContext = (id: string) => roadmaps.find(r => r.id === id);

    useEffect(() => {
        if (!user?._id || !isSessionReady) {
            setRoadmaps([]);
            setError(null);
            setLoading(false);
            return;
        }

        fetchRoadmaps();
    }, [user?._id, user?.role, sessionEpoch, isSessionReady, fetchRoadmaps]);

    return (
        <RoadmapContext.Provider value={{
            roadmaps,
            studentRoadmaps: roadmaps, // For backward compatibility
            loading,
            isLoading: loading, // For backward compatibility
            error,
            createRoadmap,
            refreshRoadmaps,
            getStudentRoadmaps,
            getRoadmapByIdFromContext,
        }}>
            {children}
        </RoadmapContext.Provider>
    );
};

export function useRoadmaps() {
    const context = useContext(RoadmapContext);
    if (!context) {
        throw new Error('useRoadmaps must be used within a RoadmapProvider');
    }
    return context;
}
