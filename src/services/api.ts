import axios from 'axios';

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number | null;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  roi: null | {
    times: number;
    currency: string;
    percentage: number;
  };
  last_updated: string;
  sparkline_in_7d?: {
    price: number[];
  };
}

export const getCoins = async (): Promise<Coin[]> => {
  try {
    const response = await axios.get(`${COINGECKO_API_URL}/coins/markets`, {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 20,
        page: 1,
        sparkline: true,
        price_change_percentage: '24h',
      },
    });
    return response.data;
  } catch (error) {
    console.warn('CoinGecko API rate limit reached or network error. Using mock data instead.');
    // Fallback mock data in case of API rate limit
    return [
      {
        id: "bitcoin",
        symbol: "btc",
        name: "Bitcoin",
        image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
        current_price: 65000,
        market_cap: 1200000000000,
        market_cap_rank: 1,
        fully_diluted_valuation: 1300000000000,
        total_volume: 35000000000,
        high_24h: 66000,
        low_24h: 64000,
        price_change_24h: 1000,
        price_change_percentage_24h: 1.5,
        market_cap_change_24h: 15000000000,
        market_cap_change_percentage_24h: 1.5,
        circulating_supply: 19000000,
        total_supply: 21000000,
        max_supply: 21000000,
        ath: 73000,
        ath_change_percentage: -10,
        ath_date: "2024-03-14T00:00:00.000Z",
        atl: 67,
        atl_change_percentage: 90000,
        atl_date: "2013-07-06T00:00:00.000Z",
        roi: null,
        last_updated: new Date().toISOString(),
        sparkline_in_7d: { price: Array.from({length: 24}, () => 60000 + Math.random() * 5000) }
      },
      {
        id: "ethereum",
        symbol: "eth",
        name: "Ethereum",
        image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
        current_price: 3500,
        market_cap: 400000000000,
        market_cap_rank: 2,
        fully_diluted_valuation: 400000000000,
        total_volume: 15000000000,
        high_24h: 3600,
        low_24h: 3400,
        price_change_24h: -50,
        price_change_percentage_24h: -1.4,
        market_cap_change_24h: -5000000000,
        market_cap_change_percentage_24h: -1.4,
        circulating_supply: 120000000,
        total_supply: 120000000,
        max_supply: null,
        ath: 4800,
        ath_change_percentage: -27,
        ath_date: "2021-11-10T00:00:00.000Z",
        atl: 0.43,
        atl_change_percentage: 800000,
        atl_date: "2015-10-20T00:00:00.000Z",
        roi: null,
        last_updated: new Date().toISOString(),
        sparkline_in_7d: { price: Array.from({length: 24}, () => 3000 + Math.random() * 500) }
      },
      {
        id: "tether",
        symbol: "usdt",
        name: "Tether",
        image: "https://assets.coingecko.com/coins/images/325/large/Tether.png",
        current_price: 1.00,
        market_cap: 100000000000,
        market_cap_rank: 3,
        fully_diluted_valuation: 100000000000,
        total_volume: 40000000000,
        high_24h: 1.01,
        low_24h: 0.99,
        price_change_24h: 0.001,
        price_change_percentage_24h: 0.1,
        market_cap_change_24h: 10000000,
        market_cap_change_percentage_24h: 0.1,
        circulating_supply: 100000000000,
        total_supply: 100000000000,
        max_supply: null,
        ath: 1.32,
        ath_change_percentage: -24,
        ath_date: "2018-07-24T00:00:00.000Z",
        atl: 0.57,
        atl_change_percentage: 75,
        atl_date: "2015-03-02T00:00:00.000Z",
        roi: null,
        last_updated: new Date().toISOString(),
        sparkline_in_7d: { price: Array.from({length: 24}, () => 0.99 + Math.random() * 0.02) }
      }
    ];
  }
};

export interface ChartData {
  timestamp: number;
  price: number;
}

export const getCoinDetails = async (id: string): Promise<Coin | null> => {
  try {
    const response = await axios.get(`${COINGECKO_API_URL}/coins/${id}`, {
      params: {
        localization: false,
        tickers: false,
        market_data: true,
        community_data: false,
        developer_data: false,
        sparkline: true,
      },
    });
    
    const data = response.data;
    
    // Map to Coin interface
    return {
      id: data.id,
      symbol: data.symbol,
      name: data.name,
      image: data.image.large,
      current_price: data.market_data.current_price.usd,
      market_cap: data.market_data.market_cap.usd,
      market_cap_rank: data.market_cap_rank,
      fully_diluted_valuation: data.market_data.fully_diluted_valuation.usd,
      total_volume: data.market_data.total_volume.usd,
      high_24h: data.market_data.high_24h.usd,
      low_24h: data.market_data.low_24h.usd,
      price_change_24h: data.market_data.price_change_24h,
      price_change_percentage_24h: data.market_data.price_change_percentage_24h,
      market_cap_change_24h: data.market_data.market_cap_change_24h,
      market_cap_change_percentage_24h: data.market_data.market_cap_change_percentage_24h,
      circulating_supply: data.market_data.circulating_supply,
      total_supply: data.market_data.total_supply,
      max_supply: data.market_data.max_supply,
      ath: data.market_data.ath.usd,
      ath_change_percentage: data.market_data.ath_change_percentage.usd,
      ath_date: data.market_data.ath_date.usd,
      atl: data.market_data.atl.usd,
      atl_change_percentage: data.market_data.atl_change_percentage.usd,
      atl_date: data.market_data.atl_date.usd,
      roi: data.roi,
      last_updated: data.last_updated,
      sparkline_in_7d: data.market_data.sparkline_7d ? {
        price: data.market_data.sparkline_7d.price
      } : undefined
    };
  } catch (error) {
    console.warn(`CoinGecko API rate limit reached for coin ${id}. Using mock data instead.`);
    // Return mock data for known coins if API fails
    const mockCoins = await getCoins();
    const mockCoin = mockCoins.find(c => c.id === id);
    return mockCoin || null;
  }
};
export const getCoinHistory = async (id: string, days: number = 7): Promise<ChartData[]> => {
  try {
    const response = await axios.get(`${COINGECKO_API_URL}/coins/${id}/market_chart`, {
      params: {
        vs_currency: 'usd',
        days: days,
      },
    });
    
    // response.data.prices is an array of [timestamp, price]
    return response.data.prices.map((item: [number, number]) => ({
      timestamp: item[0],
      price: item[1],
    }));
  } catch (error) {
    console.warn(`CoinGecko API rate limit reached for history ${id}. Using mock data instead.`);
    // Generate mock history data
    const data: ChartData[] = [];
    const now = Date.now();
    const points = days === 1 ? 24 : days;
    const interval = (days * 24 * 60 * 60 * 1000) / points;
    
    let currentPrice = id === 'bitcoin' ? 65000 : id === 'ethereum' ? 3500 : 1;
    
    for (let i = points; i >= 0; i--) {
      data.push({
        timestamp: now - (i * interval),
        price: currentPrice
      });
      // Random walk for price
      currentPrice = currentPrice * (1 + (Math.random() * 0.04 - 0.02));
    }
    
    return data;
  }
};
