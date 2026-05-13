export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  duration_months: 1 | 2 | 3;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  start_date: string;
  end_date: string;
  created_at: string;
  paid_at: string | null;
  user?: User;
}

export type Duration = 1 | 2 | 3;

export const PRICE_PER_MONTH = 6.81;

export const PIX_KEY = 'conversarcomgabriel@gmail.com';
export const PIX_MERCHANT_NAME = 'Gabriel';
export const PIX_MERCHANT_CITY = 'Sao Paulo';