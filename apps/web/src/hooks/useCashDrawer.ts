'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../app/authContext';

export interface CashMovement {
  id: string;
  type: 'CASH_IN' | 'CASH_OUT' | 'NO_SALE' | 'CASH_SALE' | 'REFUND';
  amount: number;
  reason: string;
  note?: string;
  userId: string;
  userName: string;
  timestamp: string;
}

export function useCashDrawer() {
  const { user } = useAuth();
  const [openingBalance, setOpeningBalance] = useState<number>(200);
  const [movements, setMovements] = useState<CashMovement[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Load from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedOpening = localStorage.getItem('dinepos_cash_drawer_opening');
      if (savedOpening) {
        setOpeningBalance(Number(savedOpening));
      }
      const savedMovements = localStorage.getItem('dinepos_cash_drawer_movements');
      if (savedMovements) {
        try {
          setMovements(JSON.parse(savedMovements));
        } catch (e) {
          console.error('Failed to parse cash movements:', e);
        }
      }
    }
  }, []);

  const saveMovements = (updated: CashMovement[]) => {
    setMovements(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dinepos_cash_drawer_movements', JSON.stringify(updated));
    }
  };

  const addCashIn = useCallback((amount: number, reason: string, note?: string) => {
    if (!user) return;
    const newMovement: CashMovement = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'CASH_IN',
      amount,
      reason,
      note,
      userId: user.id,
      userName: user.name,
      timestamp: new Date().toISOString(),
    };
    saveMovements([newMovement, ...movements]);
  }, [user, movements]);

  const addCashOut = useCallback((amount: number, reason: string, note?: string) => {
    if (!user) return;
    const newMovement: CashMovement = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'CASH_OUT',
      amount,
      reason,
      note,
      userId: user.id,
      userName: user.name,
      timestamp: new Date().toISOString(),
    };
    saveMovements([newMovement, ...movements]);
  }, [user, movements]);

  const recordNoSale = useCallback((reason: string, note?: string) => {
    if (!user) return;
    const newMovement: CashMovement = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'NO_SALE',
      amount: 0,
      reason,
      note,
      userId: user.id,
      userName: user.name,
      timestamp: new Date().toISOString(),
    };
    saveMovements([newMovement, ...movements]);
    setIsOpen(true);
    // Simulate drawer closing automatically
    setTimeout(() => setIsOpen(false), 3000);
  }, [user, movements]);

  const recordCashSale = useCallback((amount: number, orderId: string) => {
    if (!user) return;
    const newMovement: CashMovement = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'CASH_SALE',
      amount,
      reason: `Sale ${orderId}`,
      userId: user.id,
      userName: user.name,
      timestamp: new Date().toISOString(),
    };
    saveMovements([newMovement, ...movements]);
  }, [user, movements]);

  const recordRefund = useCallback((amount: number, orderId: string) => {
    if (!user) return;
    const newMovement: CashMovement = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'REFUND',
      amount,
      reason: `Refund ${orderId}`,
      userId: user.id,
      userName: user.name,
      timestamp: new Date().toISOString(),
    };
    saveMovements([newMovement, ...movements]);
  }, [user, movements]);

  const resetDrawer = useCallback((newOpening: number) => {
    setOpeningBalance(newOpening);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dinepos_cash_drawer_opening', newOpening.toString());
    }
    saveMovements([]);
  }, []);

  // Compute stats
  const cashSalesTotal = movements
    .filter(m => m.type === 'CASH_SALE')
    .reduce((sum, m) => sum + m.amount, 0);

  const cashInTotal = movements
    .filter(m => m.type === 'CASH_IN')
    .reduce((sum, m) => sum + m.amount, 0);

  const cashOutTotal = movements
    .filter(m => m.type === 'CASH_OUT')
    .reduce((sum, m) => sum + m.amount, 0);

  const refundsTotal = movements
    .filter(m => m.type === 'REFUND')
    .reduce((sum, m) => sum + m.amount, 0);

  const expectedBalance = openingBalance + cashSalesTotal + cashInTotal - cashOutTotal - refundsTotal;

  // Permissions Check
  const allowedRoles = ['SUPER_ADMIN', 'OWNER', 'MANAGER', 'CASHIER'];
  const hasAccess = user ? allowedRoles.includes(user.role) : false;

  return {
    openingBalance,
    movements,
    isOpen,
    setIsOpen,
    addCashIn,
    addCashOut,
    recordNoSale,
    recordCashSale,
    recordRefund,
    resetDrawer,
    expectedBalance,
    cashSalesTotal,
    cashInTotal,
    cashOutTotal,
    refundsTotal,
    hasAccess,
  };
}
