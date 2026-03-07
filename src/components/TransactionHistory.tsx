import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Clock, Trash2, Search } from 'lucide-react';
import { Coin } from '@/services/api';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

import { db } from '@/services/db';

export interface Transaction {
  id: string;
  coinId: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  date: string;
}

interface TransactionHistoryProps {
  coins: Coin[];
}

export function TransactionHistory({ coins }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState('');
  const { t } = useLanguage();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const username = user.username || 'guest';
    
    const loadTransactions = async () => {
      const userTransactions = await db.getTransactions(username);
      setTransactions(userTransactions.sort((a: Transaction, b: Transaction) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ));
    };

    loadTransactions();

    window.addEventListener('storage', loadTransactions);
    return () => window.removeEventListener('storage', loadTransactions);
  }, []);

  const handleDelete = async (id: string) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const username = user.username || 'guest';
    
    await db.deleteTransaction(username, id);
    setTransactions(prev => prev.filter(t => t.id !== id));
    window.dispatchEvent(new Event('storage'));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: value < 1 ? 6 : 2,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const filteredTransactions = transactions.filter(tx => {
    const coin = coins.find(c => c.id === tx.coinId);
    if (!coin) return false;
    const lowerSearch = search.toLowerCase();
    return coin.name.toLowerCase().includes(lowerSearch) || coin.symbol.toLowerCase().includes(lowerSearch);
  });

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 border border-white/5 rounded-3xl bg-[#0a0a0a]/50 backdrop-blur-xl">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 mb-4">
          <Clock className="h-5 w-5 text-slate-400" />
        </div>
        <h3 className="text-lg font-display font-medium text-white mb-1">
          {t('no_transactions') || 'No Transactions Yet'}
        </h3>
        <p className="text-slate-400 text-sm">
          {t('no_transactions_hint') || 'Your transaction history will appear here once you add assets to your portfolio.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
          <Clock className="h-5 w-5 text-emerald-400" />
          {t('transaction_history') || 'Transaction History'}
        </h3>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder={t('search_transactions') || 'Search transactions...'}
            className="pl-9 bg-white/5 border-white/10 focus:border-emerald-500/50 rounded-xl font-mono text-sm h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-3">
        {filteredTransactions.map((tx) => {
          const coin = coins.find(c => c.id === tx.coinId);
          if (!coin) return null;
          
          const isBuy = tx.type === 'buy';
          const totalValue = tx.amount * tx.price;

          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={tx.id}
              className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "flex items-center justify-center h-10 w-10 rounded-full border",
                  isBuy ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                )}>
                  {isBuy ? <ArrowDownRight className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{isBuy ? 'Buy' : 'Sell'} {coin.symbol.toUpperCase()}</span>
                    <span className="text-xs text-slate-500 font-mono">{formatDate(tx.date)}</span>
                  </div>
                  <div className="text-sm text-slate-400">
                    {tx.amount} {coin.symbol.toUpperCase()} @ {formatCurrency(tx.price)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className={cn(
                    "font-mono font-bold",
                    isBuy ? "text-emerald-400" : "text-rose-400"
                  )}>
                    {isBuy ? '+' : '-'}{formatCurrency(totalValue)}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(tx.id)}
                  className="p-2 rounded-lg bg-rose-500/10 text-rose-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
                  title={t('delete_transaction') || 'Delete Transaction'}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
        {filteredTransactions.length === 0 && search && (
          <div className="text-center py-8 text-slate-500 text-sm">
            {t('no_transactions_found') || 'No transactions found matching your search.'}
          </div>
        )}
      </div>
    </div>
  );
}
