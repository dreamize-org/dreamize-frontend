import { CreateRoadmapData, Roadmap, RoadmapStepStatus } from "@/types/roadmap";
import { apiClient } from "./client";
import { API_ENDPOINTS } from "./constants";

class RoadmapService {

    async createRoadmap(data: CreateRoadmapData) {
        const response = await apiClient.post<Roadmap>(API_ENDPOINTS.ROADMAPS, data);
        return response.data;
    }

    async getRoadmaps() {
        const response = await apiClient.get<Roadmap[]>(API_ENDPOINTS.ROADMAPS);
        return response.data;
    }

    async getRoadmapById(id: string) {
        const response = await apiClient.get<Roadmap>(API_ENDPOINTS.ROADMAP_BY_ID(id));
        return response.data;
    }

    async updateRoadmap(id: string, data: Partial<Roadmap>) {
        const response = await apiClient.put<Roadmap>(API_ENDPOINTS.ROADMAP_BY_ID(id), data);
        return response.data;
    }

    async deleteRoadmap(id: string) {
        const response = await apiClient.delete(API_ENDPOINTS.ROADMAP_BY_ID(id));
        return response.data;
    }

    async getTrainerRoadmaps(trainerId: string) {
        const response = await apiClient.get<Roadmap[]>(API_ENDPOINTS.ROADMAPS, { trainerId });
        return response.data;
    }

    async getStudentRoadmaps(studentId: string) {
        const response = await apiClient.get<Roadmap[]>(API_ENDPOINTS.ROADMAPS, { studentId });
        return response.data;
    }

    async approveRoadmap(id: string, approvedBy: string) {
        const response = await apiClient.post<Roadmap>(API_ENDPOINTS.ROADMAP_APPROVE(id), { approvedBy });
        return response.data;
    }

    async rejectRoadmap(id: string, rejectionReason: string) {
        const response = await apiClient.post<Roadmap>(API_ENDPOINTS.ROADMAP_REJECT(id), { rejectionReason });
        return response.data;
    }

    async completeMilestone(roadmapId: string, milestoneOrder: number, projectData: Partial<Roadmap>) {
        const response = await apiClient.post<Roadmap>(API_ENDPOINTS.MILESTONE_COMPLETE(roadmapId, milestoneOrder), projectData);
        return response.data;
    }

    async approveMilestone(roadmapId: string, milestoneOrder: number, trainerFeedback: string) {
        const response = await apiClient.post<Roadmap>(API_ENDPOINTS.MILESTONE_APPROVE(roadmapId, milestoneOrder), {
            feedback: trainerFeedback,
            trainerFeedback,
        });
        return response.data;
    }

    async rejectMilestone(roadmapId: string, milestoneOrder: number, trainerFeedback: string) {
        const response = await apiClient.post<Roadmap>(`/api/roadmaps/${roadmapId}/milestones/${milestoneOrder}/reject`, {
            feedback: trainerFeedback,
            trainerFeedback,
        });
        return response.data;
    }

    async updateMilestoneStatus(roadmapId: string, milestoneOrder: number, status: RoadmapStepStatus, trainerFeedback?: string) {
        const roadmap = await this.getRoadmapById(roadmapId);
        const updatedMilestones = roadmap?.milestones.map(m =>
            m.order === milestoneOrder ? { ...m, status, ...(trainerFeedback && { trainerFeedback }) } : m
        );
        const response = await this.updateRoadmap(roadmapId, { milestones: updatedMilestones });
        return response;
    }
}

export const roadmapService = new RoadmapService()