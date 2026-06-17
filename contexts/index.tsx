export { AuthProvider, useAuth } from './AuthContext';
export { AdminProvider, useAdminContext } from './AdminContext';
export { UserProvider, useUsers } from './UserContext';
export { RoadmapProvider, useRoadmaps } from './RoadmapContext';
export { ProjectProvider, useProjects } from './ProjectContext';
export { FinancialProvider, useFinancial } from './FinancialContext';
export { SystemProvider, useSystem } from './SystemContext';

// Combined provider component for easy setup
import React from 'react';
import { AuthProvider } from './AuthContext';
import { UserProvider } from './UserContext';
import { RoadmapProvider } from './RoadmapContext';
import { FinancialProvider } from './FinancialContext';
import { SystemProvider } from './SystemContext';
import { BookingProvider } from './BookingContext';
import { ProjectProvider } from './ProjectContext';

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AuthProvider>
      <UserProvider>
        <BookingProvider>
          <RoadmapProvider>
            <ProjectProvider>
              <FinancialProvider>
                <SystemProvider>
                  {children}
                </SystemProvider>
              </FinancialProvider>
            </ProjectProvider>
          </RoadmapProvider>
        </BookingProvider>
      </UserProvider>
    </AuthProvider>
  );
}