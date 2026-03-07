import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { ExternalLink, Clock, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const MOCK_NEWS = [
  {
    id: 1,
    title: "Bitcoin Breaks New Resistance Level as Institutional Interest Grows",
    source: "CoinDesk",
    time: "2h ago",
    url: "https://www.coindesk.com/markets/",
    sentiment: "positive"
  },
  {
    id: 2,
    title: "Ethereum Layer 2 Solutions See Record Transaction Volume",
    source: "Cointelegraph",
    time: "4h ago",
    url: "https://cointelegraph.com/category/market-analysis",
    sentiment: "positive"
  },
  {
    id: 3,
    title: "Regulatory Framework Discussions Heat Up in Global Markets",
    source: "Bloomberg Crypto",
    time: "6h ago",
    url: "https://www.bloomberg.com/crypto",
    sentiment: "neutral"
  },
  {
    id: 4,
    title: "New DeFi Protocol Launches with Innovative Yield Farming Mechanics",
    source: "The Defiant",
    time: "8h ago",
    url: "https://thedefiant.io/",
    sentiment: "positive"
  },
  {
    id: 5,
    title: "Market Analysis: Why Altcoins Might Be Ready for a Rally",
    source: "CryptoPanic",
    time: "12h ago",
    url: "https://cryptopanic.com/",
    sentiment: "positive"
  }
];

export function NewsFeed() {
  const { t } = useLanguage();

  return (
    <Card className="h-full border-white/10 bg-white/5 backdrop-blur-xl flex flex-col p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>{t('latest_news')}</span>
        </h3>
        <span className="text-[10px] text-slate-500 bg-slate-800/50 px-3 py-1 rounded-full border border-white/5 whitespace-nowrap shrink-0 w-fit">
          {t('live_feed')}
        </span>
      </div>

      <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
        {MOCK_NEWS.map((news, index) => (
          <motion.a
            key={news.id}
            href={news.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="block group"
          >
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-emerald-500/30 transition-all duration-300">
              <h4 className="text-sm font-medium text-slate-200 group-hover:text-emerald-400 transition-colors line-clamp-2 mb-3 leading-relaxed">
                {news.title}
              </h4>
              <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-wider font-mono">
                <span className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  {news.time} • {news.source}
                </span>
                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:text-emerald-400 transition-all transform translate-x-1 group-hover:translate-x-0" />
              </div>
            </div>
          </motion.a>
        ))}
      </div>
    </Card>
  );
}
