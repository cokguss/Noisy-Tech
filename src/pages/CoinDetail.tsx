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
