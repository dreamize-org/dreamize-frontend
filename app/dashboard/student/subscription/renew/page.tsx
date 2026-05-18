'use client';

import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';

import PaymentMethodForm from '@/components/subscription/PaymentMethodForm';

export default function RenewSubscriptionPage() {
  const [formData, setFormData] = useState({
    nameOnCard: 'Olivia Rhye',
    cardNumber: '1234 1234 1234 1234',
    expiry: '06 / 2024',
    cvv: '',
    email: 'billing@dreamize.com',
    streetAddress: '100 Smith Street',
    city: 'Collingwood',
    state: 'VIC',
    postalCode: '3066',
    country: 'Australia'
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="flex min-h-screen lg:h-screen bg-[#FDF9F2] w-full">
      {/* Sidebar - Fixed */}
      <Sidebar activeItem="Subscription" />

      {/* Main Content - Scrollable */}
      <div className="w-full flex flex-col overflow-hidden lg:ml-0">
        {/* Renew Content - Scrollable */}
        <main className="w-full overflow-auto">
          <div className="w-full p-8">
          
            {/* Back Button */}
            <div className="mt-4 lg:mt-6 mb-4 lg:mb-6">
              <a
                href="/post-signup/subscription"
                className="bg-slate-900 text-white px-4 py-2 rounded-full font-medium hover:bg-slate-800 shadow-md transition-colors inline-block text-sm lg:text-base"
              >
                ← Back
              </a>
            </div>

            {/* Payment Method Form */}
            <div className="max-w-full">
              <PaymentMethodForm
                formData={formData}
                onInputChange={handleInputChange}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}