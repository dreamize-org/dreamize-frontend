'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { financialService, type Wallet, type Transaction, type Subscription } from '@/services/financial';
import { useAuth } from './AuthContext';

interface FinancialContextType {
  wallets: Wallet[];
  transactions: Transaction[];
  subscriptions: Subscription[];
  userWallet: Wallet | null;
  isLoading: boolean;
  error: string | null;
  getWalletByOwnerIdFromContext: (ownerId: string) => Wallet | undefined;
  getUserTransactions: () => Transaction[];
  getUserSubscriptions: () => Subscription[];
  getTotalBalance: () => number;
  getMonthlyRevenue: () => number;
  refreshFinancialData: () => Promise<void>;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export function FinancialProvider({ children }: { children: React.ReactNode }) {
  const { user: currentUser } = useAuth();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [userWallet, setUserWallet] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFinancialData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!currentUser) {
        setWallets([]);
        setTransactions([]);
        setSubscriptions([]);
        setUserWallet(null);
        return;
      }

      if (currentUser.role === 'student') {
        const [paymentsRes, subscriptionRes] = await Promise.all([
          financialService.getMyPayments(),
          financialService.getSubscriptionStatus(),
        ]);

        const payments = paymentsRes.data ?? [];
        const paymentTransactions: Transaction[] = payments.map((payment) => ({
          id: payment.id,
          walletId: '',
          type: 'payment',
          amount: payment.finalAmount ?? payment.amount,
          status: payment.status === 'success' ? 'completed' : payment.status,
          description: `${payment.type} payment`,
          date: payment.paidAt,
          reference: payment.transactionRef,
        }));
        setTransactions(paymentTransactions);

        const subscriptionData = subscriptionRes.data as {
          hasSubscription?: boolean;
          subscription?: {
            id: string;
            startDate: string;
            expiryDate: string;
            isActive: boolean;
          };
        };

        if (subscriptionData?.hasSubscription && subscriptionData.subscription) {
          setSubscriptions([
            {
              id: subscriptionData.subscription.id,
              studentId: currentUser._id,
              planName: 'Dreamize Premium',
              status: subscriptionData.subscription.isActive ? 'active' : 'inactive',
              amount: 100000,
              currency: 'RWF',
              billingCycle: 'monthly',
              startDate: subscriptionData.subscription.startDate,
              endDate: subscriptionData.subscription.expiryDate,
              isActive: subscriptionData.subscription.isActive,
              autoRenew: false,
            },
          ]);
        } else {
          setSubscriptions([]);
        }

        setWallets([]);
        setUserWallet(null);
      } else {
        setWallets([]);
        setTransactions([]);
        setSubscriptions([]);
        setUserWallet(null);
      }
    } catch {
      setError('Failed to load financial data');
    } finally {
      setIsLoading(false);
    }
  };

  const userId = currentUser?._id;
  const userRole = currentUser?.role;

  useEffect(() => {
    if (userId) {
      loadFinancialData();
    } else {
      setWallets([]);
      setTransactions([]);
      setSubscriptions([]);
      setUserWallet(null);
      setIsLoading(false);
    }
  }, [userId, userRole]);

  const getWalletByOwnerIdFromContext = (ownerId: string) => wallets.find((wallet) => wallet.ownerId === ownerId);

  const getUserTransactions = () => {
    if (!currentUser) return [];
    if (currentUser.role === 'trainer') return userWallet?.transactions ?? [];
    return transactions;
  };

  const getUserSubscriptions = () => subscriptions;

  const getTotalBalance = () => {
    if (!currentUser) return 0;
    if (currentUser.role === 'admin') return wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
    return userWallet?.balance ?? 0;
  };

  const getMonthlyRevenue = () => {
    const now = new Date();
    return transactions
      .filter((transaction) => {
        const date = new Date(transaction.date);
        return (
          transaction.type === 'payment' &&
          transaction.status === 'completed' &&
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      })
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  };

  return (
    <FinancialContext.Provider
      value={{
        wallets,
        transactions,
        subscriptions,
        userWallet,
        isLoading,
        error,
        getWalletByOwnerIdFromContext,
        getUserTransactions,
        getUserSubscriptions,
        getTotalBalance,
        getMonthlyRevenue,
        refreshFinancialData: loadFinancialData,
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
}

export function useFinancial() {
  const context = useContext(FinancialContext);
  if (!context) throw new Error('useFinancial must be used within a FinancialProvider');
  return context;
}
