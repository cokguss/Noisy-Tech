import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, RefreshCw, TrendingUp, TrendingDown, LogOut, Menu, X, Calculator, Plus, Wallet, ChevronsUpDown, Trash2, Globe, Shield, Megaphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCoins, Coin } from '@/services/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Layout } from '@/components/layout';
import { CryptoConverter } from '@/components/CryptoConverter';
import { NewsFeed } from '@/components/NewsFeed';
import { AddPortfolioModal, PortfolioItem } from '@/components/AddPortfolioModal';
import { WelcomeToast } from '@/components/WelcomeToast';
import { AdminPanel } from '@/components/AdminPanel';
import { PortfolioAnalytics } from '@/components/PortfolioAnalytics';
import { TransactionHistory } from '@/components/TransactionHistory';
import { SparklineChart } from '@/components/SparklineChart';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { logActivity } from '@/lib/activity';
import { Skeleton } from '@/components/ui/skeleton';

import { db } from '@/services/db';

type SortKey = 'market_cap_rank' | 'name' | 'current_price' | 'price_change_percentage_24h' | 'market_cap';
type SortOrder = 'asc' | 'desc';

export default function Dashboard() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
  const [showConverter, setShowConverter] = useState(false);
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'market' | 'admin'>('market');
  const [activeFilter, setActiveFilter] = useState<'all' | 'favorites'>('all');
  const [broadcastMessage, setBroadcastMessage] = useState<string | null>(null);
  
  const [sortKey, setSortKey] = useState<SortKey>('market_cap_rank');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();

  // Load favorites and portfolio from local storage / db
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const username = user.username || 'guest';
    
    const loadUserData = async () => {
      const userFavorites = await db.getFavorites(username);
      setFavorites(userFavorites);
      
      const userPortfolio = await db.getPortfolio(username);
      setPortfolio(userPortfolio);
    };
    
    loadUserData();

    const currentBroadcast = localStorage.getItem('broadcast_message');
    setBroadcastMessage(currentBroadcast);

    const handleStorageChange = () => {
      setBroadcastMessage(localStorage.getItem('broadcast_message'));
    };
    window.addEventListener('storage', handleStorageChange);
    
    // Heartbeat for online status
    const heartbeat = setInterval(() => {
      if (username !== 'guest') {
        localStorage.setItem(`last_active_${username}`, Date.now().toString());
        window.dispatchEvent(new Event('storage'));
      }
    }, 30000); // Every 30 seconds

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(heartbeat);
    };
  }, []);

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    const data = await getCoins();
    setCoins(data);
    setLastUpdated(new Date());
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Auto-refresh every 60s
    return () => clearInterval(interval);
  }, []);

  // Filter and Sort logic
  const filteredAndSortedCoins = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    let result = coins.filter(
      (coin) =>
        (coin.name.toLowerCase().includes(lowerSearch) ||
        coin.symbol.toLowerCase().includes(lowerSearch)) &&
        (activeFilter === 'all' || favorites.includes(coin.id))
    );

    result.sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'asc' 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      }
      
      return sortOrder === 'asc' 
        ? (valA as number) - (valB as number) 
        : (valB as number) - (valA as number);
    });

    return result;
  }, [search, coins, sortKey, sortOrder, activeFilter, favorites]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc'); // Default to desc for most metrics
    }
  };

  const SortIcon = ({ k }: { k: SortKey }) => (
    <ChevronsUpDown className={cn(
      "h-3 w-3 ml-1 transition-colors",
      sortKey === k ? "text-emerald-400" : "text-slate-600 group-hover/th:text-slate-400"
    )} />
  );

  // Toggle favorite
  const toggleFavorite = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const username = user.username || 'guest';
    
    const isCurrentlyFavorite = favorites.includes(id);
    const newFavorites = isCurrentlyFavorite
      ? favorites.filter((fav) => fav !== id)
      : [...favorites, id];
      
    setFavorites(newFavorites);
    await db.toggleFavorite(username, id, !isCurrentlyFavorite);
  };

  const handleSavePortfolio = async (id: string, amount: number) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const username = user.username || 'guest';
    const name = user.name || 'User';
    
    let newPortfolio = [...portfolio];
    const existingIndex = newPortfolio.findIndex(p => p.id === id);
    const existingAmount = existingIndex >= 0 ? newPortfolio[existingIndex].amount : 0;
    
    const coin = coins.find(c => c.id === id);
    const currentPrice = coin ? coin.current_price : 0;
    
    const diff = amount - existingAmount;
    
    if (diff !== 0) {
      await db.saveTransaction(username, {
        id: Date.now().toString(),
        coinId: id,
        type: diff > 0 ? 'buy' : 'sell',
        amount: Math.abs(diff),
        price: currentPrice,
        date: new Date().toISOString()
      });
      // Dispatch storage event to update other components
      window.dispatchEvent(new Event('storage'));
    }
    
    if (amount === 0) {
      if (existingIndex >= 0) {
        newPortfolio.splice(existingIndex, 1);
        logActivity(username, name, 'activity_remove_asset', id);
      }
    } else {
      if (existingIndex >= 0) {
        newPortfolio[existingIndex].amount = amount;
      } else {
        newPortfolio.push({ id, amount });
        logActivity(username, name, 'activity_add_asset', id);
      }
    }
    
    setPortfolio(newPortfolio);
    await db.savePortfolioItem(username, id, amount);
  };

  const handleDeleteAsset = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const username = user.username || 'guest';
    const name = user.name || 'User';
    
    const existingItem = portfolio.find(p => p.id === id);
    if (existingItem) {
      const coin = coins.find(c => c.id === id);
      const currentPrice = coin ? coin.current_price : 0;
      
      await db.saveTransaction(username, {
        id: Date.now().toString(),
        coinId: id,
        type: 'sell',
        amount: existingItem.amount,
        price: currentPrice,
        date: new Date().toISOString()
      });
      window.dispatchEvent(new Event('storage'));
    }
    
    const newPortfolio = portfolio.filter(p => p.id !== id);
    setPortfolio(newPortfolio);
    await db.savePortfolioItem(username, id, 0);
    logActivity(username, name, 'activity_remove_asset', id);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    sessionStorage.removeItem('hasShownWelcomeToast');
    navigate('/login');
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.username === 'noisy';

  const handleCoinClick = (coin: Coin) => {
    navigate(`/coin/${coin.id}`, { state: { coin } });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  // Portfolio Calculations
  const { totalValue, total24hChange, total24hChangePct } = useMemo(() => {
    let value = 0;
    let change = 0;

    portfolio.forEach(item => {
      const coin = coins.find(c => c.id === item.id);
      if (coin) {
        const itemValue = coin.current_price * item.amount;
        value += itemValue;
        
        // Calculate what the value was 24h ago
        const valueYesterday = itemValue / (1 + coin.price_change_percentage_24h / 100);
        change += (itemValue - valueYesterday);
      }
    });

    const pct = value === 0 ? 0 : (change / (value - change)) * 100;

    return {
      totalValue: value,
      total24hChange: change,
      total24hChangePct: pct
    };
  }, [portfolio, coins]);

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
        {broadcastMessage && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-emerald-500/20 border-b border-emerald-500/20 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-3 flex items-center justify-center gap-3">
              <div className="flex items-center justify-center h-6 w-6 rounded-full bg-emerald-500/20 animate-pulse">
                <Megaphone className="h-3 w-3 text-emerald-400" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-emerald-400 tracking-wide text-center">
                {broadcastMessage}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400/20 to-cyan-500/20 border border-emerald-500/20">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
            <span className="text-xl font-display font-bold tracking-tight hidden sm:block">
              Noisy Tech
            </span>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
              <Input
                placeholder={t('search_placeholder')}
                className="pl-11 h-10 bg-white/5 border-white/10 focus:border-emerald-500/50 rounded-full transition-all font-mono text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isAdmin && (
              <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full p-1 mr-2">
                <button
                  onClick={() => setActiveTab('market')}
                  className={`px-2 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-bold transition-all ${
                    activeTab === 'market' ? 'bg-white text-black' : 'text-slate-500 hover:text-white'
                  }`}
                >
                  {t('market_overview').split(' ')[0]}
                </button>
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`px-2 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-bold transition-all ${
                    activeTab === 'admin' ? 'bg-white text-black' : 'text-slate-500 hover:text-white'
                  }`}
                >
                  {t('admin_panel').split(' ')[0]}
                </button>
              </div>
            )}
            {/* Language Switcher */}
            <div className="hidden sm:flex items-center gap-1 bg-white/5 border border-white/10 rounded-full p-1 shrink-0">
              <button
                onClick={() => setLanguage('id')}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                  language === 'id' ? 'bg-white text-black' : 'text-slate-500 hover:text-white'
                }`}
              >
                ID
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                  language === 'en' ? 'bg-white text-black' : 'text-slate-500 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 font-mono shrink-0 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="whitespace-nowrap">{t('live_status')}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchData}
              className={cn("text-slate-400 hover:text-white rounded-full", loading && "animate-spin text-emerald-400")}
              title={`${t('last_updated')}: ${lastUpdated.toLocaleTimeString()}`}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowConverter(!showConverter)}
              className={cn("hidden md:flex rounded-full", showConverter ? "bg-emerald-500/20 text-emerald-400" : "text-slate-400 hover:text-white")}
              title={t('toggle_converter')}
            >
              <Calculator className="h-4 w-4" />
            </Button>
            <div className="hidden md:flex items-center gap-3 pl-4 border-l border-white/10">
              <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-full hover:bg-rose-500/10 hover:text-rose-400 transition-colors">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-white/5 bg-[#0a0a0a]"
            >
              <div className="p-4 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    placeholder={t('search_placeholder')}
                    className="pl-9 bg-white/5 border-white/10 rounded-xl font-mono text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                {isAdmin && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => { setActiveTab('market'); setIsMobileMenuOpen(false); }}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-bold text-xs transition-all ${
                        activeTab === 'market' 
                          ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' 
                          : 'bg-white/5 border-white/10 text-slate-400'
                      }`}
                    >
                      <TrendingUp className="h-4 w-4" />
                      {t('market_overview')}
                    </button>
                    <button
                      onClick={() => { setActiveTab('admin'); setIsMobileMenuOpen(false); }}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-bold text-xs transition-all ${
                        activeTab === 'admin' 
                          ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' 
                          : 'bg-white/5 border-white/10 text-slate-400'
                      }`}
                    >
                      <Shield className="h-4 w-4" />
                      {t('admin_panel')}
                    </button>
                  </div>
                )}
                <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setLanguage('id')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        language === 'id' ? 'bg-white text-black' : 'text-slate-500'
                      }`}
                    >
                      ID
                    </button>
                    <button
                      onClick={() => setLanguage('en')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        language === 'en' ? 'bg-white text-black' : 'text-slate-500'
                      }`}
                    >
                      EN
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setShowConverter(!showConverter)} className={cn(showConverter && "text-emerald-400")}>
                      <Calculator className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleLogout} className="text-rose-400">
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {isAdmin && activeTab === 'admin' ? (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold tracking-tight text-white mb-1">{t('admin_panel')}</h1>
                <p className="text-slate-400 text-sm">{t('user_management')}</p>
              </div>
            </div>
            <AdminPanel />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Market Overview & Portfolio */}
            <div className="lg:col-span-8 xl:col-span-9 space-y-8">
              
              {/* Portfolio Summary Card */}
            <div className="relative rounded-3xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md overflow-hidden shadow-2xl p-6 sm:p-8">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Wallet className="w-48 h-48 text-emerald-400 transform rotate-12" />
              </div>
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                  <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Wallet className="w-4 h-4" /> {t('total_balance')}
                  </h2>
                  <div className="text-4xl sm:text-5xl font-mono font-bold text-white tracking-tight mb-2">
                    {formatCurrency(totalValue)}
                  </div>
                  <div className={cn(
                    "inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-mono font-medium",
                    total24hChange >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                  )}>
                    {total24hChange >= 0 ? <TrendingUp className="h-4 w-4 mr-2" /> : <TrendingDown className="h-4 w-4 mr-2" />}
                    {total24hChange >= 0 ? '+' : ''}{formatCurrency(total24hChange)} ({Math.abs(total24hChangePct).toFixed(2)}%)
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <Button 
                    onClick={() => setIsPortfolioModalOpen(true)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 font-medium"
                  >
                    <Plus className="w-4 h-4 mr-2" /> {t('add_asset')}
                  </Button>
                </div>
              </div>

              {/* Portfolio Analytics */}
              {portfolio.length > 0 && (
                <div className="mt-8 pt-6 border-t border-white/5">
                  <PortfolioAnalytics portfolio={portfolio} coins={coins} />
                </div>
              )}

              {/* Portfolio Mini List - Only show when viewing all coins */}
              {portfolio.length > 0 && activeFilter === 'all' && (
                <div className="mt-8 pt-6 border-t border-white/5">
                  <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-4">{t('your_assets')}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {portfolio.map(item => {
                      const coin = coins.find(c => c.id === item.id);
                      if (!coin) return null;
                      const value = coin.current_price * item.amount;
                      return (
                        <div 
                          key={item.id} 
                          className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
                          onClick={() => handleCoinClick(coin)}
                        >
                          <div className="flex items-center gap-3">
                            <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                            <div>
                              <div className="font-medium text-white text-sm">{coin.symbol.toUpperCase()}</div>
                              <div className="text-xs text-slate-500 font-mono">{item.amount}</div>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-3">
                            <div>
                              <div className="font-mono font-medium text-white text-sm">{formatCurrency(value)}</div>
                              <div className={cn(
                                "text-xs font-mono",
                                coin.price_change_percentage_24h >= 0 ? "text-emerald-400" : "text-rose-400"
                              )}>
                                {coin.price_change_percentage_24h >= 0 ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
                              </div>
                            </div>
                            <button
                              onClick={(e) => handleDeleteAsset(e, item.id)}
                              className="p-2 rounded-lg bg-rose-500/10 text-rose-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
                              title={t('remove_asset')}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Transaction History */}
              {portfolio.length > 0 && activeFilter === 'all' && (
                <div className="mt-8 pt-6 border-t border-white/5">
                  <TransactionHistory coins={coins} />
                </div>
              )}
            </div>

            <div>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-display font-bold tracking-tight mb-1">{t('market_overview')}</h1>
                  <p className="text-slate-400 text-sm">{t('market_overview_subtitle')}</p>
                </div>
                
                <div className="flex items-center gap-2 bg-white/5 border border-white/5 p-1 rounded-xl">
                  <button
                    onClick={() => setActiveFilter('all')}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-xs font-medium transition-all",
                      activeFilter === 'all' ? "bg-white text-black shadow-lg" : "text-slate-400 hover:text-white"
                    )}
                  >
                    {t('filter_all')}
                  </button>
                  <button
                    onClick={() => setActiveFilter('favorites')}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2",
                      activeFilter === 'favorites' ? "bg-white text-black shadow-lg" : "text-slate-400 hover:text-white"
                    )}
                  >
                    <Star className={cn("h-3 w-3", activeFilter === 'favorites' ? "fill-black" : "fill-transparent")} />
                    {t('filter_favorites')}
                  </button>
                </div>
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block rounded-2xl border border-white/5 bg-[#0a0a0a]/50 backdrop-blur-md overflow-hidden shadow-2xl">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#111] text-slate-400 font-medium text-xs uppercase tracking-wider">
                    <tr>
                      <th 
                        className="p-4 w-12 font-medium cursor-pointer group/th"
                        onClick={() => handleSort('market_cap_rank')}
                      >
                        <div className="flex items-center"># <SortIcon k="market_cap_rank" /></div>
                      </th>
                      <th 
                        className="p-4 font-medium cursor-pointer group/th"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center">{t('asset')} <SortIcon k="name" /></div>
                      </th>
                      <th 
                        className="p-4 text-right font-medium cursor-pointer group/th"
                        onClick={() => handleSort('current_price')}
                      >
                        <div className="flex items-center justify-end">{t('price')} <SortIcon k="current_price" /></div>
                      </th>
                      <th 
                        className="p-4 text-right font-medium cursor-pointer group/th"
                        onClick={() => handleSort('price_change_percentage_24h')}
                      >
                        <div className="flex items-center justify-end">{t('change_24h')} <SortIcon k="price_change_percentage_24h" /></div>
                      </th>
                      <th className="p-4 text-center font-medium">{t('trend_7d')}</th>
                      <th 
                        className="p-4 text-right font-medium cursor-pointer group/th"
                        onClick={() => handleSort('market_cap')}
                      >
                        <div className="flex items-center justify-end">{t('market_cap')} <SortIcon k="market_cap" /></div>
                      </th>
                      <th className="p-4 text-center font-medium">{t('action')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loading ? (
                      Array.from({ length: 10 }).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="p-4"><Skeleton className="h-4 w-8 bg-white/5" /></td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <Skeleton className="h-8 w-8 rounded-full bg-white/5" />
                              <div className="space-y-1">
                                <Skeleton className="h-4 w-24 bg-white/5" />
                                <Skeleton className="h-3 w-12 bg-white/5" />
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-right"><Skeleton className="h-4 w-20 ml-auto bg-white/5" /></td>
                          <td className="p-4 text-right"><Skeleton className="h-6 w-16 ml-auto rounded-md bg-white/5" /></td>
                          <td className="p-4"><Skeleton className="h-8 w-24 mx-auto bg-white/5" /></td>
                          <td className="p-4 text-right"><Skeleton className="h-4 w-24 ml-auto bg-white/5" /></td>
                          <td className="p-4 text-center"><Skeleton className="h-8 w-8 mx-auto rounded-lg bg-white/5" /></td>
                        </tr>
                      ))
                    ) : (
                      filteredAndSortedCoins.slice(0, 50).map((coin) => (
                        <tr
                          key={coin.id}
                          onClick={() => handleCoinClick(coin)}
                          className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                        >
                          <td className="p-4 text-slate-500 font-mono text-xs">{coin.market_cap_rank}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img src={coin.image} alt={coin.name} className="h-8 w-8 rounded-full" referrerPolicy="no-referrer" />
                              <div>
                                <div className="font-medium text-white">{coin.name}</div>
                                <div className="text-xs text-slate-500 uppercase font-mono">{coin.symbol}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-right font-mono text-white">
                            {formatCurrency(coin.current_price)}
                          </td>
                          <td className="p-4 text-right">
                            <div className={cn(
                              "inline-flex items-center px-2 py-1 rounded-md text-xs font-mono font-medium",
                              coin.price_change_percentage_24h >= 0 
                                ? "bg-emerald-500/10 text-emerald-400" 
                                : "bg-rose-500/10 text-rose-400"
                            )}>
                              {coin.price_change_percentage_24h >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                              {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex justify-center">
                              {coin.sparkline_in_7d && (
                                <SparklineChart 
                                  data={coin.sparkline_in_7d.price} 
                                  isPositive={coin.price_change_percentage_24h >= 0} 
                                />
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-right text-slate-400 font-mono text-xs">
                            {formatCurrency(coin.market_cap)}
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={(e) => toggleFavorite(e, coin.id)}
                              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            >
                              <Star
                                 className={cn(
                                  "h-4 w-4 transition-colors",
                                  favorites.includes(coin.id) ? "fill-yellow-400 text-yellow-400" : "text-slate-600 group-hover:text-slate-400"
                                )}
                              />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden grid gap-4">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <Card key={i} className="p-4 border-white/5 bg-[#0a0a0a]/50 backdrop-blur-md">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-full bg-white/5" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32 bg-white/5" />
                            <Skeleton className="h-3 w-16 bg-white/5" />
                          </div>
                        </div>
                        <Skeleton className="h-8 w-8 rounded-lg bg-white/5" />
                      </div>
                      <div className="flex items-end justify-between">
                        <div className="space-y-2">
                          <Skeleton className="h-3 w-12 bg-white/5" />
                          <Skeleton className="h-6 w-24 bg-white/5" />
                        </div>
                        <div className="space-y-2 flex flex-col items-end">
                          <Skeleton className="h-3 w-16 bg-white/5" />
                          <Skeleton className="h-5 w-20 rounded-md bg-white/5" />
                        </div>
                      </div>
                      <div className="mt-4 h-12 w-full bg-white/5 rounded-xl p-2">
                         <Skeleton className="h-full w-full bg-white/5" />
                      </div>
                      <div className="pt-4 mt-4 border-t border-white/5 flex justify-between">
                        <Skeleton className="h-3 w-20 bg-white/5" />
                        <Skeleton className="h-3 w-24 bg-white/5" />
                      </div>
                    </Card>
                  ))
                ) : (
                  filteredAndSortedCoins.slice(0, 50).map((coin) => (
                    <Card
                      key={coin.id}
                      className="p-4 cursor-pointer border-white/5 bg-[#0a0a0a]/50 backdrop-blur-md"
                      onClick={() => handleCoinClick(coin)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <img src={coin.image} alt={coin.name} className="h-10 w-10 rounded-full" referrerPolicy="no-referrer" />
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
