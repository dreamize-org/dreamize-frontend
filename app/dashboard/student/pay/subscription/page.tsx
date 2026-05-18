'use client';

import { useState } from 'react';
import { useRouter } from '@/hooks/useRouter';
import { CreditCard, CheckCircle, ArrowLeft, Shield, Calendar, Sparkles, Zap, AlertCircle } from 'lucide-react';
import { usePayment } from '@/hooks/usePayment';
import Sidebar from '@/components/dashboard/Sidebar';
import { UserRole } from '@/types';

export default function SubscriptionPaymentPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'form' | 'processing' | 'success'>('form');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const { paySubscriptionPayment } = usePayment();
  const [formData, setFormData] = useState({
    phone: '',
    promoCode: ''
  });

  const monthlyPrice = 100000;
  const yearlyPrice = monthlyPrice * 12 * 0.9;
  const currentPrice = billingCycle === 'monthly' ? monthlyPrice : yearlyPrice;
  const savings = billingCycle === 'yearly' ? monthlyPrice * 12 * 0.1 : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setPaymentStep('processing');

    try {
      await paySubscriptionPayment(formData.promoCode);
      setPaymentStep('success');
      setTimeout(() => {
        router.push('/dashboard/student');
      }, 2000);
    } catch (error) {
      console.error('Payment failed:', error);
      setIsProcessing(false);
      setPaymentStep('form');
    }
  };

  const features = [
    'Unlimited mentor sessions',
    'Personalized learning roadmap',
    'Progress tracking & analytics',
    'Priority support',
    'Certificate of completion'
  ];

  return (
    <div className="flex min-h-screen lg:h-screen bg-[#FDF9F2]">
      <Sidebar activeItem="Home" userType={UserRole.STUDENT} />

      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <main className="flex-1 overflow-auto">
          <div className="min-h-full flex items-center justify-center p-8">
            <div className="w-full max-w-4xl">
              {/* Back Button */}
              <button
                onClick={() => router.push('/dashboard/student')}
                disabled={paymentStep === 'processing'}
                className="mb-4 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </button>

              {/* Payment Card */}
              <div className="bg-white rounded-[40px] shadow-xl border border-slate-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4">
                  <h1 className="text-xl font-playfair font-semibold text-white">Mentorship Subscription</h1>
                  <p className="text-white/80 text-sm mt-1">Unlock your full potential with personalized mentorship</p>
                </div>

                <div className="p-6">
                  {paymentStep === 'form' && (
                    <div className="grid lg:grid-cols-5 gap-8">
                      {/* Left: Plan Selection & Form */}
                      <div className="lg:col-span-3 space-y-6">
                        {/* Billing Cycle Selection */}
                        <div>
                          <h2 className="text-lg font-playfair font-semibold text-slate-900 mb-4">Choose Your Plan</h2>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                              type="button"
                              onClick={() => setBillingCycle('monthly')}
                              className={`p-4 border-2 rounded-xl transition-all text-left ${
                                billingCycle === 'monthly'
                                  ? 'border-primary bg-primary/10'
                                  : 'border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className={`font-medium ${billingCycle === 'monthly' ? 'text-primary' : 'text-slate-700'}`}>
                                  Monthly
                                </span>
                                {billingCycle === 'monthly' && <Sparkles className="w-4 h-4 text-primary" />}
                              </div>
                              <div className="text-2xl font-bold text-slate-900">
                                {monthlyPrice.toLocaleString()} <span className="text-sm font-normal text-slate-500">RWF/mo</span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1">Flexible, cancel anytime</p>
                            </button>

                            <button
                              type="button"
                              onClick={() => setBillingCycle('yearly')}
                              className={`p-4 border-2 rounded-xl transition-all text-left relative ${
                                billingCycle === 'yearly'
                                  ? 'border-primary bg-primary/10'
                                  : 'border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div className="absolute -top-3 right-4 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                                Save 10%
                              </div>
                              <div className="flex items-center justify-between mb-2">
                                <span className={`font-medium ${billingCycle === 'yearly' ? 'text-primary' : 'text-slate-700'}`}>
                                  Yearly
                                </span>
                                {billingCycle === 'yearly' && <Sparkles className="w-4 h-4 text-primary" />}
                              </div>
                              <div className="text-2xl font-bold text-slate-900">
                                {yearlyPrice.toLocaleString()} <span className="text-sm font-normal text-slate-500">RWF/yr</span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1">Best value</p>
                            </button>
                          </div>
                        </div>

                        {/* Payment Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <h3 className="text-lg font-playfair font-semibold text-slate-900">Payment Details</h3>
                          
                          {/* Phone Number */}
                          <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                              Mobile Money Phone Number *
                            </label>
                            <input
                              type="tel"
                              id="phone"
                              value={formData.phone}
                              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                              placeholder="+250 7XX-XXX-XXX"
                              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:bg-white focus:border-primary/20 focus:ring-0 outline-none transition-all"
                              required
                            />
                            <p className="text-xs text-slate-500 mt-1">
                              Enter your MTN/Airtel Money phone number
                            </p>
                          </div>

                          {/* Promo Code */}
                          <div>
                            <label htmlFor="promoCode" className="block text-sm font-medium text-slate-700 mb-2">
                              Promo Code (Optional)
                            </label>
                            <input
                              type="text"
                              id="promoCode"
                              value={formData.promoCode}
                              onChange={(e) => setFormData(prev => ({ ...prev, promoCode: e.target.value }))}
                              placeholder="Enter promo code"
                              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:bg-white focus:border-primary/20 focus:ring-0 outline-none transition-all"
                            />
                          </div>

                          {/* Auto-renewal Notice */}
                          <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                            <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                            <div className="text-sm text-yellow-700">
                              <p className="font-medium">Auto-renewal Notice</p>
                              <p>Your subscription will automatically renew. You can cancel anytime from your account settings.</p>
                            </div>
                          </div>

                          {/* Security Notice */}
                          <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-xl">
                            <Shield className="w-4 h-4 text-slate-500 mt-0.5" />
                            <p className="text-xs text-slate-600">
                              Your payment is secured with MTN/Airtel Money. You'll receive a confirmation prompt on your phone.
                            </p>
                          </div>

                          {/* Submit Button */}
                          <button
                            type="submit"
                            disabled={isProcessing || !formData.phone}
                            className="w-full bg-slate-900 text-white py-3 rounded-full font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            <CreditCard className="w-5 h-5" />
                            {isProcessing ? 'Processing...' : `Pay ${currentPrice.toLocaleString()} RWF`}
                          </button>
                        </form>
                      </div>

                      {/* Right: Features & Summary */}
                      <div className="lg:col-span-2 space-y-6">
                        {/* Features */}
                        <div className="bg-primary/10 rounded-xl p-6">
                          <h3 className="text-lg font-playfair font-semibold text-primary mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5" />
                            What's Included
                          </h3>
                          <ul className="space-y-3">
                            {features.map((feature, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-primary/80">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Order Summary */}
                        <div className="bg-slate-50 rounded-xl p-6">
                          <h3 className="text-lg font-playfair font-semibold text-slate-900 mb-4">Order Summary</h3>
                          
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Mentorship {billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}</span>
                              <span className="font-medium">{currentPrice.toLocaleString()} RWF</span>
                            </div>
                            {savings > 0 && (
                              <div className="flex justify-between text-sm text-green-600">
                                <span>Yearly Savings</span>
                                <span>-{savings.toLocaleString()} RWF</span>
                              </div>
                            )}
                            {formData.promoCode && (
                              <div className="flex justify-between text-sm text-green-600">
                                <span>Promo Code</span>
                                <span>Applied</span>
                              </div>
                            )}
                            <div className="border-t border-slate-200 pt-3">
                              <div className="flex justify-between text-lg font-semibold">
                                <span>Total</span>
                                <span>{currentPrice.toLocaleString()} RWF</span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1">
                                {billingCycle === 'monthly' ? 'Billed monthly' : 'Billed annually'}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-slate-200">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Calendar className="w-4 h-4" />
                              <span>Next billing: {new Date(Date.now() + (billingCycle === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentStep === 'processing' && (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <h3 className="text-xl font-playfair font-semibold text-slate-900 mb-2">Processing Payment</h3>
                      <p className="text-slate-500 mb-4">Please wait while we process your payment...</p>
                      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 max-w-md mx-auto">
                        <p className="text-sm text-primary">
                          Check your phone ({formData.phone}) for the payment confirmation prompt
                        </p>
                      </div>
                    </div>
                  )}

                  {paymentStep === 'success' && (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                      </div>
                      <h3 className="text-xl font-playfair font-semibold text-slate-900 mb-2">Payment Successful!</h3>
                      <p className="text-slate-500 mb-6">Your mentorship subscription is now active</p>
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4 max-w-md mx-auto mb-6">
                        <p className="text-sm text-green-700 mb-2">
                          Welcome to Dreamize! Your mentorship journey begins now.
                        </p>
                        <p className="text-sm text-green-600">
                          Next billing date: {new Date(Date.now() + (billingCycle === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => router.push('/dashboard/student')}
                        className="px-6 py-2 bg-slate-900 text-white rounded-full font-medium hover:bg-slate-800 transition-colors"
                      >
                        Go to Dashboard
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
