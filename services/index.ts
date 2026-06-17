// Dreamize services barrel export
export * from './constants';
export * from './client';
export { authService } from './auth';
export { userService } from './users';
export { paymentService } from './payments';
export { notificationService } from './notification';
export { messageService } from './messages';
export { fileService } from './files';
export { certificateService } from './certificates';
export { publicProfileService } from './publicProfile';
export type { PublicStudentProfile } from './publicProfile';
export type { MessageAttachment } from './files';
export type { CertificateRecord } from './certificates';
export { default as socketService } from './socket';
export { statsService } from './stats';
export type { StatsResponse } from './stats';
