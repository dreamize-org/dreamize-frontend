import type { Student } from '@/types';
import { getAuthUserId, normalizeId } from '@/lib/auth/session';

export function isStudentAssignedToTrainer(
  student: Pick<Student, 'assignedTrainerId'>,
  trainerId: string
): boolean {
  const resolvedTrainerId = normalizeId(trainerId);
  const assignedTrainerId = normalizeId(student.assignedTrainerId);
  return Boolean(resolvedTrainerId && assignedTrainerId && assignedTrainerId === resolvedTrainerId);
}

export function filterStudentsForTrainer(students: Student[], trainerId: string): Student[] {
  const resolvedTrainerId = getAuthUserId({ _id: trainerId });
  if (!resolvedTrainerId) return [];

  return students.filter((student) => {
    const assignedTrainerId = normalizeId(student.assignedTrainerId);
    return assignedTrainerId !== '' && assignedTrainerId === resolvedTrainerId;
  });
}
