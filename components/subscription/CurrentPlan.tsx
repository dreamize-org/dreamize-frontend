'use client';

import { ArrowRight, CheckCircle, Clock, Calendar, Shield, AlertCircle } from 'lucide-react';
import { useFinancial, useAuth, useUsers } from '@/contexts';
import { useMemo } from 'react';
import {
  getSubscriptionColorClasses,
  getSubscriptionColorFromDays,
  getSubscriptionStatusLabel,
} from '@/lib/subscription/access';

const features = [
  'Access to wing companies & mentors',
  'Collaborative roadmap creation',
  'Live training sessions',
  '1-on-1 mentor guidance',
  'Progress tracking & reports',
  'Certificate upon completion',
];

export default function CurrentPlan() {
  const { getUserSubscriptions, isLoading: financialLoading } = useFinancial();
  const { user } = useAuth();
  const { students, isLoading: usersLoading } = useUsers();
  const subscriptions = getUserSubscriptions();
  const activeSub = subscriptions.find(s => s.status === 'active') ?? null;

  // Get current student from students list
  const currentStudent = useMemo(() => {
    if (!user) return null;
    return students.find(s => s._id === user._id) ?? null;
  }, [students, user]);

  // Check subscription status from onboarding checklist
  const hasPaidFromOnboarding = currentStudent?.onboardingStatus?.subscriptionPayed ?? false;
  const hasActiveFromFlag = currentStudent?.hasActiveSubscription ?? false;

  // Combined subscription status (either from onboarding or subscription data)
  const hasActiveSubscription = hasPaidFromOnboarding || hasActiveFromFlag || !!activeSub;
  const isLoading = financialLoading || usersLoading;

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-32 mb-4"></div>
        <div className="h-2 bg-gray-200 rounded-full w-full mb-4"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
          ))}
        </div>
      </div>
    );
  }

  // Calculate days remaining
  const getDaysRemaining = () => {
    if (!activeSub) return 0;
    const end = new Date(activeSub.endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const daysRemaining = getDaysRemaining();
  const colorCode = getSubscriptionColorFromDays(daysRemaining);
  const colorClasses = getSubscriptionColorClasses(colorCode);
  const statusLabel = getSubscriptionStatusLabel(colorCode, daysRemaining);

  // Calculate progress percentage
  const getProgress = () => {
    if (!activeSub) return 0;
    const start = new Date(activeSub.startDate);
    const end = new Date(activeSub.endDate);
    const now = new Date();
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  const progress = getProgress();

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-yellow-100 rounded-lg">
          <Shield className="w-5 h-5 text-yellow-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          {hasActiveSubscription ? 'Current Plan' : 'No Active Plan'}
        </h3>
      </div>

      {/* Onboarding Status Banner */}
      {currentStudent && (
        <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
          hasPaidFromOnboarding ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
        }`}>
          {hasPaidFromOnboarding ? (
            <>
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700">
                Subscription paid (onboarding complete)
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-yellow-700">
                Subscription payment pending - complete onboarding to activate
              </span>
            </>
          )}
        </div>
      )}

      {activeSub ? (
        <>
          {/* Plan Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="text-xl font-bold text-gray-900">{activeSub.planName}</h4>
              <p className="text-sm text-gray-500 mt-1">
                Billed {activeSub.billingCycle}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {activeSub.amount.toLocaleString()} {activeSub.currency}
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${colorClasses.badge}`}>
                {statusLabel}
              </span>
            </div>
          </div>

          {/* Time Remaining */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {daysRemaining} days remaining
              </span>
              <span className={`font-medium ${colorClasses.text}`}>{statusLabel}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${colorClasses.bar}`}
                style={{ width: `${Math.max(4, Math.min(100, (daysRemaining / 30) * 100))}%` }}
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-gray-500">Started</p>
                <p className="font-medium text-gray-900">
                  {new Date(activeSub.startDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-gray-500">Renews on</p>
                <p className="font-medium text-gray-900">
                  {new Date(activeSub.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Auto-renew */}
          <div className="flex items-center justify-between py-3 border-t border-gray-100">
            <span className="text-sm text-gray-600">Auto-renewal</span>
            <span className={`text-sm font-medium ${activeSub.autoRenew ? 'text-green-600' : 'text-gray-500'}`}>
              {activeSub.autoRenew ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </>
      ) : hasActiveSubscription ? (
        <div className="text-center py-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg mb-4">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Subscription Active</span>
          </div>
          <p className="text-gray-500 mb-4">
            Your subscription is active based on your onboarding completion.
          </p>
          <a
            href="/dashboard/student/pay/subscription"
            className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors"
          >
            Extend Plan
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg mb-4">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Subscription Required</span>
          </div>
          <p className="text-gray-500 mb-4">
            Complete your onboarding and subscribe to access mentorship features.
          </p>
          <a
            href="/dashboard/student/pay/subscription"
            className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors"
          >
            Subscribe Now
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      )}

      {/* Features */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Plan includes:</h4>
        <div className="grid grid-cols-1 gap-2">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
              {feature}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
