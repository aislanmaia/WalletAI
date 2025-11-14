# Guia da API para Frontend React

Este documento fornece uma referência completa da API REST para desenvolvedores React/TypeScript.

## 📋 Índice

1. [Configuração Base](#configuração-base)
2. [Autenticação](#autenticação)
3. [Tipos TypeScript](#tipos-typescript)
4. [Endpoints de Autenticação](#endpoints-de-autenticação)
5. [Endpoints de Usuários](#endpoints-de-usuários)
6. [Endpoints de Organizações](#endpoints-de-organizações)
7. [Endpoints de Memberships](#endpoints-de-memberships)
8. [Endpoints de Transações](#endpoints-de-transações)
9. [Endpoints de Cartões de Crédito](#endpoints-de-cartões-de-crédito)
10. [Endpoints de Chat/AI](#endpoints-de-chatai)
11. [Tratamento de Erros](#tratamento-de-erros)
12. [Exemplos de Uso](#exemplos-de-uso)

---

## 🔧 Configuração Base

### Base URL

```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
```

### Headers Padrão

Todos os endpoints (exceto login e registro público) requerem o header de autenticação:

```typescript
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
};
```

### Cliente HTTP Recomendado

```typescript
// api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token automaticamente
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros de autenticação
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## 🔐 Autenticação

### Armazenamento do Token

Após o login bem-sucedido, armazene o token:

```typescript
// Após login
localStorage.setItem('auth_token', response.data.token);
```

### Verificação de Autenticação

```typescript
const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('auth_token');
};
```

---

## 📝 Tipos TypeScript

Crie um arquivo `types/api.ts` com todos os tipos:

```typescript
// types/api.ts

// ===== AUTENTICAÇÃO =====
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user_id: string;
  email: string;
  role: 'owner' | 'member';
  subscription: {
    plan: 'free' | 'beta' | 'premium';
    max_organizations: number;
    max_users_per_org: number;
    status: 'active' | 'inactive';
  };
}

export interface User {
  id: string;
  email: string;
  role: 'owner' | 'member';
  created_at: string;
  subscription?: {
    plan: 'free' | 'beta' | 'premium';
    status: 'active' | 'inactive';
    max_organizations: number;
    max_users_per_org: number;
    features: string[];
  };
}

// ===== ORGANIZAÇÕES =====
export interface CreateOrganizationRequest {
  name: string;
  description?: string | null;
}

export interface Organization {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface CreateOrganizationResponse {
  organization: Organization;
  membership: {
    id: string;
    user_id: string;
    organization_id: string;
    role: 'owner' | 'member';
    created_at: string;
  };
}

export interface OrganizationWithMembership {
  organization: Organization;
  membership: {
    id: string;
    role: 'owner' | 'member';
    created_at: string;
  };
}

export interface MyOrganizationsResponse {
  total: number;
  organizations: OrganizationWithMembership[];
}

// ===== MEMBERSHIPS =====
export interface Membership {
  membership_id: string;
  user_id: string;
  role: 'owner' | 'member';
  created_at: string;
}

export interface OrganizationMembersResponse {
  organization: {
    id: string;
    name: string;
  };
  total_members: number;
  members: Membership[];
}

// ===== USUÁRIOS =====
export interface RegisterOwnerRequest {
  email: string;
  password: string;
  plan?: 'free' | 'beta' | 'premium';
}

export interface RegisterOwnerResponse {
  id: string;
  email: string;
  role: 'owner';
  created_at: string;
  subscription: {
    plan: 'free' | 'beta' | 'premium';
    status: 'active';
    max_organizations: number;
    max_users_per_org: number;
  };
}

export interface RegisterMemberRequest {
  email: string;
  password: string;
  organization_id: string;
}

export interface RegisterMemberResponse {
  user: {
    id: string;
    email: string;
    role: 'member';
    created_at: string;
  };
  membership: {
    id: string;
    organization_id: string;
    role: 'member';
    created_at: string;
  };
}

// ===== TRANSAÇÕES =====
export interface CreateTransactionRequest {
  organization_id: string;
  type: 'income' | 'expense';
  description: string;
  category: string;
  value: number; // Decimal como number
  payment_method: string;
  date: string; // ISO date string (YYYY-MM-DD)
  // Campos opcionais para cartão de crédito
  card_last4?: string | null;
  modality?: 'cash' | 'installment' | null;
  installments_count?: number | null;
}

export interface Transaction {
  id: number;
  organization_id: string;
  type: 'income' | 'expense';
  description: string;
  category: string;
  value: number;
  payment_method: string;
  date: string; // ISO date string
}

export interface ListTransactionsQuery {
  type?: 'income' | 'expense';
  category?: string;
  payment_method?: string;
  description?: string;
  date_start?: string; // ISO date string
  date_end?: string; // ISO date string
  value_min?: number;
  value_max?: number;
}

// ===== CARTÕES DE CRÉDITO =====
export interface CreateCreditCardRequest {
  organization_id: string;
  last4: string; // 4 dígitos
  brand: string; // Ex: "Visa", "Mastercard"
  due_day: number; // 1-31
  description?: string | null;
}

export interface CreditCard {
  id: number;
  organization_id: string;
  last4: string;
  brand: string;
  due_day: number;
  description: string | null;
}

// ===== CHAT/AI =====
export interface ChatRequest {
  message: string;
  session_id?: string | null;
}

export interface TransactionDetails {
  type: string;
  description: string;
  value: number;
  category: string;
  payment_method: string;
  date: string;
  transaction_id?: number | null;
}

export interface TransactionCreatedResult {
  action: 'transaction_created';
  message: string;
  details: TransactionDetails;
  transaction_id: number;
}

export interface GeneralChatResult {
  action: 'general_response';
  message: string;
  content: string;
}

export type ChatResult = TransactionCreatedResult | GeneralChatResult;

export interface ChatResponse {
  result: ChatResult;
  confidence: number; // 0.0 - 1.0
  processing_time: number; // segundos
}

// ===== ERROS =====
export interface ApiError {
  detail: string;
  status?: number;
}
```

---

## 🔑 Endpoints de Autenticação

### POST `/api/auth/login`

Autentica um usuário e retorna o token JWT.

**Request:**
```typescript
const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('/api/auth/login', {
    email,
    password,
  });
  
  // Armazenar token
  localStorage.setItem('auth_token', response.data.token);
  
  return response.data;
};
```

**Response (200):**
```typescript
{
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  user_id: "123e4567-e89b-12d3-a456-426614174000",
  email: "owner@example.com",
  role: "owner",
  subscription: {
    plan: "beta",
    max_organizations: 5,
    max_users_per_org: 10,
    status: "active"
  }
}
```

**Erros:**
- `401`: Email ou senha inválidos

---

### GET `/api/auth/me`

Retorna informações do usuário autenticado.

**Request:**
```typescript
const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<User>('/api/auth/me');
  return response.data;
};
```

**Response (200):**
```typescript
{
  id: "123e4567-e89b-12d3-a456-426614174000",
  email: "owner@example.com",
  role: "owner",
  created_at: "2025-01-09T10:00:00",
  subscription: {
    plan: "beta",
    status: "active",
    max_organizations: 5,
    max_users_per_org: 10,
    features: ["multi_org", "custom_categories", "advanced_reports"]
  }
}
```

**Erros:**
- `401`: Token inválido ou expirado

---

## 👥 Endpoints de Usuários

### POST `/api/users/register/owner`

Registra um novo usuário owner (público, não requer autenticação).

**Request:**
```typescript
const registerOwner = async (
  email: string,
  password: string,
  plan: 'free' | 'beta' | 'premium' = 'free'
): Promise<RegisterOwnerResponse> => {
  const response = await apiClient.post<RegisterOwnerResponse>(
    '/api/users/register/owner',
    { email, password, plan }
  );
  return response.data;
};
```

**Response (201):**
```typescript
{
  id: "123e4567-e89b-12d3-a456-426614174000",
  email: "owner@example.com",
  role: "owner",
  created_at: "2025-01-09T10:00:00",
  subscription: {
    plan: "beta",
    status: "active",
    max_organizations: 5,
    max_users_per_org: 10
  }
}
```

**Erros:**
- `400`: Email já existe ou dados inválidos

---

### POST `/api/users/register/member`

Registra um novo membro em uma organização (apenas owners).

**Request:**
```typescript
const registerMember = async (
  email: string,
  password: string,
  organizationId: string
): Promise<RegisterMemberResponse> => {
  const response = await apiClient.post<RegisterMemberResponse>(
    '/api/users/register/member',
    {
      email,
      password,
      organization_id: organizationId,
    }
  );
  return response.data;
};
```

**Response (201):**
```typescript
{
  user: {
    id: "123e4567-e89b-12d3-a456-426614174000",
    email: "member@example.com",
    role: "member",
    created_at: "2025-01-09T10:00:00"
  },
  membership: {
    id: "456e7890-e89b-12d3-a456-426614174000",
    organization_id: "789e0123-e89b-12d3-a456-426614174000",
    role: "member",
    created_at: "2025-01-09T10:00:00"
  }
}
```

**Erros:**
- `400`: Email já existe, organização não encontrada, ou limite de usuários excedido
- `403`: Usuário não é owner

---

### GET `/api/users/me`

Retorna o perfil do usuário autenticado (mesmo que `/api/auth/me`).

**Request:**
```typescript
const getMyProfile = async (): Promise<User> => {
  const response = await apiClient.get<User>('/api/users/me');
  return response.data;
};
```

---

## 🏢 Endpoints de Organizações

### POST `/api/organizations`

Cria uma nova organização (apenas owners).

**Request:**
```typescript
const createOrganization = async (
  name: string,
  description?: string
): Promise<CreateOrganizationResponse> => {
  const response = await apiClient.post<CreateOrganizationResponse>(
    '/api/organizations',
    { name, description }
  );
  return response.data;
};
```

**Response (201):**
```typescript
{
  organization: {
    id: "123e4567-e89b-12d3-a456-426614174000",
    name: "Minha Empresa",
    description: "Descrição da empresa",
    created_at: "2025-01-09T10:00:00"
  },
  membership: {
    id: "456e7890-e89b-12d3-a456-426614174000",
    user_id: "789e0123-e89b-12d3-a456-426614174000",
    organization_id: "123e4567-e89b-12d3-a456-426614174000",
    role: "owner",
    created_at: "2025-01-09T10:00:00"
  }
}
```

**Erros:**
- `400`: Dados inválidos ou limite de organizações excedido
- `403`: Usuário não é owner

---

## 👥 Endpoints de Memberships

### GET `/api/memberships/my-organizations`

Lista todas as organizações onde o usuário tem membership.

**Request:**
```typescript
const getMyOrganizations = async (): Promise<MyOrganizationsResponse> => {
  const response = await apiClient.get<MyOrganizationsResponse>(
    '/api/memberships/my-organizations'
  );
  return response.data;
};
```

**Response (200):**
```typescript
{
  total: 2,
  organizations: [
    {
      organization: {
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "Minha Empresa",
        created_at: "2025-01-09T10:00:00"
      },
      membership: {
        id: "456e7890-e89b-12d3-a456-426614174000",
        role: "owner",
        created_at: "2025-01-09T10:00:00"
      }
    }
  ]
}
```

---

### GET `/api/memberships/organizations/{org_id}/members`

Lista todos os membros de uma organização.

**Request:**
```typescript
const getOrganizationMembers = async (
  organizationId: string
): Promise<OrganizationMembersResponse> => {
  const response = await apiClient.get<OrganizationMembersResponse>(
    `/api/memberships/organizations/${organizationId}/members`
  );
  return response.data;
};
```

**Response (200):**
```typescript
{
  organization: {
    id: "123e4567-e89b-12d3-a456-426614174000",
    name: "Minha Empresa"
  },
  total_members: 3,
  members: [
    {
      membership_id: "456e7890-e89b-12d3-a456-426614174000",
      user_id: "789e0123-e89b-12d3-a456-426614174000",
      role: "owner",
      created_at: "2025-01-09T10:00:00"
    }
  ]
}
```

**Erros:**
- `403`: Usuário não tem acesso à organização
- `404`: Organização não encontrada

---

### DELETE `/api/memberships/organizations/{org_id}/members/{user_id}`

Remove um membro de uma organização (apenas owners).

**Request:**
```typescript
const removeMember = async (
  organizationId: string,
  userId: string
): Promise<void> => {
  await apiClient.delete(
    `/api/memberships/organizations/${organizationId}/members/${userId}`
  );
};
```

**Response (204):** Sem conteúdo

**Erros:**
- `400`: Tentativa de remover a si mesmo
- `403`: Usuário não é owner
- `404`: Membro ou organização não encontrado

---

## 💰 Endpoints de Transações

### POST `/api/v1/transactions`

Cria uma nova transação.

**Request:**
```typescript
const createTransaction = async (
  transaction: CreateTransactionRequest
): Promise<Transaction> => {
  const response = await apiClient.post<Transaction>(
    '/api/v1/transactions',
    transaction
  );
  return response.data;
};
```

**Exemplo - Transação Simples:**
```typescript
await createTransaction({
  organization_id: "123e4567-e89b-12d3-a456-426614174000",
  type: "expense",
  description: "Compra no supermercado",
  category: "Alimentação",
  value: 150.50,
  payment_method: "PIX",
  date: "2025-01-15",
});
```

**Exemplo - Transação com Cartão à Vista:**
```typescript
await createTransaction({
  organization_id: "123e4567-e89b-12d3-a456-426614174000",
  type: "expense",
  description: "Compra na loja",
  category: "Compras",
  value: 500.00,
  payment_method: "Cartão de Crédito",
  date: "2025-01-15",
  card_last4: "1234",
  modality: "cash",
});
```

**Exemplo - Transação Parcelada:**
```typescript
await createTransaction({
  organization_id: "123e4567-e89b-12d3-a456-426614174000",
  type: "expense",
  description: "Compra parcelada",
  category: "Eletrônicos",
  value: 2000.00,
  payment_method: "Cartão de Crédito",
  date: "2025-01-15",
  card_last4: "1234",
  modality: "installment",
  installments_count: 10,
});
```

**Response (201):**
```typescript
{
  id: 1,
  organization_id: "123e4567-e89b-12d3-a456-426614174000",
  type: "expense",
  description: "Compra no supermercado",
  category: "Alimentação",
  value: 150.50,
  payment_method: "PIX",
  date: "2025-01-15"
}
```

**Erros:**
- `400`: Dados inválidos ou cartão não encontrado
- `403`: Usuário não tem acesso à organização
- `404`: Cartão de crédito não encontrado (quando usando cartão)
- `422`: Erro de validação ou regra de negócio

---

### GET `/api/v1/transactions`

Lista transações com filtros opcionais. Retorna todas as transações das organizações onde o usuário tem membership.

**Nota**: Atualmente, o endpoint retorna transações de todas as organizações do usuário. Para filtrar por organização específica, use os filtros de categoria, tipo, etc. ou filtre no frontend.

**Request:**
```typescript
const listTransactions = async (
  filters?: {
    type?: 'income' | 'expense';
    category?: string;
    payment_method?: string;
    description?: string;
    date_start?: string; // ISO date string (YYYY-MM-DD)
    date_end?: string; // ISO date string (YYYY-MM-DD)
    value_min?: number;
    value_max?: number;
  }
): Promise<Transaction[]> => {
  const response = await apiClient.get<Transaction[]>(
    '/api/v1/transactions',
    { params: filters }
  );
  return response.data;
};
```

**Exemplos de Uso:**
```typescript
// Listar todas as transações do usuário (todas as organizações)
await listTransactions();

// Filtrar por tipo
await listTransactions({ type: 'expense' });

// Filtrar por categoria
await listTransactions({ category: 'Alimentação' });

// Filtrar por período
await listTransactions({
  date_start: '2025-01-01',
  date_end: '2025-01-31',
});

// Filtrar por valor
await listTransactions({
  value_min: 100,
  value_max: 1000,
});

// Múltiplos filtros
await listTransactions({
  type: 'expense',
  category: 'Alimentação',
  date_start: '2025-01-01',
  date_end: '2025-01-31',
  value_min: 50,
});

// Filtrar no frontend por organização específica
const allTransactions = await listTransactions();
const orgTransactions = allTransactions.filter(
  (tx) => tx.organization_id === organizationId
);
```

**Response (200):**
```typescript
[
  {
    id: 1,
    organization_id: "123e4567-e89b-12d3-a456-426614174000",
    type: "expense",
    description: "Compra no supermercado",
    category: "Alimentação",
    value: 150.50,
    payment_method: "PIX",
    date: "2025-01-15"
  }
]
```

---

## 💳 Endpoints de Cartões de Crédito

### POST `/credit-cards`

Cria um novo cartão de crédito.

**Request:**
```typescript
const createCreditCard = async (
  card: CreateCreditCardRequest
): Promise<CreditCard> => {
  const response = await apiClient.post<CreditCard>(
    '/credit-cards',
    card
  );
  return response.data;
};
```

**Exemplo:**
```typescript
await createCreditCard({
  organization_id: "123e4567-e89b-12d3-a456-426614174000",
  last4: "1234",
  brand: "Visa",
  due_day: 10,
  description: "Cartão principal",
});
```

**Response (201):**
```typescript
{
  id: 1,
  organization_id: "123e4567-e89b-12d3-a456-426614174000",
  last4: "1234",
  brand: "Visa",
  due_day: 10,
  description: "Cartão principal"
}
```

**Erros:**
- `400`: Dados inválidos
- `403`: Usuário não tem acesso à organização
- `422`: Cartão duplicado (mesmo last4 e brand na mesma organização)

---

### GET `/credit-cards`

Lista todos os cartões de uma organização.

**Request:**
```typescript
const listCreditCards = async (
  organizationId: string
): Promise<CreditCard[]> => {
  const response = await apiClient.get<CreditCard[]>('/credit-cards', {
    params: { organization_id: organizationId },
  });
  return response.data;
};
```

**Response (200):**
```typescript
[
  {
    id: 1,
    organization_id: "123e4567-e89b-12d3-a456-426614174000",
    last4: "1234",
    brand: "Visa",
    due_day: 10,
    description: "Cartão principal"
  }
]
```

---

### GET `/credit-cards/{card_id}`

Obtém um cartão específico.

**Request:**
```typescript
const getCreditCard = async (
  cardId: number,
  organizationId: string
): Promise<CreditCard> => {
  const response = await apiClient.get<CreditCard>(
    `/credit-cards/${cardId}`,
    {
      params: { organization_id: organizationId },
    }
  );
  return response.data;
};
```

**Erros:**
- `403`: Usuário não tem acesso à organização
- `404`: Cartão não encontrado

---

### DELETE `/credit-cards/{card_id}`

Deleta um cartão de crédito.

**Request:**
```typescript
const deleteCreditCard = async (
  cardId: number,
  organizationId: string
): Promise<void> => {
  await apiClient.delete(`/credit-cards/${cardId}`, {
    params: { organization_id: organizationId },
  });
};
```

**Response (204):** Sem conteúdo

**Erros:**
- `403`: Usuário não tem acesso à organização
- `404`: Cartão não encontrado

---

## 🤖 Endpoints de Chat/AI

### POST `/api/v1/ai/chat`

Envia uma mensagem para o assistente financeiro de IA.

**Request:**
```typescript
const sendChatMessage = async (
  message: string,
  sessionId?: string
): Promise<ChatResponse> => {
  const response = await apiClient.post<ChatResponse>(
    '/api/v1/ai/chat',
    {
      message,
      session_id: sessionId,
    }
  );
  return response.data;
};
```

**Exemplo:**
```typescript
const response = await sendChatMessage(
  "Registre uma despesa de R$ 50,00 em Alimentação hoje",
  "session-123"
);

// Verificar tipo de resposta
if (response.result.action === 'transaction_created') {
  console.log('Transação criada:', response.result.transaction_id);
  console.log('Detalhes:', response.result.details);
} else if (response.result.action === 'general_response') {
  console.log('Resposta geral:', response.result.content);
}
```

**Response (200):**
```typescript
{
  result: {
    action: "transaction_created",
    message: "Transação registrada com sucesso",
    details: {
      type: "expense",
      description: "Compra no supermercado",
      value: 50.00,
      category: "Alimentação",
      payment_method: "PIX",
      date: "2025-01-15",
      transaction_id: 123
    },
    transaction_id: 123
  },
  confidence: 0.95,
  processing_time: 1.2
}
```

**Erros:**
- `502`: Erro do provedor de IA
- `500`: Erro interno do servidor

---

## ⚠️ Tratamento de Erros

### Estrutura de Erro Padrão

Todos os erros seguem este formato:

```typescript
{
  detail: "Mensagem de erro descritiva"
}
```

### Códigos de Status HTTP

- `200`: Sucesso
- `201`: Criado com sucesso
- `204`: Sucesso sem conteúdo
- `400`: Requisição inválida (dados inválidos, validação)
- `401`: Não autenticado (token inválido ou ausente)
- `403`: Não autorizado (sem permissão)
- `404`: Recurso não encontrado
- `422`: Erro de validação ou regra de negócio
- `500`: Erro interno do servidor
- `502`: Erro do provedor de IA

### Função de Tratamento de Erros

```typescript
// utils/errorHandler.ts
import { AxiosError } from 'axios';
import { ApiError } from '../types/api';

export const handleApiError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiError;
    return apiError?.detail || error.message || 'Erro desconhecido';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'Erro desconhecido';
};

// Uso em componentes
try {
  await createTransaction(data);
} catch (error) {
  const errorMessage = handleApiError(error);
  setError(errorMessage);
}
```

---

## 📚 Exemplos de Uso

### Hook Customizado para Autenticação

```typescript
// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { login, getCurrentUser, LoginResponse, User } from '../api/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        // Não autenticado
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const signIn = async (email: string, password: string) => {
    const response = await login(email, password);
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    return response;
  };

  const signOut = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  return {
    user,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!user,
  };
};
```

### Hook para Organizações

```typescript
// hooks/useOrganizations.ts
import { useState, useEffect } from 'react';
import { getMyOrganizations, MyOrganizationsResponse } from '../api/organizations';

export const useOrganizations = () => {
  const [organizations, setOrganizations] = useState<MyOrganizationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        setLoading(true);
        const data = await getMyOrganizations();
        setOrganizations(data);
        setError(null);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    };

    loadOrganizations();
  }, []);

  return { organizations, loading, error };
};
```

### Componente de Listagem de Transações

```typescript
// components/TransactionList.tsx
import { useState, useEffect } from 'react';
import { listTransactions, Transaction } from '../api/transactions';
import { handleApiError } from '../utils/errorHandler';

interface TransactionListProps {
  organizationId: string;
}

export const TransactionList: React.FC<TransactionListProps> = ({ organizationId }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    type: undefined as 'income' | 'expense' | undefined,
    category: undefined as string | undefined,
  });

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true);
        // Buscar todas as transações e filtrar por organização no frontend
        const allTransactions = await listTransactions(filters);
        const orgTransactions = allTransactions.filter(
          (tx) => tx.organization_id === organizationId
        );
        setTransactions(orgTransactions);
        setError(null);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [organizationId, filters]);

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div>
      <h2>Transações</h2>
      <div>
        <select
          value={filters.type || ''}
          onChange={(e) =>
            setFilters({ ...filters, type: e.target.value as 'income' | 'expense' | undefined })
          }
        >
          <option value="">Todos os tipos</option>
          <option value="income">Receita</option>
          <option value="expense">Despesa</option>
        </select>
      </div>
      <ul>
        {transactions.map((tx) => (
          <li key={tx.id}>
            {tx.description} - R$ {tx.value.toFixed(2)} ({tx.category})
          </li>
        ))}
      </ul>
    </div>
  );
};
```

---

## 🔗 Links Úteis

- **Swagger/OpenAPI**: Acesse `http://localhost:8000/docs` para documentação interativa
- **Health Check**: `GET /health` - Verifica se a API está online
- **Ping**: `GET /ping` - Endpoint simples de teste

---

## 📝 Notas Importantes

1. **Multi-tenancy**: Todos os endpoints (exceto auth e registro público) requerem `organization_id` explícito
2. **Autenticação**: Token JWT deve ser incluído em todos os headers (exceto login/registro)
3. **Validação**: A API valida automaticamente os dados e retorna erros descritivos
4. **Datas**: Use formato ISO (YYYY-MM-DD) para campos de data
5. **Valores**: Use números (não strings) para valores monetários
6. **UUIDs**: Todos os IDs de organização e usuário são UUIDs (strings)

---

**Última atualização**: Janeiro 2025

