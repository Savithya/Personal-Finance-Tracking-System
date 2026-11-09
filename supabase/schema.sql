-- ====================================================================
-- FINORA AI - Supabase PostgreSQL Schema & Security Architecture
-- High-Performance Personal Finance Management System
-- ====================================================================

-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. User Profiles
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  currency text default 'INR',
  currency_symbol text default '₹',
  theme text default 'dark',
  monthly_savings_target numeric(12,2) default 15000.00,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 3. Wallets / Accounts
create table if not exists public.accounts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  type text not null check (type in ('cash', 'bank', 'digital', 'credit', 'investment')),
  balance numeric(12,2) default 0.00 not null,
  currency text default 'INR' not null,
  color text default '#6366F1',
  icon text default 'wallet',
  account_number_last4 text,
  is_default boolean default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 4. Categories
create table if not exists public.categories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade, -- null means global system default category
  name text not null,
  type text not null check (type in ('income', 'expense')),
  icon text default 'tag',
  color text default '#6366F1',
  is_custom boolean default false,
  created_at timestamptz default now() not null
);

-- 5. Transactions
create table if not exists public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  account_id uuid references public.accounts on delete cascade not null,
  to_account_id uuid references public.accounts on delete set null, -- used exclusively for wallet transfers
  category_id uuid references public.categories on delete set null,
  type text not null check (type in ('income', 'expense', 'transfer')),
  amount numeric(12,2) not null check (amount > 0),
  date date default current_date not null,
  payment_method text default 'bank_transfer',
  description text not null,
  notes text,
  is_recurring boolean default false,
  recurring_id uuid,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 6. Budgets
create table if not exists public.budgets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  category_id uuid references public.categories on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  month integer not null check (month between 1 and 12),
  year integer not null check (year between 2000 and 2100),
  alert_threshold_pct integer default 80 check (alert_threshold_pct between 50 and 100),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique (user_id, category_id, month, year)
);

-- 7. Savings Goals
create table if not exists public.savings_goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  target_amount numeric(12,2) not null check (target_amount > 0),
  current_amount numeric(12,2) default 0.00 not null check (current_amount >= 0),
  target_date date not null,
  description text,
  color text default '#10B981',
  icon text default 'target',
  is_achieved boolean default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 8. Savings Contributions
create table if not exists public.savings_contributions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  goal_id uuid references public.savings_goals on delete cascade not null,
  account_id uuid references public.accounts on delete set null,
  amount numeric(12,2) not null check (amount > 0),
  date date default current_date not null,
  notes text,
  created_at timestamptz default now() not null
);

-- 9. Recurring Transactions
create table if not exists public.recurring_transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  account_id uuid references public.accounts on delete cascade not null,
  category_id uuid references public.categories on delete set null,
  type text not null check (type in ('income', 'expense', 'transfer')),
  amount numeric(12,2) not null check (amount > 0),
  frequency text not null check (frequency in ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly')),
  start_date date not null,
  next_due_date date not null,
  end_date date,
  description text not null,
  is_active boolean default true,
  auto_log boolean default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 10. Notifications
create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  message text not null,
  type text not null check (type in ('alert', 'warning', 'info', 'success', 'achievement')),
  is_read boolean default false,
  link text,
  created_at timestamptz default now() not null
);

-- 11. AI Conversations
create table if not exists public.ai_conversations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text default 'Financial Analysis Session' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 12. AI Messages
create table if not exists public.ai_messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.ai_conversations on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null
);

-- 13. AI Financial Insights
create table if not exists public.ai_insights (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  category text not null check (category in ('spending', 'budget', 'savings', 'forecasting', 'anomaly', 'overview')),
  priority text not null check (priority in ('high', 'medium', 'low')),
  explanation text not null,
  supporting_metrics jsonb default '{}'::jsonb,
  suggested_action text not null,
  date_range text not null,
  is_dismissed boolean default false,
  created_at timestamptz default now() not null
);

-- ====================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ====================================================================
create index if not exists idx_accounts_user on public.accounts(user_id);
create index if not exists idx_transactions_user_date on public.transactions(user_id, date desc);
create index if not exists idx_transactions_account on public.transactions(account_id);
create index if not exists idx_transactions_category on public.transactions(category_id);
create index if not exists idx_transactions_type on public.transactions(type);
create index if not exists idx_budgets_user_period on public.budgets(user_id, year, month);
create index if not exists idx_savings_goals_user on public.savings_goals(user_id);
create index if not exists idx_savings_contributions_goal on public.savings_contributions(goal_id);
create index if not exists idx_recurring_user on public.recurring_transactions(user_id);
create index if not exists idx_notifications_user on public.notifications(user_id, is_read);
create index if not exists idx_ai_messages_conv on public.ai_messages(conversation_id, created_at asc);
create index if not exists idx_ai_insights_user on public.ai_insights(user_id, priority, created_at desc);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict Isolation: Each user can only access their own financial records
-- ====================================================================
alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.savings_goals enable row level security;
alter table public.savings_contributions enable row level security;
alter table public.recurring_transactions enable row level security;
alter table public.notifications enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.ai_insights enable row level security;

-- Profiles Policy
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Accounts Policy
create policy "Users can CRUD own accounts" on public.accounts
  for all using (auth.uid() = user_id);

-- Categories Policy (view default global categories or own custom categories)
create policy "Users can view categories" on public.categories
  for select using (user_id is null or auth.uid() = user_id);
create policy "Users can insert own categories" on public.categories
  for insert with check (auth.uid() = user_id);
create policy "Users can update own categories" on public.categories
  for update using (auth.uid() = user_id);
create policy "Users can delete own categories" on public.categories
  for delete using (auth.uid() = user_id);

-- Transactions Policy
create policy "Users can CRUD own transactions" on public.transactions
  for all using (auth.uid() = user_id);

-- Budgets Policy
create policy "Users can CRUD own budgets" on public.budgets
  for all using (auth.uid() = user_id);

-- Savings Goals Policy
create policy "Users can CRUD own savings goals" on public.savings_goals
  for all using (auth.uid() = user_id);

-- Savings Contributions Policy
create policy "Users can CRUD own savings contributions" on public.savings_contributions
  for all using (auth.uid() = user_id);

-- Recurring Transactions Policy
create policy "Users can CRUD own recurring transactions" on public.recurring_transactions
  for all using (auth.uid() = user_id);

-- Notifications Policy
create policy "Users can CRUD own notifications" on public.notifications
  for all using (auth.uid() = user_id);

-- AI Conversations & Messages Policy
create policy "Users can CRUD own AI conversations" on public.ai_conversations
  for all using (auth.uid() = user_id);
create policy "Users can CRUD own AI messages" on public.ai_messages
  for all using (auth.uid() = user_id);

-- AI Insights Policy
create policy "Users can CRUD own AI insights" on public.ai_insights
  for all using (auth.uid() = user_id);

-- ====================================================================
-- SEED DEFAULT CATEGORIES
-- ====================================================================
insert into public.categories (id, user_id, name, type, icon, color, is_custom) values
  ('c1000000-0000-0000-0000-000000000001', null, 'Salary', 'income', 'briefcase', '#10B981', false),
  ('c1000000-0000-0000-0000-000000000002', null, 'Freelance', 'income', 'laptop', '#06B6D4', false),
  ('c1000000-0000-0000-0000-000000000003', null, 'Business', 'income', 'trending-up', '#8B5CF6', false),
  ('c1000000-0000-0000-0000-000000000004', null, 'Investments', 'income', 'pie-chart', '#3B82F6', false),
  ('c1000000-0000-0000-0000-000000000005', null, 'Other Income', 'income', 'plus-circle', '#64748B', false),
  ('c2000000-0000-0000-0000-000000000001', null, 'Food & Dining', 'expense', 'utensils', '#F97316', false),
  ('c2000000-0000-0000-0000-000000000002', null, 'Transport', 'expense', 'car', '#3B82F6', false),
  ('c2000000-0000-0000-0000-000000000003', null, 'Shopping', 'expense', 'shopping-bag', '#EC4899', false),
  ('c2000000-0000-0000-0000-000000000004', null, 'Education', 'expense', 'book-open', '#8B5CF6', false),
  ('c2000000-0000-0000-0000-000000000005', null, 'Healthcare', 'expense', 'heart-pulse', '#EF4444', false),
  ('c2000000-0000-0000-0000-000000000006', null, 'Bills & Utilities', 'expense', 'zap', '#F59E0B', false),
  ('c2000000-0000-0000-0000-000000000007', null, 'Entertainment', 'expense', 'film', '#A855F7', false),
  ('c2000000-0000-0000-0000-000000000008', null, 'Housing & Rent', 'expense', 'home', '#14B8A6', false),
  ('c2000000-0000-0000-0000-000000000009', null, 'Other Expenses', 'expense', 'more-horizontal', '#6B7280', false)
on conflict do nothing;
