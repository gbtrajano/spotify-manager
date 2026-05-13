# Sistema de Cobrança Spotify - Specification

## 1. Project Overview

**Nome do Projeto:** Spotify Charge Manager
**Tipo:** Web Application (Next.js + Supabase)
**Funcionalidade Principal:** Sistema para gerenciar cobranças de assinatura Spotify Family compartilhada entre amigos, permitindo controle de pagamentos e histórico de assinaturas.
**Usuários Alvo:** Pessoa que divide Spotify Family com amigos - precisa gerenciar cobranças mensais.

---

## 2. UI/UX Specification

### Layout Structure

**Pages:**
1. `/login` - Página de login
2. `/register` - Página de registro
3. `/dashboard` - Painel do usuário (protegido)
4. `/admin` - Painel do admin (protegido, apenas admin)

**Estrutura do Dashboard:**
- Header com logo e menu
- Cards informativos (status atual, última assinatura)
- Seção de nova assinatura
- Histórico de pagamentos

**Estrutura do Admin:**
- Header com logo e menu admin
- Tabela de todas as assinaturas
- Estatísticas de pagamentos

### Visual Design

**Color Palette:**
- Background: `#0a0a0f` (dark navy)
- Surface: `#12121a` (card background)
- Surface Elevated: `#1a1a24` (hover states)
- Primary: `#1DB954` (Spotify green)
- Primary Hover: `#1ed760`
- Accent: `#535353` (secondary text)
- Text Primary: `#ffffff`
- Text Secondary: `#b3b3b3`
- Danger: `#e91429` (unpaid status)
- Success: `#1DB954` (paid status)
- Warning: `#f59b23` (pending status)
- Border: `#282828`

**Typography:**
- Font Family: `Inter, system-ui, sans-serif`
- Headings:
  - H1: 32px, font-weight 700
  - H2: 24px, font-weight 600
  - H3: 18px, font-weight 600
- Body: 16px, font-weight 400
- Small: 14px, font-weight 400
- Caption: 12px, font-weight 400

**Spacing System:**
- Base unit: 4px
- XS: 4px
- SM: 8px
- MD: 16px
- LG: 24px
- XL: 32px
- XXL: 48px

**Border Radius:**
- Small: 6px
- Medium: 8px
- Large: 12px
- Full: 9999px

### Components

**Buttons:**
- Primary: bg-green, text-black, hover scale 1.02
- Secondary: bg-transparent, border white, hover bg-white/10
- Sizes: sm (32px height), md (40px height), lg (48px height)

**Input Fields:**
- Background: #181818
- Border: 1px solid #282828
- Focus: border #1DB954
- Placeholder: #535353
- Height: 44px

**Cards:**
- Background: #12121a
- Border: 1px solid #282828
- Border radius: 12px
- Padding: 24px

**Tables:**
- Header: bg #181818
- Rows: hover bg #1a1a24
- Border: 1px solid #282828

**Status Badges:**
- Pago: bg-green/20, text-green
- Pendente: bg-yellow/20, text-yellow
- Vencido: bg-red/20, text-red

### Animations

- Page transitions: fade in 300ms ease
- Card hover: translateY(-2px) 200ms ease
- Button hover: scale(1.02) 150ms ease
- Modal: fade + scale from 0.95 to 1 200ms ease

---

## 3. Functionality Specification

### Autenticação (Supabase Auth)

**Registro:**
- Campos: email, senha, nome
- Validação: email válido, senha mínimo 6 caracteres
- Ao registrar: cria usuário na tabela `users` com role 'user'

**Login:**
- Campos: email, senha
- Retorna token de sessão
- Redireciona para dashboard

**Proteção de Rotas:**
- /dashboard → apenas usuários autenticados
- /admin → apenas usuários com role 'admin'

### Banco de Dados (Supabase)

**Tabelas:**

```sql
-- Users (extende auth.users)
users:
  - id: uuid (PK, FK auth.users)
  - email: string
  - name: string
  - role: 'user' | 'admin'
  - created_at: timestamp

-- Assinaturas
subscriptions:
  - id: uuid (PK)
  - user_id: uuid (FK users)
  - duration_months: 1 | 2 | 3
  - amount: decimal (R$ 25/mês = 25, 50, 75)
  - status: 'pending' | 'paid' | 'overdue'
  - start_date: date
  - end_date: date
  - created_at: timestamp
  - paid_at: timestamp (nullable)
```

### Funcionalidades Usuário

**1. Dashboard:**
- Ver última assinatura (data, valor, status)
- Criar nova assinatura (escolher 1, 2 ou 3 meses)
- Ver histórico de assinaturas

**2. Criar Assinatura:**
- Selecionar duração (1, 2 ou 3 meses)
- Valor fixo: R$ 25/mês
- Status inicial: pending
- Datas: start_date = hoje, end_date = hoje + meses

**3. Histórico:**
- Lista de todas as assinaturas do usuário
- Mostrar: data, duração, valor, status, data pagamento

### Funcionalidades Admin

**1. Painel Admin:**
- Ver todas as assinaturas de todos os usuários
- Estatísticas: total pendentes, total pagos, receita total

**2. Lista de Assinaturas:**
- Tabela com: usuário, email, duração, valor, status, datas
- Ordenar por data
- Filtrar por status

**3. Atualizar Status:**
- Botão para marcar como "paid"
- Registra data de pagamento

---

## 4. Acceptance Criteria

### Auth
- [ ] Usuário consegue se registrar com email/senha
- [ ] Usuário consegue fazer login
- [ ] Usuário não autenticado não acessa dashboard
- [ ] Apenas admin acessa /admin

### Usuário
- [ ] Usuário visualiza última assinatura no dashboard
- [ ] Usuário consegue criar assinatura de 1, 2 ou 3 meses
- [ ] Usuário visualiza histórico de assinaturas
- [ ] Nova assinatura aparece no histórico

### Admin
- [ ] Admin visualiza todas as assinaturas
- [ ] Admin consegue marcar assinatura como paga
- [ ] Admin vê estatísticas de receita

### Visual
- [ ] Tema escuro como Spotify
- [ ] Cores verde Spotify para ações principais
- [ ] Layout responsivo (mobile e desktop)
- [ ] Animações suaves em interações