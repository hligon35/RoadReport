import { useContext, useCallback } from 'react';
import { DataContext } from '../context/DataContext';
import BankIntegration from '../services/BankIntegration';

export const useExpenses = () => {
  const { expenses, addExpense } = useContext(DataContext);

  const importBankTransactions = useCallback(async () => {
    const imported = await BankIntegration.fetchBankTransactions();
    imported.forEach((tx) => {
      // give unique ids if necessary
      addExpense({ ...tx, id: tx.id || `imp:${Date.now()}:${Math.random()}` });
    });
    return imported;
  }, [addExpense]);

  return { expenses, addExpense, importBankTransactions };
};

export default useExpenses;
