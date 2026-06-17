'use client';

import { useState } from 'react';
import { useRouter } from '@/hooks/useRouter';
import { CreditCard, CheckCircle, ArrowLeft, Shield, Clock, Users } from 'lucide-react';
import { usePayment } from '@/hooks/usePayment';
import Sidebar from '@/components/dashboard/Sidebar';
import { UserRole } from '@/types';

export default function OrientationPaymentPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'form' | 'processing' | 'success'>('form');
  const [formData, setFormData] = useState({
    promoCode: ''
  });
  const { payOriantaionPayment } = usePayment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setPaymentStep('processing');

    try {
      await payOriantaionPayment(formData.promoCode);
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

  return (
    <div className="flex min-h-screen lg:h-screen bg-[#FDF9F2]">
      <Sidebar activeItem="Home" userType={UserRole.STUDENT} />

      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <main className="flex-1 overflow-auto">
          <div className="min-h-full flex items-center justify-center p-8">
            <div className="w-full max-w-2xl">
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
                  <h1 className="text-xl font-playfair font-semibold text-white">Orientation Session Payment</h1>
                  <p className="text-white/80 text-sm mt-1">Complete your payment to schedule your mentor session</p>
                </div>

                <div className="p-6">
                  {paymentStep === 'form' && (
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Left: Payment Form */}
                      <div>
                        <h2 className="text-lg font-playfair font-semibold text-slate-900 mb-4">Payment Details</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div className="flex items-start gap-2 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                            <Shield className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                            <p className="text-xs text-amber-800 leading-relaxed">
                              Payment is recorded on your Dreamize account after you confirm below. Mobile Money gateway integration is planned for a later release.
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

                          {/* Submit Button */}
                          <button
                            type="submit"
                            disabled={isProcessing}
                            className="w-full bg-slate-900 text-white py-3 rounded-full font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            <CreditCard className="w-5 h-5" />
                            {isProcessing ? 'Processing...' : 'Pay 20,000 RWF'}
                          </button>
                        </form>
                      </div>

                      {/* Right: Order Summary */}
                      <div className="bg-slate-50 rounded-xl p-6">
                        <h2 className="text-lg font-playfair font-semibold text-slate-900 mb-4">Order Summary</h2>
                        
                        <div className="space-y-4 mb-6">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                              <Users className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-medium text-slate-900">Orientation Session</h3>
                              <p className="text-sm text-slate-600">1-on-1 session with expert mentor</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                              <Clock className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <h3 className="font-medium text-slate-900">30-45 Minutes</h3>
                              <p className="text-sm text-slate-600">Personalized roadmap discussion</p>
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-slate-200 pt-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Subtotal</span>
                            <span className="font-medium">20,000 RWF</span>
                          </div>
                          {formData.promoCode && (
                            <div className="flex justify-between text-sm text-green-600">
                              <span>Promo Code</span>
                              <span>-0 RWF</span>
                            </div>
                          )}
                          <div className="flex justify-between text-lg font-semibold pt-2 border-t border-slate-200">
                            <span>Total</span>
                            <span>20,000 RWF</span>
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
                          Recording your orientation payment on Dreamize...
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
                      <p className="text-slate-500 mb-6">Your orientation session has been booked</p>
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4 max-w-md mx-auto mb-6">
                        <p className="text-sm text-green-700 mb-2">
                          You can now schedule your orientation session with a mentor
                        </p>
                        <p className="text-sm text-green-600">
                          Redirecting to dashboard...
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
