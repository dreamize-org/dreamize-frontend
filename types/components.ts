import type { ReactNode } from "react";
import { UserRole, OnboardingChecklist } from "./user";

export interface SidebarItem {
  id: string;
  icon: ReactNode;
  label: string;
  href: string;
  active?: boolean;
  exact?: boolean;
  matchPaths?: string[];
  hasDropdown?: boolean;
  badge?: string;
  disabled?: boolean;
  disabledReason?: string;
}

export type SidebarNavEntry =
  | SidebarItem
  | { type: 'section'; label: string };

export interface SidebarProps {
  activeItem?: string;
  userType?: UserRole;
  onboardingChecklist?: OnboardingChecklist;
}


export interface FormError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: FormError[];
  isSubmitting: boolean;
  isValid: boolean;
}