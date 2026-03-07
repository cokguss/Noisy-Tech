import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, TrendingUp, TrendingDown, DollarSign, Activity, BarChart3, Globe, Clock, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Coin, getCoins, getCoinHistory, getCoinDetails, ChartData } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Layout } from '@/components/layout';
import { AddPortfolioModal, PortfolioItem } from '@/components/AddPortfolioModal';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function CoinDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  
  const [coin, setCoin] = useState<Coin | null>(location.state?.coin || null);
  const [history, setHistory] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(!coin);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<number>(7); // Days
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load user data
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const username = user.username || 'guest';
    
    const storedFavorites = localStorage.getItem(`favorites_${username}`);
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
    const storedPortfolio = localStorage.getItem(`portfolio_${username}`);
    if (storedPortfolio) {
      setPortfolio(JSON.parse(storedPortfolio));
    }
  }, []);

  // Fetch coin data if not passed in state
  useEffect(() => {
    if (!coin && id) {
      const fetchCoin = async () => {
        setLoading(true);
        const data = await getCoinDetails(id);
        if (data) {
          setCoin(data);
        } else {
          // Handle not found
          navigate('/dashboard');
        }
        setLoading(false);
      };
      fetchCoin();
    }
  }, [id, coin, navigate]);

  // Fetch history
  useEffect(() => {
    if (id) {
      const fetchHistory = async () => {
        setHistoryLoading(true);
        const data = await getCoinHistory(id, timeRange);
        setHistory(data);
        setHistoryLoading(false);
      };
      fetchHistory();
    }
  }, [id, timeRange]);

  const toggleFavorite = () => {
    if (!coin) return;
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const username = user.username || 'guest';
    
    let newFavorites;
    if (favorites.includes(coin.id)) {
      newFavorites = favorites.filter(id => id !== coin.id);
    } else {
      newFavorites = [...favorites, coin.id];
    }
    
    setFavorites(newFavorites);
    localStorage.setItem(`favorites_${username}`, JSON.stringify(newFavorites));
  };

  const handleSavePortfolio = (coinId: string, amount: number) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const username = user.username || 'guest';
    
    let newPortfolio = [...portfolio];
    const existingIndex = newPortfolio.findIndex(p => p.id === coinId);
    const existingAmount = existingIndex >= 0 ? newPortfolio[existingIndex].amount : 0;
    
    const currentPrice = coin ? coin.current_price : 0;
    
    const transactions = JSON.parse(localStorage.getItem(`transactions_${username}`) || '[]');
    const diff = amount - existingAmount;
    
    if (diff !== 0) {
      transactions.push({
        id: Date.now().toString(),
        coinId: coinId,
        type: diff > 0 ? 'buy' : 'sell',
        amount: Math.abs(diff),
        price: currentPrice,
        date: new Date().toISOString()
      });
      localStorage.setItem(`transactions_${username}`, JSON.stringify(transactions));
      window.dispatchEvent(new Event('storage'));
    }
    
    if (amount === 0) {
      newPortfolio = portfolio.filter(p => p.id !== coinId);
    } else {
      if (existingIndex >= 0) {
        newPortfolio = portfolio.map(p => p.id === coinId ? { ...p, amount } : p);
      } else {
        newPortfolio = [...portfolio, { id: coinId, amount }];
      }
    }
    
    setPortfolio(newPortfolio);
    localStorage.setItem(`portfolio_${username}`, JSON.stringify(newPortfolio));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: value < 1 ? 6 : 2,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: "compact",
      maximumFractionDigits: 2
    }).format(value);
  };

  if (loading || !coin) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      </Layout>
    );
  }

  const isPositive = coin.price_change_percentage_24h >= 0;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/dashboard')}
              className="rounded-full hover:bg-white/10"
            >
              <ArrowLeft className="h-6 w-6 text-slate-400" />
            </Button>
            <img src={coin.image} alt={coin.name} className="h-16 w-16 rounded-full" referrerPolicy="no-referrer" />
            <div>
              <h1 className="text-3xl font-display font-bold text-white">{coin.name}</h1>
              <div className="flex items-center gap-2 text-slate-400 font-mono">
                <span className="uppercase">{coin.symbol}</span>
                <span className="bg-white/10 px-2 py-0.5 rounded text-xs">Rank #{coin.market_cap_rank}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              onClick={toggleFavorite}
              variant="outline"
              className="border-white/10 hover:bg-white/5 text-slate-400"
            >
              <Star className={cn("h-5 w-5 mr-2", favorites.includes(coin.id) ? "fill-yellow-400 text-yellow-400" : "")} />
              {favorites.includes(coin.id) ? t('favorited') || 'Favorited' : t('favorite') || 'Favorite'}
            </Button>
            <Button
              onClick={() => setIsPortfolioModalOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
            >
              {t('add_to_portfolio') || 'Add to Portfolio'}
            </Button>
          </div>
        </div>

        {/* Price & Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart Card */}
          <Card className="lg:col-span-2 p-6 bg-[#0a0a0a]/50 backdrop-blur-xl border-white/5">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
              <div>
                <div className="text-slate-400 text-sm mb-1">Current Price</div>
                <div className="text-4xl font-mono font-bold text-white tracking-tight">
                  {formatCurrency(coin.current_price)}
                </div>
                <div className={cn(
                  "flex items-center mt-2 text-sm font-medium",
                  isPositive ? "text-emerald-400" : "text-rose-400"
                )}>
                  {isPositive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                  {Math.abs(coin.price_change_percentage_24h).toFixed(2)}% (24h)
                </div>
              </div>
              
              <div className="flex bg-white/5 rounded-lg p-1">
                {[1, 7, 30, 365].map((days) => (
                  <button
                    key={days}
                    onClick={() => setTimeRange(days)}
                    className={cn(
                      "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                      timeRange === days 
                        ? "bg-white/10 text-white shadow-sm" 
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    {days === 1 ? '24H' : days === 7 ? '7D' : days === 30 ? '1M' : '1Y'}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[400px] w-full">
              {historyLoading ? (
                <div className="h-full w-full flex items-center justify-center">
                  <Skeleton className="h-[350px] w-full bg-white/5 rounded-xl" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isPositive ? "#10b981" : "#f43f5e"} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={isPositive ? "#10b981" : "#f43f5e"} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(tick) => {
                        const date = new Date(tick);
                        return timeRange === 1 
                          ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                      }}
                      stroke="#525252"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      minTickGap={50}
                    />
                    <YAxis 
                      domain={['auto', 'auto']}
                      tickFormatter={(tick) => `$${tick.toLocaleString()}`}
                      stroke="#525252"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      width={60}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0a0a0a',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
                      }}
                      labelFormatter={(label) => new Date(label).toLocaleString()}
                      formatter={(value: number) => [formatCurrency(value), 'Price']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="price" 
                      stroke={isPositive ? "#10b981" : "#f43f5e"} 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorPrice)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          {/* Stats Grid */}
          <div className="space-y-6">
            <Card className="p-6 bg-[#0a0a0a]/50 backdrop-blur-xl border-white/5">
              <h3 className="text-lg font-display font-bold text-white mb-6 flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald-400" />
                Market Stats
              </h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <div className="text-slate-400 text-sm flex items-center gap-2">
                    <DollarSign className="h-4 w-4" /> Market Cap
                  </div>
                  <div className="text-white font-mono font-medium">{formatCurrency(coin.market_cap)}</div>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <div className="text-slate-400 text-sm flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" /> Volume (24h)
                  </div>
                  <div className="text-white font-mono font-medium">{formatCurrency(coin.total_volume)}</div>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <div className="text-slate-400 text-sm flex items-center gap-2">
                    <Globe className="h-4 w-4" /> Circulating Supply
                  </div>
                  <div className="text-white font-mono font-medium">
                    {formatNumber(coin.circulating_supply)} <span className="text-slate-500 text-xs">{coin.symbol.toUpperCase()}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <div className="text-slate-400 text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4" /> All Time High
                  </div>
                  <div className="text-right">
                    <div className="text-white font-mono font-medium">{formatCurrency(coin.ath)}</div>
                    <div className="text-xs text-rose-400">{coin.ath_change_percentage.toFixed(2)}%</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-slate-400 text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> ATH Date
                  </div>
                  <div className="text-white font-mono font-medium text-sm">
                    {new Date(coin.ath_date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-emerald-900/20 to-black border-white/5">
              <h3 className="text-lg font-display font-bold text-white mb-4">About {coin.name}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {coin.name} is a cryptocurrency with a current market cap of {formatNumber(coin.market_cap)}. 
                It has a circulating supply of {formatNumber(coin.circulating_supply)} {coin.symbol.toUpperCase()}.
                The current price is {formatCurrency(coin.current_price)}, which is {isPositive ? 'up' : 'down'} {Math.abs(coin.price_change_percentage_24h).toFixed(2)}% over the last 24 hours.
              </p>
            </Card>
          </div>
        </div>
      </div>

      <AddPortfolioModal
        isOpen={isPortfolioModalOpen}
        onClose={() => setIsPortfolioModalOpen(false)}
        coins={[coin]}
        portfolio={portfolio}
        onSave={handleSavePortfolio}
        initialCoinId={coin.id}
      />
    </Layout>
  );
}
