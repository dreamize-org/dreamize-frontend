import type { Roadmap } from '@/types/roadmap';
import { normalizeId } from '@/lib/auth/session';

export function getRoadmapTrainerId(roadmap: Roadmap): string {
  const trainer = roadmap.trainer as string | { _id?: string; id?: string };
  if (typeof trainer === 'string') {
    return normalizeId(trainer);
  }
  return normalizeId(trainer?._id) || normalizeId(trainer?.id);
}

export function getRoadmapStudentId(roadmap: Roadmap): string {
  const student = roadmap.student as string | { _id?: string; id?: string };
  if (typeof student === 'string') {
    return normalizeId(student);
  }
  return normalizeId(student?._id) || normalizeId(student?.id);
}
