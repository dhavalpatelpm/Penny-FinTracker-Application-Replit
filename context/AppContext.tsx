import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

export interface Transaction {
  id: string;
  type: 'expense' | 'income' | 'savings';
  amount: number;
  categoryId: string;
  note: string;
  date: string;
  createdAt: string;
}

export interface UserProfile {
  name: string;
  profession: string;
  currency: { code: string; symbol: string; name: string };
  monthlyBudget: number;
  categoryBudgets: Record<string, number>;
  photoUri?: string;
}

export interface AppContextValue {
  profile: UserProfile;
  transactions: Transaction[];
  onboardingComplete: boolean;
  isLoading: boolean;
  themeOverride: 'light' | 'dark' | 'system';
  setThemeOverride: (t: 'light' | 'dark' | 'system') => void;
  completeOnboarding: (profile: UserProfile) => Promise<void>;
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  getTransactionsByPeriod: (year: number, month: number) => Transaction[];
  getTotalByType: (type: Transaction['type'], year: number, month: number) => number;
}

const defaultProfile: UserProfile = {
  name: '',
  profession: '',
  currency: { code: 'USD', symbol: '$', name: 'US Dollar' },
  monthlyBudget: 0,
  categoryBudgets: {},
};

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEYS = {
  TRANSACTIONS: '@penny_transactions',
  PROFILE: '@penny_profile',
  ONBOARDING: '@penny_onboarding',
  THEME: '@penny_theme',
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [themeOverride, setThemeOverrideState] = useState<'light' | 'dark' | 'system'>('system');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [txRaw, profileRaw, onboardingRaw, themeRaw] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS),
        AsyncStorage.getItem(STORAGE_KEYS.PROFILE),
        AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING),
        AsyncStorage.getItem(STORAGE_KEYS.THEME),
      ]);
      if (txRaw) setTransactions(JSON.parse(txRaw));
      if (profileRaw) setProfile(JSON.parse(profileRaw));
      if (onboardingRaw === 'true') setOnboardingComplete(true);
      if (themeRaw) setThemeOverrideState(themeRaw as 'light' | 'dark' | 'system');
    } catch (e) {
      console.error('Failed to load data', e);
    } finally {
      setIsLoading(false);
    }
  }

  const setThemeOverride = useCallback(async (t: 'light' | 'dark' | 'system') => {
    setThemeOverrideState(t);
    await AsyncStorage.setItem(STORAGE_KEYS.THEME, t);
  }, []);

  const completeOnboarding = useCallback(async (newProfile: UserProfile) => {
    setProfile(newProfile);
    setOnboardingComplete(true);
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(newProfile)),
      AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING, 'true'),
    ]);
  }, []);

  const addTransaction = useCallback(async (tx: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...tx,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
    };
    setTransactions(prev => {
      const updated = [newTx, ...prev];
      AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    setTransactions(prev => {
      const updated = prev.filter(t => t.id !== id);
      AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateTransaction = useCallback(async (id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, ...updates } : t);
      AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    setProfile(prev => {
      const updated = { ...prev, ...updates };
      AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const getTransactionsByPeriod = useCallback((year: number, month: number) => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  }, [transactions]);

  const getTotalByType = useCallback((type: Transaction['type'], year: number, month: number) => {
    return getTransactionsByPeriod(year, month)
      .filter(t => t.type === type)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [getTransactionsByPeriod]);

  const value = useMemo<AppContextValue>(() => ({
    profile,
    transactions,
    onboardingComplete,
    isLoading,
    themeOverride,
    setThemeOverride,
    completeOnboarding,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    updateProfile,
    getTransactionsByPeriod,
    getTotalByType,
  }), [
    profile, transactions, onboardingComplete, isLoading, themeOverride,
    setThemeOverride, completeOnboarding, addTransaction, deleteTransaction,
    updateTransaction, updateProfile, getTransactionsByPeriod, getTotalByType,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function useTheme() {
  const { themeOverride } = useApp();
  const systemScheme = useColorScheme();
  const scheme = themeOverride === 'system' ? (systemScheme ?? 'light') : themeOverride;
  const Colors = require('../constants/colors').default;
  return scheme === 'dark' ? Colors.theme.dark : Colors.theme.light;
}
