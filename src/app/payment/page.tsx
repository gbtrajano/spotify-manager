'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { PIX_KEY, PIX_MERCHANT_NAME, PIX_MERCHANT_CITY } from '@/types';
import { generatePIXPayload, generateTransactionId } from '@/lib/pix';
import QRCode from 'qrcode';

export default function PaymentPage() {
  const [subscriptionId, setSubscriptionId] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [pixCode, setPixCode] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);

  useEffect(() => {
    supabaseRef.current = createClient();

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
      router.push('/dashboard');
      return;
    }

    setSubscriptionId(id);
    fetchSubscription(id);
  }, [router]);

  const fetchSubscription = async (id: string) => {
    const supabase = supabaseRef.current;
    if (!supabase) return;

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*, user:users(*)')
      .eq('id', id)
      .single();

    if (!subscription) {
      router.push('/dashboard');
      return;
    }

    setAmount(subscription.amount);
    setDuration(subscription.duration_months);
    setUserName(subscription.user?.name || 'Usuario');

    const txid = generateTransactionId(subscription.user?.name || 'USER', id);
    const payload = generatePIXPayload(
      subscription.amount,
      PIX_MERCHANT_NAME,
      PIX_MERCHANT_CITY,
      txid
    );

    setPixCode(payload);

    const qr = await QRCode.toDataURL(payload, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });

    setQrCodeUrl(qr);
    setLoading(false);
  };

  const copyPixCode = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = pixCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-[#1DB954]">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <header className="bg-[#12121a] border-b border-[#282828]">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1DB954] flex items-center justify-center">
            <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold">Pagamento PIX</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">
        <div className="bg-[#12121a] border border-[#282828] rounded-xl p-6 text-center">
          <div className="mb-6">
            <p className="text-[#b3b3b3] mb-2">Assinatura Spotify</p>
            <p className="text-sm text-[#b3b3b3]">{duration} {duration === 1 ? 'mês' : 'meses'}</p>
          </div>

          <div className="text-4xl font-bold text-[#1DB954] mb-6">
            {formatCurrency(amount)}
          </div>

          <div className="bg-white p-4 rounded-xl mb-6 inline-block">
            {qrCodeUrl ? (
              <img src={qrCodeUrl} alt="QR Code PIX" className="w-48 h-48" />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center text-gray-500">
                Gerando...
              </div>
            )}
          </div>

          <p className="text-[#b3b3b3] text-sm mb-4">
            Escaneie o QR Code acima ou copie o código PIX abaixo
          </p>

          <div className="bg-[#181818] rounded-lg p-3 mb-4">
            <p className="text-xs text-[#535353] break-all select-all font-mono">
              {pixCode.slice(0, 50)}...
            </p>
          </div>

          <button
            onClick={copyPixCode}
            className="w-full py-3 bg-[#1DB954] text-black font-semibold rounded-full hover:bg-[#1ed760] transition-all hover:scale-[1.02]"
          >
            {copied ? 'Código Copiado!' : 'Copiar Código PIX'}
          </button>

          <div className="mt-6 pt-6 border-t border-[#282828]">
            <p className="text-[#b3b3b3] text-sm mb-2">Chave PIX:</p>
            <p className="font-medium text-[#1DB954]">{PIX_KEY}</p>
          </div>

          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-400 text-sm">
              <strong>Importante:</strong> Após realizar o pagamento, aguarde a confirmação. Você será notificado quando o pagamento for confirmado.
            </p>
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            className="mt-6 text-[#b3b3b3] hover:text-white transition-colors text-sm"
          >
            ← Voltar ao Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}