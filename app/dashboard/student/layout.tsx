'use client';

import StudentLearningGate from '@/components/student/StudentLearningGate';

export default function StudentDashboardLayout({ children }: { children: React.ReactNode }) {
  return <StudentLearningGate>{children}</StudentLearningGate>;
}
