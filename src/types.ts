export interface Transaction {
  id: string;
  coinId: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  date: string;
}
