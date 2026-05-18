'use client';

import { CreditCard, Plus, ChevronDown } from 'lucide-react';

interface PaymentMethodFormProps {
  formData: {
    nameOnCard: string;
    cardNumber: string;
    expiry: string;
    cvv: string;
    email: string;
    streetAddress: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  onInputChange: (field: string, value: string) => void;
}

export default function PaymentMethodForm({ formData, onInputChange }: PaymentMethodFormProps) {
  return (
    <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100 border-dashed border-gray-300 flex-col">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-6 h-6 text-gray-600" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Payment Method</h2>
        <p className="text-gray-600">Fill in your billing details and address</p>
      </div>

      <form className="space-y-6">
        {/* Card Details Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Card details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name on Card */}
            <div>
              <label htmlFor="nameOnCard" className="block text-sm font-medium text-gray-700 mb-2">
                Name on card
              </label>
              <input
                type="text"
                id="nameOnCard"
                value={formData.nameOnCard}
                onChange={(e) => onInputChange('nameOnCard', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                placeholder="Olivia Rhye"
              />
            </div>

            {/* Expiry */}
            <div>
              <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-2">
                Expiry
              </label>
              <input
                type="text"
                id="expiry"
                value={formData.expiry}
                onChange={(e) => onInputChange('expiry', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                placeholder="06 / 2024"
              />
            </div>

            {/* Card Number */}
            <div>
              <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Card number
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="cardNumber"
                  value={formData.cardNumber}
                  onChange={(e) => onInputChange('cardNumber', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent text-gray-900 placeholder:text-gray-400 pr-12"
                  placeholder="1234 1234 1234 1234"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-1">
                  <div className="w-6 h-4 bg-yellow-600 rounded-sm flex items-center justify-center">
                    <div className="w-3 h-2 bg-white rounded-full"></div>
                  </div>
                  <div className="w-6 h-4 bg-yellow-600 rounded-sm flex items-center justify-center">
                    <div className="w-3 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* CVV */}
            <div>
              <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-2">
                CVV
              </label>
              <input
                type="text"
                id="cvv"
                value={formData.cvv}
                onChange={(e) => onInputChange('cvv', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                placeholder="•••"
              />
            </div>
          </div>
        </div>

        {/* Email Address */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email address
          </label>
          <p className="text-sm text-gray-600 mb-2">Invoices will be sent to this email address.</p>
          <div className="relative">
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => onInputChange('email', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent text-gray-900 placeholder:text-gray-400 pr-12"
              placeholder="billing@dreamize.com"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <button
            type="button"
            className="mt-2 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <Plus className="w-4 h-4" />
            Add another
          </button>
        </div>

        {/* Address Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Address</h3>
          
          {/* Street Address */}
          <div className="mb-4">
            <label htmlFor="streetAddress" className="block text-sm font-medium text-gray-700 mb-2">
              Street address
            </label>
            <input
              type="text"
              id="streetAddress"
              value={formData.streetAddress}
              onChange={(e) => onInputChange('streetAddress', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent text-gray-900 placeholder:text-gray-400"
              placeholder="100 Smith Street"
            />
          </div>

          {/* City */}
          <div className="mb-4">
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <input
              type="text"
              id="city"
              value={formData.city}
              onChange={(e) => onInputChange('city', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent text-gray-900 placeholder:text-gray-400"
              placeholder="Collingwood"
            />
          </div>

          {/* State and Postal Code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                State / Province
              </label>
              <input
                type="text"
                id="state"
                value={formData.state}
                onChange={(e) => onInputChange('state', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                placeholder="VIC"
              />
            </div>
            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                Postal Code
              </label>
              <input
                type="text"
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => onInputChange('postalCode', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                placeholder="3066"
              />
            </div>
          </div>

          {/* Country */}
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <div className="relative">
              <select
                id="country"
                value={formData.country}
                onChange={(e) => onInputChange('country', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent text-gray-900 appearance-none bg-white"
              >
                <option value="Australia">🇦🇺 Australia</option>
                <option value="United States">🇺🇸 United States</option>
                <option value="United Kingdom">🇬🇧 United Kingdom</option>
                <option value="Canada">🇨🇦 Canada</option>
              </select>
              <ChevronDown className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition-colors"
          >
            Save Payment Method
          </button>
        </div>
      </form>
    </div>
  );
}