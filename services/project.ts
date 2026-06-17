import { Project } from "@/types";
import { apiClient } from "./client";
import { API_ENDPOINTS } from "./constants";

class ProjectService {
  async getProjectData(projectId: string) {
    return apiClient.get<Project>(API_ENDPOINTS.PROJECT_BY_ID(projectId));
  }

  async getAllProjects() {
    return apiClient.get<Project[]>(API_ENDPOINTS.PROJECT);
  }

  async approveProject(projectId: string, feedback?: string) {
    return apiClient.post<Project>(API_ENDPOINTS.PROJECT_APPROVE(projectId), {
      feedback,
      trainerFeedback: feedback,
    });
  }

  async rejectProject(projectId: string, feedback?: string) {
    return apiClient.post<Project>(API_ENDPOINTS.PROJECT_REJECT(projectId), {
      feedback,
      trainerFeedback: feedback,
    });
  }
}

export const projectService = new ProjectService();

export function getProjectStudentId(project: Project): string {
  if (typeof project.student === 'string') {
    return project.student;
  }
  return project.student?._id ?? '';
}
