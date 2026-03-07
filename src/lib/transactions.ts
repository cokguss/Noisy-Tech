import { Transaction } from '@/types';

export const logTransaction = (
  username: string,
  coinId: string,
  type: 'buy' | 'sell',
  amount: number,
  price: number
) => {
  const transactions: Transaction[] = JSON.parse(
    localStorage.getItem(`transactions_${username}`) || '[]'
  );

  const newTransaction: Transaction = {
    id: crypto.randomUUID(),
    coinId,
    type,
    amount,
    price,
    date: new Date().toISOString(),
  };

  transactions.push(newTransaction);
  localStorage.setItem(`transactions_${username}`, JSON.stringify(transactions));
};

export const getTransactions = (username: string): Transaction[] => {
  return JSON.parse(localStorage.getItem(`transactions_${username}`) || '[]');
};
