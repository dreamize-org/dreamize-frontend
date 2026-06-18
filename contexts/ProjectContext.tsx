"use client"

import { projectService } from "@/services/project";
import { Project } from "@/types";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

interface ProjectContextType {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const { user, sessionEpoch, isSessionReady } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await projectService.getAllProjects();
      setProjects(response.data || []);
    } catch {
      setError('Failed to load projects');
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user?._id || !isSessionReady) {
      setProjects([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    loadProjects();
  }, [user?._id, user?.role, sessionEpoch, isSessionReady, loadProjects]);

  return (
    <ProjectContext.Provider value={{ projects, isLoading, error, refreshProjects: loadProjects }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
}