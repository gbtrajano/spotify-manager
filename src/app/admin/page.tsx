'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { Subscription, User } from '@/types';

interface SubscriptionWithUser extends Subscription {
  user?: User;
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const router = useRouter();
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);

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

      if (!userData || userData.role !== 'admin') {
        router.push('/dashboard');
        return;
      }

      setUser(userData);
      fetchSubscriptions();
    };

    getUser();
  }, [router]);

  const fetchSubscriptions = async () => {
    const supabase = supabaseRef.current;
    if (!supabase) return;

    // Buscar订阅 e usuários separadamente para garantir que funcione
    const { data: subsData } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (subsData && subsData.length > 0) {
      // Buscar todos os usuários de uma vez
      const userIds = [...new Set(subsData.map(s => s.user_id))];
      const { data: usersData } = await supabase
        .from('users')
        .select('*')
        .in('id', userIds);

      const usersMap = new Map(usersData?.map(u => [u.id, u]) || []);

      // Associar usuários às assinaturas
      const subsWithUsers = subsData.map(sub => ({
        ...sub,
        user: usersMap.get(sub.user_id) || null
      }));

      setSubscriptions(subsWithUsers);
    }
    setLoading(false);
  };

  const markAsPaid = async (subscriptionId: string) => {
    const supabase = supabaseRef.current;
    if (!supabase) return;

    await supabase
      .from('subscriptions')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', subscriptionId);

    fetchSubscriptions();
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

  const handleLogout = async () => {
    const supabase = supabaseRef.current;
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push('/login');
  };

  const filteredSubscriptions = subscriptions.filter((sub) =>
    filterStatus === 'all' ? true : sub.status === filterStatus
  );

  const stats = {
    total: subscriptions.length,
    pending: subscriptions.filter((s) => s.status === 'pending').length,
    paid: subscriptions.filter((s) => s.status === 'paid').length,
    revenue: subscriptions
      .filter((s) => s.status === 'paid')
      .reduce((acc, s) => acc + s.amount, 0),
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
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1DB954] flex items-center justify-center">
              <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
            </div>
            <h1 className="text-xl font-bold">Painel Admin</h1>
          </div>
          <button
            onClick={handleLogout}
            className="text-[#b3b3b3] hover:text-white transition-colors"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#12121a] border border-[#282828] rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-[#1DB954]">{stats.total}</div>
            <div className="text-[#b3b3b3] text-sm">Total</div>
          </div>
          <div className="bg-[#12121a] border border-[#282828] rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-yellow-400">{stats.pending}</div>
            <div className="text-[#b3b3b3] text-sm">Pendentes</div>
          </div>
          <div className="bg-[#12121a] border border-[#282828] rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-green-400">{stats.paid}</div>
            <div className="text-[#b3b3b3] text-sm">Pagos</div>
          </div>
          <div className="bg-[#12121a] border border-[#282828] rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-[#1DB954]">{formatCurrency(stats.revenue)}</div>
            <div className="text-[#b3b3b3] text-sm">Receita</div>
          </div>
        </div>

        <div className="bg-[#12121a] border border-[#282828] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Todas as Assinaturas</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filterStatus === 'all'
                    ? 'bg-[#1DB954] text-black'
                    : 'bg-[#181818] text-[#b3b3b3] hover:bg-[#1a1a24]'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filterStatus === 'pending'
                    ? 'bg-yellow-500 text-black'
                    : 'bg-[#181818] text-[#b3b3b3] hover:bg-[#1a1a24]'
                }`}
              >
                Pendentes
              </button>
              <button
                onClick={() => setFilterStatus('paid')}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filterStatus === 'paid'
                    ? 'bg-green-500 text-black'
                    : 'bg-[#181818] text-[#b3b3b3] hover:bg-[#1a1a24]'
                }`}
              >
                Pagos
              </button>
            </div>
          </div>

          {filteredSubscriptions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#282828]">
                    <th className="text-left py-3 px-4 text-[#b3b3b3] font-medium">Usuário</th>
                    <th className="text-left py-3 px-4 text-[#b3b3b3] font-medium">Email</th>
                    <th className="text-left py-3 px-4 text-[#b3b3b3] font-medium">Duração</th>
                    <th className="text-left py-3 px-4 text-[#b3b3b3] font-medium">Valor</th>
                    <th className="text-left py-3 px-4 text-[#b3b3b3] font-medium">Criado</th>
                    <th className="text-left py-3 px-4 text-[#b3b3b3] font-medium">Vencimento</th>
                    <th className="text-left py-3 px-4 text-[#b3b3b3] font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-[#b3b3b3] font-medium">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscriptions.map((sub) => (
                    <tr key={sub.id} className="border-b border-[#282828] hover:bg-[#1a1a24] transition-colors">
                      <td className="py-3 px-4 font-medium">{sub.user?.name || '-'}</td>
                      <td className="py-3 px-4 text-[#b3b3b3]">{sub.user?.email || '-'}</td>
                      <td className="py-3 px-4">{sub.duration_months} {sub.duration_months === 1 ? 'mês' : 'meses'}</td>
                      <td className="py-3 px-4 text-[#1DB954]">{formatCurrency(sub.amount)}</td>
                      <td className="py-3 px-4">{formatDate(sub.created_at)}</td>
                      <td className="py-3 px-4">{formatDate(sub.end_date)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sub.status)}`}>
                          {sub.status === 'paid' ? 'Pago' : sub.status === 'pending' ? 'Pendente' : 'Vencido'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {sub.status === 'pending' && (
                          <button
                            onClick={() => markAsPaid(sub.id)}
                            className="px-3 py-1 bg-[#1DB954] text-black text-sm font-medium rounded-full hover:bg-[#1ed760] transition-colors"
                          >
                            Marcar Pago
                          </button>
                        )}
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