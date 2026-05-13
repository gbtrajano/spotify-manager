# Spotify Charge Manager

Sistema de gerenciamento de cobranças para assinatura Spotify Family compartilhada.

## Tecnologias

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Backend**: Supabase (Auth + Database)
- **Hospedagem**: Vercel (recomendado) ou qualquer hospedagem Node.js

## Funcionalidades

### Usuário Comum
- Login/Registro
- Criar assinaturas (1, 2 ou 3 meses)
- Ver última assinatura
- Ver histórico de assinaturas

### Administrador
- Ver todas as assinaturas
- Filtrar por status (pendente/pago)
- Marcar assinaturas como pagas
- Ver estatísticas (total, pendentes, pagos, receita)

## Configuração

### 1. Configurar Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Vá em **SQL Editor** e execute o script `supabase-setup.sql`
3. Em **Settings > API**, copie:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Criar admin

Para tornar um usuário admin:
1. Acesse o Supabase Dashboard
2. Vá em **Table Editor > users**
3. Edite o usuário e mude `role` para `admin`

### 4. Executar localmente

```bash
npm install
npm run dev
```

### 5. Deploy

```bash
npm run build
npm start
```

## Estrutura do Projeto

```
src/
├── app/
│   ├── login/       # Página de login
│   ├── register/    # Página de registro
│   ├── dashboard/   # Painel do usuário
│   └── admin/       # Painel do admin
├── lib/
│   └── supabase/    # Cliente Supabase
├── types/           # Tipos TypeScript
└── middleware.ts    # Proteção de rotas
```

## Preço

Valor por mês: **R$ 6,81**
- 1 mês = R$ 6,81
- 2 meses = R$ 13,62
- 3 meses = R$ 20,43