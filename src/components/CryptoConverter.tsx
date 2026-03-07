import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRightLeft, Calculator, ChevronDown } from 'lucide-react';
import { Coin } from '@/services/api';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

interface CryptoConverterProps {
  coins: Coin[];
}

export function CryptoConverter({ coins }: CryptoConverterProps) {
  const [amount, setAmount] = useState<string>('1');
  const [selectedCoinId, setSelectedCoinId] = useState<string>('bitcoin');
  const [convertedValue, setConvertedValue] = useState<string>('0');
  const [isUsdToCrypto, setIsUsdToCrypto] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    if (coins.length > 0) {
      const coin = coins.find((c) => c.id === selectedCoinId) || coins[0];
      const price = coin.current_price;
      const inputAmount = parseFloat(amount) || 0;

      if (isUsdToCrypto) {
        setConvertedValue((inputAmount / price).toFixed(6));
      } else {
        setConvertedValue((inputAmount * price).toFixed(2));
      }
    }
  }, [amount, selectedCoinId, isUsdToCrypto, coins]);

  const handleSwap = () => {
    setIsUsdToCrypto(!isUsdToCrypto);
    setAmount(convertedValue); // Swap values for better UX
  };

  return (
    <Card className="p-6 border-white/10 bg-white/5 backdrop-blur-xl">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="h-5 w-5 text-emerald-400" />
        <h3 className="text-lg font-semibold text-white">{t('crypto_converter')}</h3>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <label className="text-[10px] text-slate-400 mb-1.5 block uppercase tracking-wider font-medium truncate" title={isUsdToCrypto ? t('usd_label') : t('crypto_amount')}>
            {isUsdToCrypto ? t('usd_label') : t('crypto_amount')}
          </label>
          <div className="flex gap-2">
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="0.00"
            />
            {!isUsdToCrypto && (
              <div className="relative min-w-[100px]">
                <select
                  value={selectedCoinId}
                  onChange={(e) => setSelectedCoinId(e.target.value)}
                  className="w-full appearance-none bg-slate-800 text-white rounded-xl px-3 py-2 pr-8 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm h-11 transition-all cursor-pointer"
                >
                  {coins.map((coin) => (
                    <option key={coin.id} value={coin.id}>
                      {coin.symbol.toUpperCase()}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            )}
            {isUsdToCrypto && (
              <div className="flex items-center justify-center px-4 bg-slate-800 rounded-xl text-slate-300 font-medium text-sm border border-slate-700">
                USD
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSwap}
            className="rounded-full p-2 hover:bg-emerald-500/20 hover:text-emerald-400 transition-all"
          >
            <ArrowRightLeft className="h-4 w-4" />
          </Button>
        </div>

        <div className="relative">
          <label className="text-[10px] text-slate-400 mb-1.5 block uppercase tracking-wider font-medium truncate" title={isUsdToCrypto ? t('crypto_amount') : t('usd_label')}>
            {isUsdToCrypto ? t('crypto_amount') : t('usd_label')}
          </label>
          <div className="flex gap-2">
            <div className={cn(
              "flex-1 h-11 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white flex items-center",
              "cursor-not-allowed opacity-70 font-mono"
            )}>
              {convertedValue}
            </div>
            {isUsdToCrypto && (
              <div className="relative min-w-[100px]">
                <select
                  value={selectedCoinId}
                  onChange={(e) => setSelectedCoinId(e.target.value)}
                  className="w-full appearance-none bg-slate-800 text-white rounded-xl px-3 py-2 pr-8 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm h-11 transition-all cursor-pointer"
                >
                  {coins.map((coin) => (
                    <option key={coin.id} value={coin.id}>
                      {coin.symbol.toUpperCase()}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            )}
            {!isUsdToCrypto && (
              <div className="flex items-center justify-center px-4 bg-slate-800 rounded-xl text-slate-300 font-medium text-sm border border-slate-700">
                USD
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
