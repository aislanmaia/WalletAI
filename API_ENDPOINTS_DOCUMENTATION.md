# Planejamento: Servidor Web para Sistema de Finanças Pessoais

## Visão Geral

Este documento define a especificação de uma **API REST** que será implementada como uma nova camada do sistema de finanças pessoais baseado em agentes de IA. O servidor web será desenvolvido em **Python** e servirá como interface entre o frontend e os agentes inteligentes existentes.

**Objetivo:** Criar uma API que exponha as funcionalidades dos agentes Agno através de endpoints HTTP, permitindo integração com interfaces web, mobile ou outros sistemas.

---

## 🏗️ Arquitetura Proposta

### Camadas do Sistema
1. **Frontend** (já implementado) - Interface de usuário
2. **API REST** (a ser implementada) - Servidor web Python
3. **Agentes Agno** (já implementado o básico) - Lógica de negócio e IA
4. **Banco de Dados** (a ser definido) - Persistência de dados

### Tecnologias Recomendadas
- **Framework Web:** FastAPI (recomendado) ou Flask
- **Autenticação:** JWT tokens
- **Validação:** Pydantic models
- **Documentação:** OpenAPI/Swagger automática
- **Testes:** pytest + httpx

---

## 📋 Especificação dos Endpoints

### Base URL
```
http://localhost:8000/api/v1
```

### Headers Padrão
```
Content-Type: application/json
Authorization: Bearer <token>  # Exceto para endpoints de auth
```

---

## 🔐 Autenticação

### POST /api/v1/auth/login
**Descrição:** Autentica um usuário e retorna token de acesso.

**Request:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "access_token": "string",
  "refresh_token": "string",
  "token_type": "bearer",
  "expires_in": 3600
}
```

### POST /api/v1/auth/register
**Descrição:** Registra um novo usuário no sistema.

**Request:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "full_name": "string"
}
```

**Response (201):**
```json
{
  "user_id": "uuid",
  "username": "string",
  "email": "string",
  "full_name": "string",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### POST /api/v1/auth/refresh
**Descrição:** Renova o token de acesso usando refresh token.

**Request:**
```json
{
  "refresh_token": "string"
}
```

**Response (200):**
```json
{
  "access_token": "string",
  "token_type": "bearer",
  "expires_in": 3600
}
```

### POST /api/v1/auth/logout
**Descrição:** Invalida o token atual.

**Response (200):**
```json
{
  "message": "Logout realizado com sucesso"
}
```

---

## 👤 Usuários

### GET /api/v1/users/profile
**Descrição:** Obtém o perfil do usuário autenticado.

**Response (200):**
```json
{
  "user_id": "uuid",
  "username": "string",
  "email": "string",
  "full_name": "string",
  "created_at": "2024-01-01T00:00:00Z",
  "preferences": {
    "currency": "BRL",
    "language": "pt-BR"
  }
}
```

### PUT /api/v1/users/profile
**Descrição:** Atualiza o perfil do usuário.

**Request:**
```json
{
  "full_name": "string",
  "email": "string",
  "preferences": {
    "currency": "BRL",
    "language": "pt-BR"
  }
}
```

**Response (200):**
```json
{
  "message": "Perfil atualizado com sucesso",
  "user": {
    "user_id": "uuid",
    "username": "string",
    "email": "string",
    "full_name": "string",
    "preferences": {}
  }
}
```

---

## 💰 Transações

### GET /api/v1/transactions
**Descrição:** Lista transações com filtros opcionais.

**Query Parameters:**
- `page` (int): Número da página (padrão: 1)
- `limit` (int): Itens por página (padrão: 20, máximo: 100)
- `start_date` (string): Data inicial (YYYY-MM-DD)
- `end_date` (string): Data final (YYYY-MM-DD)
- `type` (string): "income" ou "expense"
- `category` (string): Categoria da transação
- `min_value` (float): Valor mínimo
- `max_value` (float): Valor máximo
- `payment_method` (string): Método de pagamento
- `description` (string): Busca por descrição

**Response (200):**
```json
{
  "transactions": [
    {
      "id": 1,
      "type": "expense",
      "description": "Lanche no restaurante",
      "category": "alimentação",
      "value": 25.50,
      "payment_method": "cartão",
      "date": "2024-01-15"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

### POST /api/v1/transactions
**Descrição:** Cria uma nova transação (pode usar agentes Agno internamente).

**Request:**
```json
{
  "type": "expense",
  "description": "Lanche no restaurante",
  "category": "alimentação",
  "value": 25.50,
  "payment_method": "cartão",
  "date": "2024-01-15"
}
```

**Response (201):**
```json
{
  "id": 1,
  "type": "expense",
  "description": "Lanche no restaurante",
  "category": "alimentação",
  "value": 25.50,
  "payment_method": "cartão",
  "date": "2024-01-15"
}
```

### PUT /api/v1/transactions/{id}
**Descrição:** Atualiza uma transação existente.

**Request:**
```json
{
  "type": "expense",
  "description": "Lanche no restaurante",
  "category": "alimentação",
  "value": 25.50,
  "payment_method": "cartão",
  "date": "2024-01-15"
}
```

**Response (200):**
```json
{
  "id": 1,
  "type": "expense",
  "description": "Lanche no restaurante",
  "category": "alimentação",
  "value": 25.50,
  "payment_method": "cartão",
  "date": "2024-01-15"
}
```

### DELETE /api/v1/transactions/{id}
**Descrição:** Remove uma transação.

**Response (200):**
```json
{
  "message": "Transação removida com sucesso"
}
```

---

## 📊 Análises e Métricas

### GET /api/v1/analytics/summary
**Descrição:** Obtém resumo financeiro (usando agentes Agno para cálculos).

**Query Parameters:**
- `start_date` (string): Data inicial (YYYY-MM-DD)
- `end_date` (string): Data final (YYYY-MM-DD)

**Response (200):**
```json
{
  "period": {
    "start_date": "2024-01-01",
    "end_date": "2024-01-31"
  },
  "summary": {
    "total_income": 5000.00,
    "total_expenses": 3000.00,
    "balance": 2000.00,
    "savings_rate": 40.0
  },
  "transactions_count": {
    "income": 5,
    "expense": 12
  },
  "payment_methods": {
    "cartão": 1500.00,
    "PIX": 800.00,
    "dinheiro": 700.00
  }
}
```

### GET /api/v1/analytics/categories
**Descrição:** Análise por categorias (usando agentes Agno).

**Query Parameters:**
- `start_date` (string): Data inicial
- `end_date` (string): Data final
- `type` (string): "income" ou "expense"

**Response (200):**
```json
{
  "categories": [
    {
      "name": "alimentação",
      "value": 800.00,
      "percentage": 26.67,
      "count": 15,
      "payment_methods": {
        "cartão": 500.00,
        "PIX": 200.00,
        "dinheiro": 100.00
      }
    }
  ],
  "total": 3000.00
}
```

### GET /api/v1/analytics/trends
**Descrição:** Tendências temporais (usando agentes Agno).

**Query Parameters:**
- `period` (string): "daily", "weekly", "monthly"
- `start_date` (string): Data inicial
- `end_date` (string): Data final

**Response (200):**
```json
{
  "trends": [
    {
      "date": "2024-01-01",
      "income": 500.00,
      "expenses": 300.00,
      "balance": 200.00,
      "transactions_count": 5
    }
  ],
  "summary": {
    "trend_direction": "increasing",
    "average_daily_balance": 150.00,
    "most_used_payment_method": "cartão"
  }
}
```

---

## 🤖 IA e Processamento Natural

### POST /api/v1/ai/chat
**Descrição:** Endpoint único para interação via chat com o agente financeiro. O backend detecta automaticamente a intenção do usuário e responde adequadamente.

**Request:**
```json
{
  "message": "Gastei 50 reais com almoço hoje, paguei com cartão",
  "context": {
    "user_id": 1,
    "session_id": "session_123"
  }
}
```

**Response (200) - Registro de Transação:**
```json
{
  "result": {
    "action": "transaction_created",
    "message": "✅ Transação registrada!",
    "details": {
      "type": "Despesa",
      "description": "Almoço",
      "value": 50.00,
      "category": "alimentação",
      "payment_method": "cartão",
      "date": "2025-07-28"
    },
    "transaction_id": 1
  },
  "confidence": 0.95,
  "processing_time": 1.2
}
```

**Response (200) - Múltiplas Transações:**
```json
{
  "result": {
    "action": "multiple_transactions_created",
    "message": "Vou registrar suas três transações:",
    "transactions": [
      {
        "transaction_id": 1,
        "type": "Despesa",
        "description": "Almoço",
        "value": 50.00,
        "category": "alimentação",
        "payment_method": "dinheiro",
        "date": "2025-07-28"
      },
      {
        "transaction_id": 2,
        "type": "Despesa",
        "description": "Transporte",
        "value": 30.00,
        "category": "transporte",
        "payment_method": "dinheiro",
        "date": "2025-07-28"
      },
      {
        "transaction_id": 3,
        "type": "Despesa",
        "description": "Lanche",
        "value": 20.00,
        "category": "alimentação",
        "payment_method": "dinheiro",
        "date": "2025-07-28"
      }
    ]
  },
  "confidence": 0.90,
  "processing_time": 2.1
}
```

**Response (200) - Consulta de Transações:**
```json
{
  "result": {
    "action": "transactions_queried",
    "message": "Aqui estão seus gastos com alimentação:",
    "transactions": [
      {
        "type": "Despesa",
        "description": "Almoço",
        "value": 50.00,
        "category": "alimentação",
        "payment_method": "cartão",
        "date": "2025-07-28"
      },
      {
        "type": "Despesa",
        "description": "Comida",
        "value": 25.00,
        "category": "alimentação",
        "payment_method": "PIX",
        "date": "2025-07-27"
      }
    ],
    "summary": {
      "total": 75.00,
      "count": 2
    }
  },
  "confidence": 0.98,
  "processing_time": 0.8
}
```

**Response (200) - Análise Financeira:**
```json
{
  "result": {
    "action": "financial_analysis",
    "message": "📊 Métricas (de 01/07/2025 a 28/07/2025):",
    "metrics": {
      "total_income": 5000.00,
      "total_expenses": 105.00,
      "balance": 4895.00,
      "savings_rate": 97.9
    },
    "insights": [
      "Você está economizando 97.9% da sua renda",
      "Seus gastos estão bem controlados este mês"
    ],
    "recommendations": [
      "Continue monitorando gastos com alimentação",
      "Considere investir parte da economia"
    ]
  },
  "confidence": 0.95,
  "processing_time": 1.5
}
```

**Response (200) - Informações Incompletas:**
```json
{
  "result": {
    "action": "missing_information",
    "message": "Preciso de mais informações para registrar sua transação:",
    "missing_fields": [
      "Qual foi o valor gasto?",
      "Qual forma de pagamento você usou?",
      "Em que data foi essa despesa?"
    ],
    "suggestions": {
      "categories": ["alimentação", "transporte", "lazer", "saúde", "educação"],
      "payment_methods": ["PIX", "cartão", "dinheiro"],
      "date_examples": ["hoje", "ontem", "há 2 dias"]
    }
  },
  "confidence": 0.70,
  "processing_time": 0.5
}
```

**Response (400) - Erro de Validação:**
```json
{
  "result": {
    "action": "validation_error",
    "message": "O valor da transação deve ser um número positivo. Por favor, informe um valor válido.",
    "error_type": "invalid_value",
    "field": "value",
    "suggestions": [
      "Use valores positivos para despesas",
      "Exemplo: 'Gastei 50 reais com comida'"
    ]
  },
  "confidence": 0.99,
  "processing_time": 0.3
}
```

**Response (200) - Geração de Gráficos:**
```json
{
  "result": {
    "action": "chart_generated",
    "message": "📊 Análise de Gastos por Categoria:",
    "chart": {
      "type": "pie",
      "title": "Gastos por Categoria",
      "data": [
        {
          "label": "alimentação",
          "value": 75.00,
          "percentage": 71.4
        },
        {
          "label": "transporte",
          "value": 30.00,
          "percentage": 28.6
        }
      ]
    },
    "insights": [
      "Alimentação representa 71.4% dos seus gastos",
      "Transporte representa 28.6% dos seus gastos"
    ]
  },
  "confidence": 0.98,
  "processing_time": 1.8
}
```

**Response (200) - Comparação de Períodos:**
```json
{
  "result": {
    "action": "period_comparison",
    "message": "📊 Comparativo de Gastos:",
    "comparison": {
      "current_period": {
        "name": "Julho 2025",
        "total_expenses": 105.00,
        "categories": [
          {"name": "alimentação", "value": 75.00},
          {"name": "transporte", "value": 30.00}
        ]
      },
      "previous_period": {
        "name": "Junho 2025",
        "total_expenses": 850.00,
        "categories": [
          {"name": "lazer", "value": 400.00},
          {"name": "alimentação", "value": 300.00},
          {"name": "transporte", "value": 150.00}
        ]
      },
      "variation": {
        "percentage": -87.6,
        "amount": -745.00,
        "trend": "decreasing"
      }
    },
    "insights": [
      "Você reduziu seus gastos em 87.6% em relação ao mês anterior",
      "Isso representa uma economia de R$ 745.00"
    ]
  },
  "confidence": 0.95,
  "processing_time": 2.3
}
```

### 🔄 **Detecção Automática de Intenções**

O backend deve detectar automaticamente a intenção baseada no conteúdo da mensagem:

| **Padrão de Mensagem** | **Intenção Detectada** | **Ação do Backend** |
|------------------------|------------------------|---------------------|
| "Gastei X com Y" | Registro de despesa | Criar transação |
| "Recebi X de Y" | Registro de receita | Criar transação |
| "Quais gastos com X?" | Consulta por categoria | Buscar transações |
| "Como estão minhas finanças?" | Análise geral | Calcular métricas |
| "Compare X com Y" | Comparação | Analisar períodos |
| "Gastei dinheiro" | Informação incompleta | Solicitar dados |
| "Gastei -X reais" | Erro de validação | Validar e corrigir |

---

## 🏷️ Categorias

### GET /api/v1/categories
**Descrição:** Lista todas as categorias disponíveis.

**Response (200):**
```json
{
  "categories": [
    {
      "id": "uuid",
      "name": "Alimentação",
      "type": "expense",
      "color": "#FF6B6B",
      "icon": "🍽️"
    }
  ]
}
```

### POST /api/v1/categories
**Descrição:** Cria uma nova categoria.

**Request:**
```json
{
  "name": "string",
  "type": "expense",
  "color": "#FF6B6B",
  "icon": "🍽️"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "name": "string",
  "type": "expense",
  "color": "#FF6B6B",
  "icon": "🍽️",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

## 🎯 Metas Financeiras

### GET /api/v1/goals
**Descrição:** Lista metas financeiras do usuário.

**Response (200):**
```json
{
  "goals": [
    {
      "id": "uuid",
      "name": "Viagem para Europa",
      "target_amount": 10000.00,
      "current_amount": 5000.00,
      "deadline": "2024-12-31T00:00:00Z",
      "progress": 50.0,
      "status": "active"
    }
  ]
}
```

### POST /api/v1/goals
**Descrição:** Cria uma nova meta financeira.

**Request:**
```json
{
  "name": "string",
  "target_amount": 10000.00,
  "deadline": "2024-12-31T00:00:00Z",
  "description": "string"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "name": "string",
  "target_amount": 10000.00,
  "current_amount": 0.00,
  "deadline": "2024-12-31T00:00:00Z",
  "progress": 0.0,
  "status": "active",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

## 📈 Relatórios

### GET /api/v1/reports/monthly/{year}/{month}
**Descrição:** Relatório mensal detalhado.

**Response (200):**
```json
{
  "period": {
    "year": 2024,
    "month": 1
  },
  "summary": {
    "total_income": 5000.00,
    "total_expenses": 3000.00,
    "balance": 2000.00
  },
  "categories": [],
  "transactions": [],
  "goals_progress": [],
  "insights": []
}
```

### GET /api/v1/reports/export
**Descrição:** Exporta dados em diferentes formatos.

**Query Parameters:**
- `format` (string): "csv", "pdf", "xlsx"
- `start_date` (string): Data inicial
- `end_date` (string): Data final

**Response (200):**
```
Content-Type: application/octet-stream
Content-Disposition: attachment; filename="relatorio_2024-01.csv"
```

---

## 🔧 Configurações e Utilitários

### GET /api/v1/health
**Descrição:** Verifica status da API e serviços.

**Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "1.0.0",
  "services": {
    "database": "connected",
    "agents": "available",
    "ai_models": "ready"
  }
}
```

### GET /api/v1/config
**Descrição:** Obtém configurações do sistema.

**Response (200):**
```json
{
  "currencies": ["BRL", "USD", "EUR"],
  "languages": ["pt-BR", "en-US"],
  "date_formats": ["DD/MM/YYYY", "MM/DD/YYYY"],
  "max_file_size": 10485760,
  "supported_formats": ["csv", "pdf", "xlsx"]
}
```

---

## 🚨 Códigos de Erro

### Erros Comuns
- `400 Bad Request` - Dados inválidos
- `401 Unauthorized` - Token inválido ou expirado
- `403 Forbidden` - Sem permissão
- `404 Not Found` - Recurso não encontrado
- `422 Unprocessable Entity` - Validação falhou
- `500 Internal Server Error` - Erro interno

### Exemplo de Erro
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos",
    "details": [
      {
        "field": "amount",
        "message": "Valor deve ser maior que zero"
      }
    ]
  }
}
```

---

## 📝 Notas de Implementação

### Estrutura do Banco de Dados
- **Tabela:** `transactions` (SQLite)
- **Campos:** `id`, `type`, `description`, `category`, `value`, `payment_method`, `date`
- **Tipos:** INTEGER (id), TEXT (type, description, category, payment_method, date), REAL (value)
- **Formato de data:** YYYY-MM-DD (TEXT)

### Integração com Agentes Agno
- Os endpoints de IA devem usar os agentes existentes
- Manter compatibilidade com a interface atual dos agentes
- Considerar cache para respostas frequentes
- Processar comandos naturais e converter para estrutura da tabela

### Autenticação
- Implementar JWT com refresh tokens
- Armazenar tokens de forma segura
- Implementar rate limiting

### Validação
- Usar Pydantic para validação de dados
- Validar tipos de transação: "income" ou "expense"
- Validar métodos de pagamento: "PIX", "cartão", "dinheiro", etc.
- Validar formato de data: YYYY-MM-DD
- Implementar validação customizada para regras de negócio
- Retornar erros detalhados

### Performance
- Implementar paginação em todas as listas
- Usar cache para dados frequentemente acessados
- Otimizar consultas ao banco de dados SQLite
- Considerar índices para campos frequentemente consultados

### Segurança
- Validar todos os inputs
- Implementar CORS adequadamente
- Usar HTTPS em produção
- Sanitizar dados de entrada
- Validar valores monetários (REAL)

---

## 🎯 Próximos Passos

1. **Definir estrutura do projeto** (FastAPI/Flask)
2. **Implementar autenticação** (JWT)
3. **Criar modelos de dados** (Pydantic)
4. **Implementar endpoints básicos** (CRUD)
5. **Integrar com agentes Agno** (IA)
6. **Adicionar testes** (pytest)
7. **Configurar documentação** (OpenAPI)
8. **Deploy e monitoramento**

---

*Este documento serve como especificação técnica para implementação do servidor web que integrará com os agentes Agno existentes.* 