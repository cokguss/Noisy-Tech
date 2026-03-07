import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card } from '@/components/ui/card';
import { Coin } from '@/services/api';
import { PortfolioItem } from '@/components/AddPortfolioModal';
import { useLanguage } from '@/context/LanguageContext';

interface PortfolioAnalyticsProps {
  portfolio: PortfolioItem[];
  coins: Coin[];
}

const COLORS = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899'];

export function PortfolioAnalytics({ portfolio, coins }: PortfolioAnalyticsProps) {
  const { t } = useLanguage();

  const chartData = useMemo(() => {
    const data = portfolio.map(item => {
      const coin = coins.find(c => c.id === item.id);
      if (!coin) return null;
      return {
        name: coin.name,
        value: coin.current_price * item.amount,
        symbol: coin.symbol.toUpperCase()
      };
    }).filter(Boolean) as { name: string; value: number; symbol: string }[];

    // Sort by value descending
    return data.sort((a, b) => b.value - a.value);
  }, [portfolio, coins]);

  const totalValue = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [chartData]);

  if (portfolio.length === 0) return null;

  return (
    <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-xl overflow-hidden">
      <h3 className="text-sm font-display font-bold text-white mb-6 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        {t('portfolio_allocation') || 'Alokasi Portofolio'}
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0a0a0a', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}
                itemStyle={{ color: '#fff' }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4">
          {chartData.slice(0, 5).map((item, index) => {
            const percentage = ((item.value / totalValue) * 100).toFixed(1);
            return (
              <div key={item.name} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div 
                    className="h-2 w-2 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                  />
                  <div>
                    <p className="text-xs font-bold text-white">{item.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono uppercase">{item.symbol}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono font-bold text-white">${item.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  <p className="text-[10px] font-bold text-emerald-400">{percentage}%</p>
                </div>
              </div>
            );
          })}
          {chartData.length > 5 && (
            <p className="text-[10px] text-slate-500 text-center pt-2 border-t border-white/5">
              + {chartData.length - 5} {t('other_assets') || 'aset lainnya'}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
