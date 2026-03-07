import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, TrendingUp, TrendingDown, LogOut, LayoutDashboard, Settings, User, X, Menu, Bell, ChevronRight, Activity, Wallet, ArrowRightLeft, Shield, Clock } from 'lucide-react';
import { Coin, getCoins } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Layout } from '@/components/layout';
import { AddPortfolioModal, PortfolioItem } from '@/components/AddPortfolioModal';
import { CryptoConverter } from '@/components/CryptoConverter';
import { NewsFeed } from '@/components/NewsFeed';
import { WelcomeToast } from '@/components/WelcomeToast';
import { AdminPanel } from '@/components/AdminPanel';
import { TransactionHistory, Transaction } from '@/components/TransactionHistory';
import { useLanguage } from '@/context/LanguageContext';
import { logActivity } from '@/lib/activity';
import { cn } from '@/lib/utils';
import { Sparklines, SparklinesLine, SparklinesSpots } from 'react-sparklines';

// Helper component for sparklines
const SparklineChart = ({ data, isPositive }: { data: number[], isPositive: boolean }) => {
  if (!data || data.length === 0) return null;
  
  // Sample data to reduce points for smoother rendering
  const sampledData = data.filter((_, i) => i % Math.ceil(data.length / 20) === 0);
  const color = isPositive ? "#10b981" : "#f43f5e";
  
  return (
    <div className="w-full h-12">
      <Sparklines data={sampledData} margin={2}>
        <SparklinesLine style={{ strokeWidth: 2, stroke: color, fill: "none" }} />
        <SparklinesSpots size={2} style={{ stroke: color, strokeWidth: 2, fill: "white" }} />
      </Sparklines>
    </div>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'favorites' | 'portfolio'>('all');
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [user, setUser] = useState<{ username: string; name: string; role?: string } | null>(null);
  const [showConverter, setShowConverter] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'admin'>('dashboard');
  const [showBroadcast, setShowBroadcast] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    
    const storedFavorites = localStorage.getItem(`favorites_${parsedUser.username}`);
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }

    const storedPortfolio = localStorage.getItem(`portfolio_${parsedUser.username}`);
    if (storedPortfolio) {
      setPortfolio(JSON.parse(storedPortfolio));
    }

    const storedTransactions = localStorage.getItem(`transactions_${parsedUser.username}`);
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions));
    }

    const fetchCoins = async () => {
      setLoading(true);
      const data = await getCoins();
      setCoins(data);
      setLoading(false);
    };

    fetchCoins();

    // Listen for storage changes (for transactions)
    const handleStorageChange = () => {
      const updatedTransactions = localStorage.getItem(`transactions_${parsedUser.username}`);
      if (updatedTransactions) {
        setTransactions(JSON.parse(updatedTransactions));
      }
      
      const updatedPortfolio = localStorage.getItem(`portfolio_${parsedUser.username}`);
      if (updatedPortfolio) {
        setPortfolio(JSON.parse(updatedPortfolio));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [navigate]);

  const handleLogout = () => {
    if (user) {
      logActivity(user.username, user.name, 'activity_logout');
    }
    localStorage.removeItem('user');
    navigate('/login');
  };

  const toggleFavorite = (e: React.MouseEvent, coinId: string) => {
    e.stopPropagation();
    let newFavorites;
    if (favorites.includes(coinId)) {
      newFavorites = favorites.filter(id => id !== coinId);
    } else {
      newFavorites = [...favorites, coinId];
    }
    setFavorites(newFavorites);
    if (user) {
      localStorage.setItem(`favorites_${user.username}`, JSON.stringify(newFavorites));
    }
  };

  const handleSavePortfolio = (coinId: string, amount: number) => {
    let newPortfolio = [...portfolio];
    const existingIndex = newPortfolio.findIndex(p => p.id === coinId);
    const existingAmount = existingIndex >= 0 ? newPortfolio[existingIndex].amount : 0;
    
    const coin = coins.find(c => c.id === coinId);
    const currentPrice = coin ? coin.current_price : 0;
    
    // Record transaction
    const diff = amount - existingAmount;
    if (diff !== 0 && user) {
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        coinId: coinId,
        type: diff > 0 ? 'buy' : 'sell',
        amount: Math.abs(diff),
        price: currentPrice,
        date: new Date().toISOString()
      };
      
      const updatedTransactions = [newTransaction, ...transactions];
      setTransactions(updatedTransactions);
      localStorage.setItem(`transactions_${user.username}`, JSON.stringify(updatedTransactions));
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
    if (user) {
      localStorage.setItem(`portfolio_${user.username}`, JSON.stringify(newPortfolio));
    }
  };

  const handleCoinClick = (coin: Coin) => {
    navigate(`/coin/${coin.id}`, { state: { coin } });
  };

  const filteredAndSortedCoins = useMemo(() => {
    let result = coins;

    if (search) {
      result = result.filter(coin => 
        coin.name.toLowerCase().includes(search.toLowerCase()) || 
        coin.symbol.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (activeFilter === 'favorites') {
      result = result.filter(coin => favorites.includes(coin.id));
    } else if (activeFilter === 'portfolio') {
      result = result.filter(coin => portfolio.some(p => p.id === coin.id));
    }

    return result;
  }, [coins, search, activeFilter, favorites, portfolio]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: value < 1 ? 6 : 2,
    }).format(value);
  };

  const portfolioTotal = useMemo(() => {
    return portfolio.reduce((total, item) => {
      const coin = coins.find(c => c.id === item.id);
      if (coin) {
        return total + (coin.current_price * item.amount);
      }
      return total;
    }, 0);
  }, [portfolio, coins]);

  const portfolioChange24h = useMemo(() => {
    if (portfolioTotal === 0) return 0;
    
    let previousTotal = 0;
    portfolio.forEach(item => {
      const coin = coins.find(c => c.id === item.id);
      if (coin) {
        // Calculate price 24h ago
        const previousPrice = coin.current_price / (1 + (coin.price_change_percentage_24h / 100));
        previousTotal += previousPrice * item.amount;
      }
    });
    
    return ((portfolioTotal - previousTotal) / previousTotal) * 100;
  }, [portfolio, coins, portfolioTotal]);

  if (!user) return null;

  const isAdmin = user.role === 'admin';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex flex-col"
    >
      <Layout className="flex flex-col flex-1">
        <WelcomeToast userName={user.name || 'User'} isAdmin={isAdmin} />
      
      {/* Broadcast Banner */}
      <AnimatePresence>
        {showBroadcast && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-emerald-500/20 border-b border-emerald-500/20 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500/20 p-1.5 rounded-full">
                  <Bell className="h-4 w-4 text-emerald-400" />
                </div>
                <p className="text-sm font-medium text-emerald-100">
                  {language === 'id' 
                    ? 'Selamat datang di Noisy Tech! Nikmati pengalaman pelacakan kripto terbaik.' 
                    : 'Welcome to Noisy Tech! Enjoy the best crypto tracking experience.'}
                </p>
              </div>
              <button 
                onClick={() => setShowBroadcast(false)}
                className="text-emerald-400/60 hover:text-emerald-400 transition-colors p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-display font-bold text-white tracking-tight hidden sm:block">
                Noisy Tech
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                  activeTab === 'dashboard' 
                    ? "bg-white/10 text-white shadow-sm" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <LayoutDashboard className="h-4 w-4" />
                {t('dashboard')}
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                  activeTab === 'transactions' 
                    ? "bg-white/10 text-white shadow-sm" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <ArrowRightLeft className="h-4 w-4" />
                {language === 'id' ? 'Transaksi' : 'Transactions'}
              </button>
              {isAdmin && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                    activeTab === 'admin' 
                      ? "bg-emerald-500/20 text-emerald-400 shadow-sm" 
                      : "text-slate-400 hover:text-emerald-400 hover:bg-white/5"
                  )}
                >
                  <Shield className="h-4 w-4" />
                  Admin
                </button>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="hidden sm:flex items-center gap-1 bg-white/5 border border-white/10 rounded-full p-1 mr-2">
              <button
                onClick={() => setLanguage('id')}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider transition-all ${
                  language === 'id' ? 'bg-white text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                ID
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider transition-all ${
                  language === 'en' ? 'bg-white text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConverter(!showConverter)}
              className={cn(
                "hidden sm:flex border-white/10 transition-colors",
                showConverter ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "hover:bg-white/5 text-slate-300"
              )}
            >
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              {t('converter')}
            </Button>
            
            <div className="h-8 w-px bg-white/10 mx-1 hidden sm:block"></div>
            
            <div className="hidden sm:flex items-center gap-3 pl-2">
              <div className="text-right">
                <div className="text-sm font-medium text-white">{user.name}</div>
                <div className="text-[10px] text-emerald-400 uppercase tracking-wider font-mono">{user.role || 'User'}</div>
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center">
                <User className="h-5 w-5 text-slate-400" />
              </div>
            </div>

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout}
              className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 ml-1"
              title={t('logout') || 'Logout'}
            >
              <LogOut className="h-5 w-5" />
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-slate-400"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-white/5 bg-[#0a0a0a]/95 backdrop-blur-xl overflow-hidden"
            >
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{user.name}</div>
                    <div className="text-[10px] text-emerald-400 uppercase tracking-wider font-mono">{user.role || 'User'}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { setActiveTab('dashboard'); setShowMobileMenu(false); }}
                    className={cn(
                      "p-3 rounded-xl text-sm font-medium flex flex-col items-center justify-center gap-2 transition-colors",
                      activeTab === 'dashboard' ? "bg-white/10 text-white" : "bg-white/5 text-slate-400"
                    )}
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    {t('dashboard')}
                  </button>
                  <button
                    onClick={() => { setActiveTab('transactions'); setShowMobileMenu(false); }}
                    className={cn(
                      "p-3 rounded-xl text-sm font-medium flex flex-col items-center justify-center gap-2 transition-colors",
                      activeTab === 'transactions' ? "bg-white/10 text-white" : "bg-white/5 text-slate-400"
                    )}
                  >
                    <ArrowRightLeft className="h-5 w-5" />
                    {language === 'id' ? 'Transaksi' : 'Transactions'}
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => { setActiveTab('admin'); setShowMobileMenu(false); }}
                      className={cn(
                        "p-3 rounded-xl text-sm font-medium flex flex-col items-center justify-center gap-2 transition-colors col-span-2",
                        activeTab === 'admin' ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-slate-400"
                      )}
                    >
                      <Shield className="h-5 w-5" />
                      Admin Panel
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-sm font-medium text-slate-300">Language</span>
                  <div className="flex items-center gap-1 bg-black/50 rounded-full p-1">
                    <button
                      onClick={() => setLanguage('id')}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                        language === 'id' ? 'bg-white text-black' : 'text-slate-400'
                      }`}
                    >
                      ID
                    </button>
                    <button
                      onClick={() => setLanguage('en')}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                        language === 'en' ? 'bg-white text-black' : 'text-slate-400'
                      }`}
                    >
                      EN
                    </button>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full border-white/10"
                  onClick={() => { setShowConverter(!showConverter); setShowMobileMenu(false); }}
                >
                  <ArrowRightLeft className="h-4 w-4 mr-2" />
                  {t('converter')}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content Area */}
      {activeTab === 'admin' && isAdmin ? (
        <AdminPanel />
      ) : activeTab === 'transactions' ? (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <TransactionHistory transactions={transactions} coins={coins} />
        </main>
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Portfolio & Market */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-8">
            
            {/* Portfolio Summary Card */}
            <Card className="relative overflow-hidden border-white/5 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] p-8">
              <div className="absolute top-0 right-0 p-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 p-24 bg-cyan-500/5 rounded-full blur-3xl -ml-12 -mb-12 pointer-events-none"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Wallet className="h-4 w-4" />
                    <span className="text-sm font-medium uppercase tracking-wider">{t('total_balance')}</span>
                  </div>
                  <div className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight mb-3">
                    {formatCurrency(portfolioTotal)}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium",
                      portfolioChange24h >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                    )}>
                      {portfolioChange24h >= 0 ? <TrendingUp className="h-3.5 w-3.5 mr-1.5" /> : <TrendingDown className="h-3.5 w-3.5 mr-1.5" />}
                      {Math.abs(portfolioChange24h).toFixed(2)}%
                    </div>
                    <span className="text-sm text-slate-500 font-medium">vs last 24h</span>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    onClick={() => setIsPortfolioModalOpen(true)}
                    className="bg-white text-black hover:bg-slate-200 shadow-xl shadow-white/5 transition-all"
                  >
                    {t('manage_portfolio')}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Market Section */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                  <Activity className="h-6 w-6 text-emerald-400" />
                  {t('market_overview')}
                </h2>
                
                <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
                  <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                    <button
                      onClick={() => setActiveFilter('all')}
                      className={cn(
                        "px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                        activeFilter === 'all' 
                          ? "bg-white/10 text-white shadow-sm" 
                          : "text-slate-400 hover:text-white"
                      )}
                    >
                      {t('all_assets')}
                    </button>
                    <button
                      onClick={() => setActiveFilter('favorites')}
                      className={cn(
                        "px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-1.5",
                        activeFilter === 'favorites' 
                          ? "bg-white/10 text-white shadow-sm" 
                          : "text-slate-400 hover:text-white"
                      )}
                    >
                      <Star className={cn("h-3.5 w-3.5", activeFilter === 'favorites' ? "fill-yellow-500 text-yellow-500" : "")} />
                      {t('favorites')}
                    </button>
                    <button
                      onClick={() => setActiveFilter('portfolio')}
                      className={cn(
                        "px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-1.5",
                        activeFilter === 'portfolio' 
                          ? "bg-white/10 text-white shadow-sm" 
                          : "text-slate-400 hover:text-white"
                      )}
                    >
                      <Wallet className="h-3.5 w-3.5" />
                      {t('portfolio')}
                    </button>
                  </div>
                </div>
              </div>

              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                <Input
                  type="text"
                  placeholder={t('search_placeholder') || "Search coins..."}
                  className="pl-12 h-14 bg-[#0a0a0a]/50 backdrop-blur-xl border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-2xl text-lg transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-hidden rounded-2xl border border-white/5 bg-[#0a0a0a]/50 backdrop-blur-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02]">
                        <th className="p-4 font-medium text-slate-400 text-sm w-12 text-center">#</th>
                        <th className="p-4 font-medium text-slate-400 text-sm">{t('asset')}</th>
                        <th className="p-4 font-medium text-slate-400 text-sm text-right">{t('price')}</th>
                        <th className="p-4 font-medium text-slate-400 text-sm text-right">{t('change_24h')}</th>
                        <th className="p-4 font-medium text-slate-400 text-sm text-right hidden lg:table-cell">{t('market_cap')}</th>
                        <th className="p-4 font-medium text-slate-400 text-sm text-right hidden xl:table-cell">{t('volume_24h')}</th>
                        <th className="p-4 font-medium text-slate-400 text-sm w-32 hidden lg:table-cell text-center">Last 7 Days</th>
                        <th className="p-4 font-medium text-slate-400 text-sm w-16 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {loading ? (
                        [...Array(5)].map((_, i) => (
                          <tr key={i} className="animate-pulse">
                            <td className="p-4"><div className="h-4 w-4 bg-white/5 rounded mx-auto"></div></td>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 bg-white/5 rounded-full"></div>
                                <div className="space-y-2">
                                  <div className="h-4 w-20 bg-white/5 rounded"></div>
                                  <div className="h-3 w-12 bg-white/5 rounded"></div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4"><div className="h-4 w-24 bg-white/5 rounded ml-auto"></div></td>
                            <td className="p-4"><div className="h-4 w-16 bg-white/5 rounded ml-auto"></div></td>
                            <td className="p-4 hidden lg:table-cell"><div className="h-4 w-24 bg-white/5 rounded ml-auto"></div></td>
                            <td className="p-4 hidden xl:table-cell"><div className="h-4 w-24 bg-white/5 rounded ml-auto"></div></td>
                            <td className="p-4 hidden lg:table-cell"><div className="h-8 w-24 bg-white/5 rounded mx-auto"></div></td>
                            <td className="p-4"><div className="h-6 w-6 bg-white/5 rounded mx-auto"></div></td>
                          </tr>
                        ))
                      ) : (
                        filteredAndSortedCoins.map((coin, index) => (
                          <motion.tr
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.02 }}
                            key={coin.id}
                            onClick={() => handleCoinClick(coin)}
                            className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                          >
                            <td className="p-4 text-slate-500 text-sm text-center font-mono">
                              {coin.market_cap_rank}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                                <div>
                                  <div className="font-medium text-white group-hover:text-emerald-400 transition-colors">{coin.name}</div>
                                  <div className="text-xs text-slate-500 uppercase font-mono">{coin.symbol}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-right font-mono font-medium text-white">
                              {formatCurrency(coin.current_price)}
                            </td>
                            <td className="p-4 text-right">
                              <div className={cn(
                                "inline-flex items-center px-2 py-1 rounded-md text-sm font-mono font-medium",
                                coin.price_change_percentage_24h >= 0 
                                  ? "bg-emerald-500/10 text-emerald-400" 
                                  : "bg-rose-500/10 text-rose-400"
                              )}>
                                {coin.price_change_percentage_24h >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                                {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                              </div>
                            </td>
                            <td className="p-4 text-right text-slate-300 font-mono text-sm hidden lg:table-cell">
                              {formatCurrency(coin.market_cap)}
                            </td>
                            <td className="p-4 text-right text-slate-300 font-mono text-sm hidden xl:table-cell">
                              {formatCurrency(coin.total_volume)}
                            </td>
                            <td className="p-4 hidden lg:table-cell">
                              {coin.sparkline_in_7d && (
                                <SparklineChart 
                                  data={coin.sparkline_in_7d.price} 
                                  isPositive={coin.price_change_percentage_24h >= 0} 
                                />
                              )}
                            </td>
                            <td className="p-4 text-center">
                              <button
                                onClick={(e) => toggleFavorite(e, coin.id)}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                              >
                                <Star
                                  className={cn(
                                    "h-5 w-5 transition-colors",
                                    favorites.includes(coin.id) ? "fill-yellow-400 text-yellow-400" : "text-slate-600 group-hover:text-slate-400"
                                  )}
                                />
                              </button>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <Card key={i} className="p-4 border-white/5 bg-[#0a0a0a]/50">
                      <div className="animate-pulse flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-white/5 rounded-full"></div>
                          <div className="space-y-2">
                            <div className="h-4 w-20 bg-white/5 rounded"></div>
                            <div className="h-3 w-12 bg-white/5 rounded"></div>
                          </div>
                        </div>
                        <div className="space-y-2 text-right">
                          <div className="h-4 w-24 bg-white/5 rounded ml-auto"></div>
                          <div className="h-4 w-16 bg-white/5 rounded ml-auto"></div>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  filteredAndSortedCoins.map((coin, index) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                      key={coin.id}
                    >
                    <Card
                      className="p-4 cursor-pointer border-white/5 bg-[#0a0a0a]/50 backdrop-blur-xl"
                      onClick={() => handleCoinClick(coin)}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <img src={coin.image} alt={coin.name} className="w-10 h-10 rounded-full" referrerPolicy="no-referrer" />
                          <div>
                            <div className="font-bold text-white">{coin.name}</div>
                            <div className="text-xs text-slate-500 uppercase font-mono">{coin.symbol}</div>
                          </div>
                        </div>
                        <button
                          onClick={(e) => toggleFavorite(e, coin.id)}
                          className="p-2 -mr-2 -mt-2 rounded-lg active:bg-white/10"
                        >
                          <Star
                             className={cn(
                              "h-5 w-5 transition-colors",
                              favorites.includes(coin.id) ? "fill-yellow-400 text-yellow-400" : "text-slate-600"
                            )}
                          />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-xs text-slate-500 mb-1 uppercase tracking-wider">{t('price')}</div>
                          <div className="text-lg font-mono font-medium text-white">{formatCurrency(coin.current_price)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-slate-500 mb-1 uppercase tracking-wider">{t('change_24h')}</div>
                          <div className={cn(
                            "inline-flex items-center text-sm font-mono font-medium",
                            coin.price_change_percentage_24h >= 0 ? "text-emerald-400" : "text-rose-400"
                          )}>
                            {coin.price_change_percentage_24h >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                            {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                          </div>
                        </div>
                      </div>

                      {coin.sparkline_in_7d && (
                        <div className="mb-4 h-12 w-full bg-white/5 rounded-xl p-2 flex items-center justify-center">
                          <SparklineChart 
                            data={coin.sparkline_in_7d.price} 
                            isPositive={coin.price_change_percentage_24h >= 0} 
                          />
                        </div>
                      )}

                      <div className="pt-4 border-t border-white/5 flex justify-between items-center text-xs text-slate-500 font-mono">
                        <span>Rank #{coin.market_cap_rank}</span>
                        <span>MCap: {(coin.market_cap / 1e9).toFixed(2)}B</span>
                      </div>
                    </Card>
                    </motion.div>
                  ))
                )}
              </div>

              {filteredAndSortedCoins.length === 0 && !loading && (
                <div className="text-center py-20">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 mb-4">
                    {activeFilter === 'favorites' ? (
                      <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    ) : (
                      <Search className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                  <h3 className="text-lg font-display font-medium text-white mb-1">
                    {activeFilter === 'favorites' ? t('no_favorites_found') : t('no_assets_found')}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    {activeFilter === 'favorites' ? t('add_favorites_hint') : t('adjust_search')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Converter & News */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-8">
            <AnimatePresence>
              {showConverter && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="hidden lg:block overflow-hidden"
                >
                  <CryptoConverter coins={coins} />
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="sticky top-24">
              <NewsFeed />
            </div>
          </div>
          
          {/* Mobile Converter Modal */}
          {showConverter && (
            <div className="lg:hidden fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="w-full max-w-sm relative">
                <button
                  onClick={() => setShowConverter(false)}
                  className="absolute -top-12 right-0 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
                <CryptoConverter coins={coins} />
              </div>
            </div>
          )}
        </div>
      )}
    </main>

      <AddPortfolioModal
        isOpen={isPortfolioModalOpen}
        onClose={() => setIsPortfolioModalOpen(false)}
        coins={coins}
        portfolio={portfolio}
        onSave={handleSavePortfolio}
      />
      </Layout>
    </motion.div>
  );
}
