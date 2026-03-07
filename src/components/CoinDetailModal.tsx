import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, TrendingDown, DollarSign, Activity, BarChart3, Clock, Loader2 } from 'lucide-react';
import { Coin, getCoinHistory, ChartData } from '@/services/api';
import { cn } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useLanguage } from '@/context/LanguageContext';

interface CoinDetailModalProps {
  coin: Coin | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CoinDetailModal({ coin, isOpen, onClose }: CoinDetailModalProps) {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoadingChart, setIsLoadingChart] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (isOpen && coin) {
      const fetchHistory = async () => {
        setIsLoadingChart(true);
        const data = await getCoinHistory(coin.id, 7);
        setChartData(data);
        setIsLoadingChart(false);
      };
      fetchHistory();
    } else {
      setChartData([]);
    }
  }, [isOpen, coin]);

  if (!coin) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: value < 1 ? 6 : 2,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 2,
    }).format(value);
  };

  const isPositive = coin.price_change_percentage_24h >= 0;
  const chartColor = isPositive ? '#34d399' : '#fb7185'; // emerald-400 or rose-400

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
            <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto pointer-events-auto bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 rounded-[32px] p-6 sm:p-8 shadow-2xl relative custom-scrollbar">
              {/* Ambient Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-[32px] blur-xl opacity-50 pointer-events-none" />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-4 sm:gap-5">
                    <div className="relative">
                      <div className="absolute inset-0 bg-white/20 rounded-full blur-md" />
                      <img src={coin.image} alt={coin.name} className="h-12 w-12 sm:h-16 sm:w-16 rounded-full relative z-10" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-display font-bold text-white flex items-center gap-3 mb-1">
                        {coin.name}
                        <span className="text-xs font-mono font-medium text-slate-400 bg-white/5 border border-white/10 px-2 py-1 rounded-md uppercase tracking-wider hidden sm:inline-block">
                          {coin.symbol}
                        </span>
                      </h2>
                      <div className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">
                        {formatCurrency(coin.current_price)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-white shrink-0"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Chart Section */}
                <div className="mb-8 bg-white/5 rounded-2xl border border-white/5 p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">{t('price_history_7d')}</h3>
                    {isLoadingChart && <Loader2 className="h-4 w-4 text-slate-500 animate-spin" />}
                  </div>
                  <div className="h-[200px] w-full">
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={chartColor} stopOpacity={0.3}/>
                              <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#111', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                            itemStyle={{ color: '#fff', fontFamily: 'JetBrains Mono' }}
                            labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                            formatter={(value: number) => [formatCurrency(value), t('price')]}
                            labelFormatter={(label) => new Date(label).toLocaleString()}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="price" 
                            stroke={chartColor} 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#colorPrice)" 
                          />
                          <YAxis 
                            domain={['auto', 'auto']} 
                            hide 
                          />
                          <XAxis 
                            dataKey="timestamp" 
                            hide 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">
                        {isLoadingChart ? t('loading_chart') : t('chart_unavailable')}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div className="bg-white/5 rounded-2xl p-5 border border-white/5 hover:bg-white/[0.07] transition-colors overflow-hidden">
                    <div className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-2 uppercase tracking-wider">
                      <Activity className="h-4 w-4 text-slate-500 shrink-0" /> {t('change_24h')}
                    </div>
                    <div className={cn(
                      "text-xl sm:text-2xl font-mono font-bold flex items-center gap-2 truncate",
                      isPositive ? "text-emerald-400" : "text-rose-400"
                    )}>
                      {isPositive ? <TrendingUp className="h-5 w-5 shrink-0" /> : <TrendingDown className="h-5 w-5 shrink-0" />}
                      <span className="truncate">{Math.abs(coin.price_change_percentage_24h).toFixed(2)}%</span>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-5 border border-white/5 hover:bg-white/[0.07] transition-colors overflow-hidden">
                    <div className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-2 uppercase tracking-wider">
                      <BarChart3 className="h-4 w-4 text-slate-500 shrink-0" /> Market Cap
                    </div>
                    <div className="text-xl sm:text-2xl font-mono font-bold text-white truncate" title={formatCurrency(coin.market_cap)}>
                      {formatCurrency(coin.market_cap)}
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-5 border border-white/5 hover:bg-white/[0.07] transition-colors overflow-hidden">
                    <div className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-2 uppercase tracking-wider">
                      <DollarSign className="h-4 w-4 text-slate-500 shrink-0" /> {t('total_volume')}
                    </div>
                    <div className="text-xl sm:text-2xl font-mono font-bold text-white truncate" title={formatCurrency(coin.total_volume)}>
                      {formatCurrency(coin.total_volume)}
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-5 border border-white/5 hover:bg-white/[0.07] transition-colors overflow-hidden">
                    <div className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-2 uppercase tracking-wider">
                      <Clock className="h-4 w-4 text-slate-500 shrink-0" /> {t('all_time_high')}
                    </div>
                    <div className="text-xl sm:text-2xl font-mono font-bold text-white flex items-baseline gap-2 truncate" title={`${formatCurrency(coin.ath)} (${coin.ath_change_percentage.toFixed(2)}%)`}>
                      <span className="truncate">{formatCurrency(coin.ath)}</span>
                      <span className="text-sm font-mono font-medium text-rose-400 shrink-0">
                        ({coin.ath_change_percentage.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-display font-semibold text-white mb-4">{t('supply_info')}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex flex-col justify-center p-4 bg-white/5 rounded-2xl border border-white/5 overflow-hidden">
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1 truncate block w-full" title={t('circulating_supply')}>{t('circulating_supply')}</span>
                      <span className="font-mono font-medium text-white text-base sm:text-lg truncate block w-full" title={`${formatNumber(coin.circulating_supply)} ${coin.symbol.toUpperCase()}`}>{formatNumber(coin.circulating_supply)} <span className="text-sm text-slate-500">{coin.symbol.toUpperCase()}</span></span>
                    </div>
                    <div className="flex flex-col justify-center p-4 bg-white/5 rounded-2xl border border-white/5 overflow-hidden">
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1 truncate block w-full" title={t('total_supply')}>{t('total_supply')}</span>
                      <span className="font-mono font-medium text-white text-base sm:text-lg truncate block w-full" title={coin.total_supply ? formatNumber(coin.total_supply) : '∞'}>{coin.total_supply ? formatNumber(coin.total_supply) : '∞'}</span>
                    </div>
                    <div className="flex flex-col justify-center p-4 bg-white/5 rounded-2xl border border-white/5 overflow-hidden">
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1 truncate block w-full" title={t('low_24h')}>{t('low_24h')}</span>
                      <span className="font-mono font-medium text-white text-base sm:text-lg truncate block w-full" title={formatCurrency(coin.low_24h)}>{formatCurrency(coin.low_24h)}</span>
                    </div>
                    <div className="flex flex-col justify-center p-4 bg-white/5 rounded-2xl border border-white/5 overflow-hidden">
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1 truncate block w-full" title={t('high_24h')}>{t('high_24h')}</span>
                      <span className="font-mono font-medium text-white text-base sm:text-lg truncate block w-full" title={formatCurrency(coin.high_24h)}>{formatCurrency(coin.high_24h)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
