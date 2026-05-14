'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { Subscription, User } from '@/types';
import { PRICE_PER_MONTH, QR_CODE_IMAGE_URL } from '@/types';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [pixKeyCopied, setPixKeyCopied] = useState(false);
  const router = useRouter();
  const PIX_KEY = 'conversarcomgabriel@gmail.com';
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);

  const fetchSubscriptions = useCallback(async (userId: string) => {
    const supabase = supabaseRef.current;
    if (!supabase) return;

    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (data) {
      setSubscriptions(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    supabaseRef.current = createClient();

    const getUser = async () => {
      const supabase = supabaseRef.current;
      if (!supabase) return;

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        router.push('/login');
        return;
      }

      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (userData) {
        setUser(userData);
        fetchSubscriptions(authUser.id);
      }
    };

    getUser();
  }, [router, fetchSubscriptions]);

  const createSubscription = async () => {
    const supabase = supabaseRef.current;
    if (!supabase || !user) return;
    setCreating(true);

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    const { error } = await supabase.from('subscriptions').insert({
      user_id: user.id,
      duration_months: 1,
      amount: PRICE_PER_MONTH,
      status: 'pending',
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
    });

    if (!error) {
      fetchSubscriptions(user.id);
      setShowQRCode(true);
    }
    setCreating(false);
  };

  const copyPixKey = async () => {
    try {
      await navigator.clipboard.writeText(PIX_KEY);
      setPixKeyCopied(true);
      setTimeout(() => setPixKeyCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = PIX_KEY;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setPixKeyCopied(true);
      setTimeout(() => setPixKeyCopied(false), 2000);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/20 text-green-400';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'overdue':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const lastSubscription = subscriptions.find(s => s.status === 'pending');

  const handleLogout = async () => {
    const supabase = supabaseRef.current;
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-[#1DB954]">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="bg-[#12121a] border-b border-[#282828]">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1DB954] flex items-center justify-center">
              <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
            </div>
            <h1 className="text-xl font-bold">Spotify Charge Manager</h1>
          </div>
          <div className="flex items-center gap-4">
            {user?.role === 'admin' && (
              <button
                onClick={() => router.push('/admin')}
                className="text-[#1DB954] hover:text-[#1ed760] transition-colors font-medium"
              >
                Admin
              </button>
            )}
            <button
              onClick={handleLogout}
              className="text-[#b3b3b3] hover:text-white transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#181818] flex items-center justify-center text-2xl font-bold text-[#1DB954]">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{user?.name}</h2>
            <p className="text-[#b3b3b3]">{user?.email}</p>
          </div>
        </div>

        {showQRCode && lastSubscription && (
          <div className="bg-[#12121a] border border-[#1DB954]/50 rounded-xl p-6 animate-fade-in">
            <h3 className="text-lg font-semibold text-[#1DB954] mb-4">QR Code para Pagamento</h3>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="bg-white p-4 rounded-xl">
                <img src={QR_CODE_IMAGE_URL} alt="QR Code PIX" className="w-48 h-48 object-contain" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <p className="text-3xl font-bold text-[#1DB954] mb-2">{formatCurrency(PRICE_PER_MONTH)}</p>
                <p className="text-[#b3b3b3] mb-4">Escaneie o QR Code para pagar</p>
                <p className="text-sm text-[#b3b3b3]">
                  Após o pagamento, aguarde a confirmação. Você será notificado quando o pagamento for confirmado.
                </p>
                <button
                  onClick={copyPixKey}
                  className="mt-3 px-4 py-2 bg-[#181818] border border-[#282828] rounded-full text-sm text-[#1DB954] hover:bg-[#1a1a24] transition-colors"
                >
                  {pixKeyCopied ? 'Copiado!' : 'Copiar chave PIX'}
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowQRCode(false)}
              className="mt-4 text-[#b3b3b3] hover:text-white text-sm"
            >
              Fechar
            </button>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#12121a] border border-[#282828] rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Sua Assinatura</h3>
            {lastSubscription ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[#b3b3b3]">Valor</span>
                  <span className="font-medium text-[#1DB954]">{formatCurrency(lastSubscription.amount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#b3b3b3]">Vencimento</span>
                  <span className="font-medium">{formatDate(lastSubscription.end_date)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#b3b3b3]">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lastSubscription.status)}`}>
                    {lastSubscription.status === 'paid' ? 'Pago' : lastSubscription.status === 'pending' ? 'Pendente' : 'Vencido'}
                  </span>
                </div>
                {lastSubscription.status === 'pending' && (
                  <button
                    onClick={() => setShowQRCode(true)}
                    className="w-full mt-4 py-2 border border-[#1DB954] text-[#1DB954] rounded-full hover:bg-[#1DB954]/10 transition-colors"
                  >
                    Ver QR Code
                  </button>
                )}
              </div>
            ) : (
              <p className="text-[#b3b3b3]">Nenhuma assinatura ativa</p>
            )}
          </div>

          <div className="bg-[#12121a] border border-[#282828] rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Renovar Assinatura</h3>
            <div className="space-y-4">
              <div className="text-center py-4 border-b border-[#282828]">
                <span className="text-3xl font-bold text-[#1DB954]">{formatCurrency(PRICE_PER_MONTH)}</span>
                <span className="text-[#b3b3b3]">/mês</span>
              </div>
              <button
                onClick={createSubscription}
                disabled={creating || (lastSubscription?.status === 'pending')}
                className="w-full py-3 bg-[#1DB954] text-black font-semibold rounded-full hover:bg-[#1ed760] transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Criando...' : lastSubscription?.status === 'pending' ? 'Aguardando Pagamento' : 'Gerar Assinatura'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-[#12121a] border border-[#282828] rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Histórico</h3>
          {subscriptions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#282828]">
                    <th className="text-left py-3 px-4 text-[#b3b3b3] font-medium">Data</th>
                    <th className="text-left py-3 px-4 text-[#b3b3b3] font-medium">Valor</th>
                    <th className="text-left py-3 px-4 text-[#b3b3b3] font-medium">Vencimento</th>
                    <th className="text-left py-3 px-4 text-[#b3b3b3] font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub) => (
                    <tr key={sub.id} className="border-b border-[#282828] hover:bg-[#1a1a24] transition-colors">
                      <td className="py-3 px-4">{formatDate(sub.created_at)}</td>
                      <td className="py-3 px-4 text-[#1DB954]">{formatCurrency(sub.amount)}</td>
                      <td className="py-3 px-4">{formatDate(sub.end_date)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sub.status)}`}>
                          {sub.status === 'paid' ? 'Pago' : sub.status === 'pending' ? 'Pendente' : 'Vencido'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-[#b3b3b3] text-center py-8">Nenhuma assinatura encontrada</p>
          )}
        </div>
      </main>
    </div>
  );
}