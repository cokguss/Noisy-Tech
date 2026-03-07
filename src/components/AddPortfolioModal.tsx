import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Check } from 'lucide-react';
import { Coin } from '@/services/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

export interface PortfolioItem {
  id: string;
  amount: number;
}

interface AddPortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  coins: Coin[];
  portfolio: PortfolioItem[];
  onSave: (id: string, amount: number) => void;
  initialCoinId?: string;
}

export function AddPortfolioModal({ isOpen, onClose, coins, portfolio, onSave, initialCoinId }: AddPortfolioModalProps) {
  const [search, setSearch] = useState('');
  const [selectedCoinId, setSelectedCoinId] = useState<string | null>(initialCoinId || null);
  const [amount, setAmount] = useState<string>('');
  const { t } = useLanguage();

  // Update selectedCoinId when initialCoinId changes or modal opens
  useEffect(() => {
    if (isOpen && initialCoinId) {
      setSelectedCoinId(initialCoinId);
      const existing = portfolio.find(p => p.id === initialCoinId);
      setAmount(existing ? existing.amount.toString() : '');
    } else if (!isOpen) {
      // Reset when closed
      setTimeout(() => {
        setSelectedCoinId(null);
        setSearch('');
        setAmount('');
      }, 300);
    }
  }, [isOpen, initialCoinId, portfolio]);

  const filteredCoins = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    return coins.filter(
      (coin) =>
        coin.name.toLowerCase().includes(lowerSearch) ||
        coin.symbol.toLowerCase().includes(lowerSearch)
    ).slice(0, 20); // Limit to 20 for performance in dropdown
  }, [search, coins]);

  const selectedCoin = coins.find(c => c.id === selectedCoinId);
  const existingItem = portfolio.find(p => p.id === selectedCoinId);

  // Reset state when modal opens/closes or coin changes
  const handleSelectCoin = (id: string) => {
    setSelectedCoinId(id);
    const existing = portfolio.find(p => p.id === id);
    setAmount(existing ? existing.amount.toString() : '');
  };

  const handleSave = () => {
    if (selectedCoinId && amount !== '') {
      const numAmount = parseFloat(amount);
      if (!isNaN(numAmount) && numAmount >= 0) {
        onSave(selectedCoinId, numAmount);
        onClose();
        // Reset
        setTimeout(() => {
          setSelectedCoinId(null);
          setSearch('');
          setAmount('');
        }, 300);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-[#050505]/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-md pointer-events-auto bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 rounded-[32px] p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-[32px] blur-xl opacity-50 pointer-events-none" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-display font-bold text-white">
                    {selectedCoinId ? t('enter_amount') : t('select_asset')}
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {!selectedCoinId ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <Input
                        placeholder={t('search_placeholder')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-white/5 border-white/10 focus:border-emerald-500/50 rounded-xl"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-1 pr-2">
                      {filteredCoins.map(coin => {
                        const isSelected = portfolio.some(p => p.id === coin.id);
                        return (
                          <button
                            key={coin.id}
                            onClick={() => handleSelectCoin(coin.id)}
                            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                              <div className="text-left">
                                <div className="font-medium text-white text-sm">{coin.name}</div>
                                <div className="text-xs text-slate-500 uppercase font-mono">{coin.symbol}</div>
                              </div>
                            </div>
                            {isSelected && (
                              <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md">
                                <Check className="w-3 h-3" /> {t('in_portfolio')}
                              </div>
                            )}
                          </button>
                        );
                      })}
                      {filteredCoins.length === 0 && (
                        <div className="text-center py-8 text-slate-500 text-sm">
                          {t('no_coins_found')}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                      <img src={selectedCoin?.image} alt={selectedCoin?.name} className="w-12 h-12 rounded-full" referrerPolicy="no-referrer" />
                      <div>
                        <div className="font-bold text-white text-lg">{selectedCoin?.name}</div>
                        <div className="text-sm text-slate-500 uppercase font-mono">{selectedCoin?.symbol}</div>
                      </div>
                      <button 
                        onClick={() => setSelectedCoinId(null)}
                        className="ml-auto text-xs text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
                      >
                        {t('change')}
                      </button>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-400">{t('amount_you_own')}</label>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="bg-white/5 border-white/10 focus:border-emerald-500/50 rounded-xl text-lg font-mono py-6 pr-16 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          autoFocus
                          min="0"
                          step="any"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-mono uppercase">
                          {selectedCoin?.symbol}
                        </div>
                      </div>
                      {existingItem && (
                        <p className="text-xs text-slate-500">
                          {t('currently_holding')}: <span className="text-white font-mono">{existingItem.amount} {selectedCoin?.symbol.toUpperCase()}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button 
                        variant="ghost" 
                        className="flex-1 rounded-xl hover:bg-white/5"
                        onClick={() => setSelectedCoinId(null)}
                      >
                        {t('back')}
                      </Button>
                      <Button 
                        className="flex-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white"
                        onClick={handleSave}
                        disabled={!amount || isNaN(parseFloat(amount)) || parseFloat(amount) < 0}
                      >
                        {parseFloat(amount) === 0 ? t('remove_asset') : t('save_asset')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
