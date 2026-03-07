import { supabase } from '@/lib/supabase';
import { PortfolioItem } from '@/components/AddPortfolioModal';

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => supabase !== null;

export const db = {
  // --- FAVORITES ---
  async getFavorites(userId: string): Promise<string[]> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase!
        .from('favorites')
        .select('coin_id')
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error fetching favorites from Supabase:', error);
        return [];
      }
      return data.map(f => f.coin_id);
    } else {
      // Fallback to localStorage
      try {
        const stored = localStorage.getItem(`favorites_${userId}`);
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        return [];
      }
    }
  },

  async toggleFavorite(userId: string, coinId: string, isFavorite: boolean): Promise<void> {
    if (isSupabaseConfigured()) {
      if (isFavorite) {
        await supabase!.from('favorites').insert({ user_id: userId, coin_id: coinId });
      } else {
        await supabase!.from('favorites').delete().match({ user_id: userId, coin_id: coinId });
      }
    } else {
      // Fallback to localStorage
      try {
        const stored = localStorage.getItem(`favorites_${userId}`);
        let favorites: string[] = stored ? JSON.parse(stored) : [];
        
        if (isFavorite) {
          favorites.push(coinId);
        } else {
          favorites = favorites.filter(id => id !== coinId);
        }
        localStorage.setItem(`favorites_${userId}`, JSON.stringify(favorites));
      } catch (e) {
        console.error('Error toggling favorite:', e);
      }
    }
  },

  // --- PORTFOLIO ---
  async getPortfolio(userId: string): Promise<PortfolioItem[]> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase!
        .from('portfolio')
        .select('*')
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error fetching portfolio from Supabase:', error);
        return [];
      }
      return data.map(item => ({
        id: item.coin_id, // Map coin_id to id for existing UI compatibility
        amount: item.amount
      }));
    } else {
      // Fallback to localStorage
      try {
        const stored = localStorage.getItem(`portfolio_${userId}`);
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        return [];
      }
    }
  },

  async savePortfolioItem(userId: string, coinId: string, amount: number): Promise<void> {
    if (isSupabaseConfigured()) {
      if (amount === 0) {
        // Remove item
        await supabase!.from('portfolio').delete().match({ user_id: userId, coin_id: coinId });
      } else {
        // Upsert item
        const { error } = await supabase!.from('portfolio').upsert({
          user_id: userId,
          coin_id: coinId,
          amount: amount,
          created_at: new Date().toISOString()
        }, { onConflict: 'user_id,coin_id' });
        
        if (error) console.error('Error saving portfolio item:', error);
      }
    } else {
      // Fallback to localStorage
      try {
        const stored = localStorage.getItem(`portfolio_${userId}`);
        let portfolio: PortfolioItem[] = stored ? JSON.parse(stored) : [];
        
        const existingIndex = portfolio.findIndex(p => p.id === coinId);
        
        if (amount === 0) {
          if (existingIndex >= 0) portfolio.splice(existingIndex, 1);
        } else {
          if (existingIndex >= 0) {
            portfolio[existingIndex].amount = amount;
          } else {
            portfolio.push({ id: coinId, amount });
          }
        }
        localStorage.setItem(`portfolio_${userId}`, JSON.stringify(portfolio));
      } catch (e) {
        console.error('Error saving portfolio item:', e);
      }
    }
  },

  // --- TRANSACTIONS ---
  async getTransactions(userId: string): Promise<any[]> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase!
        .from('transactions')
        .select('*')
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error fetching transactions:', error);
        return [];
      }
      return data.map(t => ({
        id: t.id,
        coinId: t.coin_id,
        type: t.type,
        amount: t.amount,
        price: t.price,
        date: t.created_at
      }));
    } else {
      try {
        const stored = localStorage.getItem(`transactions_${userId}`);
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        return [];
      }
    }
  },

  async saveTransaction(userId: string, transaction: any): Promise<void> {
    if (isSupabaseConfigured()) {
      const { error } = await supabase!.from('transactions').insert({
        user_id: userId,
        coin_id: transaction.coinId,
        type: transaction.type,
        amount: transaction.amount,
        price: transaction.price,
        created_at: transaction.date
      });
      if (error) console.error('Error saving transaction:', error);
    } else {
      try {
        const stored = localStorage.getItem(`transactions_${userId}`);
        const transactions = stored ? JSON.parse(stored) : [];
        transactions.push(transaction);
        localStorage.setItem(`transactions_${userId}`, JSON.stringify(transactions));
      } catch (e) {
        console.error('Error saving transaction:', e);
      }
    }
  },

  async deleteTransaction(userId: string, transactionId: string): Promise<void> {
    if (isSupabaseConfigured()) {
      const { error } = await supabase!.from('transactions').delete().eq('id', transactionId);
      if (error) console.error('Error deleting transaction:', error);
    } else {
      try {
        const stored = localStorage.getItem(`transactions_${userId}`);
        if (stored) {
          const transactions: any[] = JSON.parse(stored);
          const updated = transactions.filter(t => t.id !== transactionId);
          localStorage.setItem(`transactions_${userId}`, JSON.stringify(updated));
        }
      } catch (e) {
        console.error('Error deleting transaction:', e);
      }
    }
  }
};
