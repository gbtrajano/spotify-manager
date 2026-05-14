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
  duration_months: 1;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  start_date: string;
  end_date: string;
  created_at: string;
  paid_at: string | null;
  user?: User;
}

export const PRICE_PER_MONTH = 6.81;

// URL da imagem do QR Code - substitua pela sua imagem
// Você pode colocar a imagem na pasta public e referenciar aqui
export const QR_CODE_IMAGE_URL = '/qrcode-pix.jpg';