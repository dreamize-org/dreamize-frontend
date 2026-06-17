'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Student, Trainer, BaseUser as User, UserRole } from '@/types';
import { userService } from '@/services/users';
import { useAuth } from './AuthContext';

interface UserContextType {
  users: User[];
  students: Student[];
  trainers: Trainer[];
  isLoading: boolean;
  error: string | null;
  getUsersByRole: (role: UserRole) => User[];
  getUserByIdFromContext: (id: string) => User | undefined;
  refreshUsers: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (userRole === UserRole.TRAINER) {
        const [studentResponse, trainerResponse] = await Promise.all([
          userService.getMyStudents(),
          userService.getTrainers(),
        ]);
        const studentsData = studentResponse.data || [];
        const trainersData = trainerResponse.data || [];
        setTrainers(trainersData);
        setStudents(studentsData);
        setUsers([...studentsData, ...trainersData]);
        return;
      }

      const studentResponse = await userService.getStudents();
      const trainerResponse = await userService.getTrainers();
      const studentsData = studentResponse.data || [];
      const trainersData = trainerResponse.data || [];
      setTrainers(trainersData);
      setStudents(studentsData);
      setUsers([...studentsData, ...trainersData]);
    } catch {
      setError('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };



  const userId = currentUser?._id;
  const userRole = currentUser?.role;
  const shouldLoadDirectory =
    Boolean(userId) &&
    (userRole === UserRole.ADMIN || userRole === UserRole.TRAINER || userRole === UserRole.STUDENT);

  useEffect(() => {
    if (shouldLoadDirectory) {
      loadUsers();
    } else {
      setUsers([]);
      setStudents([]);
      setTrainers([]);
      setIsLoading(false);
    }
  }, [shouldLoadDirectory, userId, userRole]);


  const getUsersByRole = (role: UserRole) => users.filter(u => u.role === role);
  const getUserByIdFromContext = (id: string) => users.find(u => u._id === id);

  return (
    <UserContext.Provider value={{
      users,
      students,
      trainers,
      isLoading,
      error,
      getUsersByRole,
      getUserByIdFromContext,
      refreshUsers: loadUsers,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUsers() {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUsers must be used within a UserProvider');
  return context;
}
