# Incident Response Agent — Technical Specification

> As regras de como a IA deve colaborar neste projeto (simplicidade, não
> instalar dependências, não escrever migrations manualmente, estrutura do
> NestJS, boundaries do agente, etc.) estão em `.cursor/rules/*.mdc` e não
> são repetidas aqui.

Vamos construir um projeto de portfólio chamado **Incident Response Agent**.

O objetivo é construir um sistema que simula o ambiente de produção de uma
empresa e um agente de IA capaz de investigar incidentes técnicos de forma
autônoma, utilizando ferramentas para consultar métricas, logs, deployments,
saúde de serviços e banco de dados.

---

# 1. Objetivo do projeto

O projeto simula uma empresa fictícia com vários serviços em produção.

Um usuário pode fazer uma solicitação como:

> "Checkout has been showing a high number of errors since last night. Investigate what happened."

O agente deve investigar o incidente.

Ele **não recebe um fluxo determinístico dizendo exatamente o que consultar**.

Em vez disso, recebe um conjunto de ferramentas e decide quais utilizar com
base nas evidências encontradas.

Por exemplo, ele pode:

1. verificar a saúde do serviço;
2. consultar métricas históricas;
3. descobrir que houve aumento de erros;
4. consultar deployments recentes;
5. encontrar um deployment próximo ao início do incidente;
6. pesquisar logs;
7. descobrir erros relacionados ao payment provider;
8. verificar a saúde do payment provider;
9. consultar métricas do banco;
10. correlacionar as evidências;
11. produzir um diagnóstico final.

O objetivo não é simplesmente retornar dados.

O objetivo é produzir uma **investigação baseada em evidências**.

---

# 2. Arquitetura geral

O projeto será dividido em duas aplicações principais:

```text
incident-response-agent/
│
├── apps/
│   ├── api/
│   └── agent/
│
├── scenarios/
├── docker-compose.yml
└── README.md
```

## `apps/api`

Aplicação NestJS que representa a infraestrutura fictícia da empresa.

Responsabilidades:

- REST API;
- acesso ao PostgreSQL;
- services;
- deployments;
- metrics;
- logs;
- database metrics;
- incidents;
- seed dos cenários.

## `apps/agent`

Aplicação Python responsável pela inteligência artificial.

Stack inicial:

- Python;
- LangChain;
- LangGraph;
- LLM provider.

Responsabilidades:

- receber uma investigação;
- utilizar as tools;
- chamar a API NestJS;
- manter o estado da investigação;
- raciocinar sobre as evidências;
- produzir o diagnóstico.

A comunicação deve ser:

```text
Python Agent
     │
     ▼
Python Tool
     │
     │ HTTP
     ▼
NestJS API
     │
     ▼
PostgreSQL
```

---

# 3. Tecnologias

## Backend

```text
Node.js
TypeScript
NestJS
PostgreSQL
Drizzle ORM
```

## Agent

```text
Python
uv
LangChain
LangGraph
```

## Infraestrutura

```text
Docker
Docker Compose
PostgreSQL
```

---

# 4. Domínio da aplicação

O sistema terá inicialmente estas entidades principais:

```text
Service
Deployment
Metric
Log
DatabaseMetric
Incident
```

---

# 5. Service

Representa um serviço da empresa.

Exemplos:

```text
checkout
payment
orders
catalog
```

Schema conceitual:

```text
services

id
name
description
team
repository
environment
created_at
```

Regras:

- `id` é UUID;
- `name` é único;
- `environment` inicialmente pode ser `production`;
- um service pode possuir vários deployments;
- um service pode possuir várias métricas;
- um service pode possuir vários logs.

---

# 6. Deployment

Representa um deployment de uma aplicação.

Schema:

```text
deployments

id
service_id
version
commit_sha
environment
status
deployed_at
created_at
```

Relacionamento:

```text
Service 1 ──── N Deployment
```

Exemplo:

```json
{
  "id": "dep_123",
  "serviceId": "service_checkout",
  "version": "2.4.1",
  "commitSha": "a81f2c",
  "environment": "production",
  "status": "success",
  "deployedAt": "2026-09-16T21:10:00Z"
}
```

Possíveis statuses:

```text
success
failed
rolled_back
```

---

# 7. Metric

Representa uma métrica histórica de um serviço.

Não armazenar apenas o valor atual — precisamos de dados temporais para
permitir investigação.

Schema:

```text
metrics

id
service_id
timestamp
metric
value
```

Exemplos de métricas:

```text
error_rate
request_count
latency_p95
cpu_usage
memory_usage
```

Exemplo:

```text
checkout | 21:00 | error_rate | 0.2
checkout | 21:05 | error_rate | 0.3
checkout | 21:10 | error_rate | 8.7
checkout | 21:15 | error_rate | 11.2
```

Isso permite que o agente descubra que existe uma mudança temporal.

---

# 8. Log

Representa um log produzido por um serviço.

Schema:

```text
logs

id
service_id
timestamp
level
message
metadata
```

`metadata` pode ser JSONB.

Exemplo:

```json
{
  "provider": "acme-pay",
  "timeout": 5000,
  "requestId": "req_123"
}
```

Possíveis levels:

```text
INFO
WARN
ERROR
```

Exemplo:

```json
{
  "service": "checkout",
  "timestamp": "2026-09-16T21:16:02Z",
  "level": "ERROR",
  "message": "PaymentProviderTimeout",
  "metadata": {
    "provider": "acme-pay",
    "timeout": 5000
  }
}
```

---

# 9. DatabaseMetric

Representa métricas da infraestrutura de banco.

Schema:

```text
database_metrics

id
database
timestamp
cpu
connections
query_latency
```

Exemplo:

```text
production-db
CPU: 42
connections: 120
query_latency: 35
```

Isso permite que o agente investigue se um incidente do checkout pode estar
relacionado ao banco.

---

# 10. Incident

Representa um incidente registrado.

Schema:

```text
incidents

id
title
description
severity
status
started_at
resolved_at
created_at
```

Possíveis severity:

```text
low
medium
high
critical
```

Possíveis status:

```text
open
investigating
resolved
```

Inicialmente essa entidade serve como parte do ambiente simulado. Não é
necessário que o agente crie incidentes automaticamente no MVP.

---

# 11. API NestJS

A API deve possuir endpoints claros e RESTful.

## Services

### GET `/services`

Lista os serviços.

Response:

```json
[
  {
    "id": "service_checkout",
    "name": "checkout",
    "description": "Checkout service",
    "team": "payments",
    "repository": "company/checkout",
    "environment": "production"
  }
]
```

---

### GET `/services/:serviceId`

Retorna detalhes de um serviço.

Response:

```json
{
  "id": "service_checkout",
  "name": "checkout",
  "description": "Checkout service",
  "team": "payments",
  "repository": "company/checkout",
  "environment": "production"
}
```

---

# 12. Service health

### GET `/services/:serviceId/health`

Retorna o estado atual do serviço.

Response:

```json
{
  "serviceId": "service_checkout",
  "status": "degraded",
  "errorRate": 8.7,
  "latencyP95": 1240
}
```

Possible status:

```text
healthy
degraded
down
```

---

# 13. Service metrics

### GET `/services/:serviceId/metrics`

Query parameters:

```text
from
to
metric
```

Exemplo:

```text
GET /services/service_checkout/metrics?from=...&to=...&metric=error_rate
```

Response:

```json
{
  "serviceId": "service_checkout",
  "metric": "error_rate",
  "points": [
    {
      "timestamp": "2026-09-16T21:00:00Z",
      "value": 0.2
    },
    {
      "timestamp": "2026-09-16T21:05:00Z",
      "value": 0.3
    },
    {
      "timestamp": "2026-09-16T21:10:00Z",
      "value": 8.7
    }
  ]
}
```

---

# 14. Deployments

### GET `/services/:serviceId/deployments`

Query parameters:

```text
from
to
environment
status
```

Exemplo:

```text
GET /services/service_checkout/deployments?from=...&to=...
```

Response:

```json
{
  "items": [
    {
      "id": "dep_123",
      "serviceId": "service_checkout",
      "version": "2.4.1",
      "commitSha": "a81f2c",
      "environment": "production",
      "status": "success",
      "deployedAt": "2026-09-16T21:10:00Z"
    }
  ]
}
```

---

# 15. Deployment details

### GET `/deployments/:deploymentId`

Response:

```json
{
  "id": "dep_123",
  "serviceId": "service_checkout",
  "version": "2.4.1",
  "commitSha": "a81f2c",
  "environment": "production",
  "status": "success",
  "deployedAt": "2026-09-16T21:10:00Z",
  "changes": [
    "Changed payment client timeout",
    "Updated retry policy"
  ]
}
```

O campo `changes` existe para fornecer informações significativas ao agente.

---

# 16. Logs

### GET `/logs`

Query parameters:

```text
serviceId
from
to
level
query
limit
```

Exemplo:

```text
GET /logs?serviceId=service_checkout&query=PaymentProviderTimeout
```

Response:

```json
{
  "items": [
    {
      "id": "log_123",
      "serviceId": "service_checkout",
      "timestamp": "2026-09-16T21:16:02Z",
      "level": "ERROR",
      "message": "PaymentProviderTimeout",
      "metadata": {
        "provider": "acme-pay",
        "timeout": 5000
      }
    }
  ],
  "total": 47
}
```

---

# 17. Database metrics

### GET `/databases/:database/metrics`

Query parameters:

```text
from
to
```

Response:

```json
{
  "database": "production-db",
  "points": [
    {
      "timestamp": "2026-09-16T21:00:00Z",
      "cpu": 42,
      "connections": 120,
      "queryLatency": 35
    }
  ]
}
```

---

# 18. Incidents

### GET `/incidents`

Query parameters:

```text
status
severity
serviceId
```

Response:

```json
{
  "items": [
    {
      "id": "incident_123",
      "title": "Checkout elevated error rate",
      "description": "Checkout is returning elevated errors.",
      "severity": "high",
      "status": "investigating",
      "startedAt": "2026-09-16T21:15:00Z",
      "resolvedAt": null
    }
  ]
}
```

---

# 19. DTO architecture

Exemplo conceitual:

```text
services/
├── dto/
│   ├── list-services-query.dto.ts
│   └── service-response.dto.ts
│
├── services.controller.ts
├── services.service.ts
└── services.repository.ts
```

---

# 20. Scenarios

Um dos pontos mais importantes do projeto é que os incidentes serão
simulados através de **dados reais no PostgreSQL**.

Teremos inicialmente quatro cenários:

```text
scenarios/
├── deployment-failure/
├── payment-provider-degradation/
├── database-overload/
└── healthy/
```

Cada cenário deve conseguir popular o banco com dados consistentes.

---

# 21. Scenario 1 — Deployment failure

Situação:

```text
21:00
error rate = 0.2%

21:05
error rate = 0.3%

21:10
checkout v2.4.1 deployed

21:15
error rate = 8.7%

21:20
error rate = 11.2%
```

Logs começam a mostrar:

```text
PaymentProviderTimeout
```

Database permanece normal.

Payment provider permanece saudável.

Deployment `v2.4.1` contém mudanças relacionadas ao cliente de pagamentos.

A conclusão esperada é que existe uma forte correlação entre o deployment e
o incidente.

---

# 22. Scenario 2 — Payment provider degradation

Não existe deployment relevante antes do incidente.

O payment provider apresenta:

```text
latency ↑
error rate ↑
```

O checkout apresenta:

```text
error rate ↑
```

Database permanece normal.

A investigação deve apontar o payment provider como causa provável.

---

# 23. Scenario 3 — Database overload

Não existe deployment relevante.

O banco apresenta:

```text
CPU ↑
connections ↑
query latency ↑
```

Checkout apresenta:

```text
latency ↑
error rate ↑
```

Logs apresentam sintomas compatíveis com database timeout.

A investigação deve apontar o banco como causa provável.

---

# 24. Scenario 4 — Healthy

Não existe incidente real.

Pequenas variações nas métricas existem, mas:

- não há aumento significativo de erros;
- não há deployment suspeito;
- database está saudável;
- payment provider está saudável;
- logs não apresentam padrão anormal.

O agente deve ser capaz de concluir que não há evidências suficientes de um
incidente significativo.

---

# 25. Python tools

O agente terá tools que encapsulam chamadas HTTP para o NestJS.

Exemplos:

```text
get_service_health
get_service_metrics
get_recent_deployments
get_deployment_details
search_logs
get_database_metrics
```

Exemplo conceitual:

```text
get_recent_deployments(
    service_id,
    from,
    to
)
```

Internamente:

```text
Python
  ↓
HTTP GET
  ↓
NestJS
  ↓
PostgreSQL
```

---

# 26. Agent

A entrada do agente deve ser uma solicitação textual.

Exemplo:

```json
{
  "request": "Checkout has been showing a high number of errors since last night. Investigate what happened."
}
```

O fluxo conceitual é:

```text
User request
     ↓
Agent
     ↓
choose tool
     ↓
tool result
     ↓
Agent
     ↓
choose another tool
     ↓
tool result
     ↓
...
     ↓
Diagnosis
```

---

# 27. Agent state

O estado da investigação deve ser explícito. Ele deve ser capaz de
armazenar informações como:

```text
investigation request
service being investigated
time range
tool calls
tool results
observations
hypotheses
evidence
final diagnosis
```

LangGraph será utilizado para representar esse estado e permitir que a
investigação tenha múltiplos passos.

---

# 28. LangGraph

LangGraph deve ser utilizado para controlar:

- estado;
- loops;
- múltiplas etapas;
- avaliação de evidências;
- decisão de continuar investigando;
- finalização da investigação.

O fluxo conceitual pode ser:

```text
START
  ↓
Investigate
  ↓
Evaluate evidence
  ↓
Need more information?
  ├── yes → Investigate
  │
  └── no
       ↓
    Diagnose
       ↓
      END
```

---

# 29. Diagnóstico

O resultado final deve ser estruturado.

Exemplo:

```json
{
  "summary": "Checkout error rate increased significantly after deployment v2.4.1.",
  "severity": "high",
  "diagnosis": "The evidence strongly suggests that checkout deployment v2.4.1 introduced the incident.",
  "confidence": "high",
  "timeline": [
    {
      "timestamp": "2026-09-16T21:10:00Z",
      "event": "checkout v2.4.1 deployed"
    },
    {
      "timestamp": "2026-09-16T21:15:00Z",
      "event": "error rate increased to 8.7%"
    }
  ],
  "evidence": [
    "Error rate increased five minutes after deployment.",
    "PaymentProviderTimeout errors appeared immediately after the deployment.",
    "Database metrics remained normal.",
    "Payment provider health remained normal.",
    "Deployment v2.4.1 modified payment client behavior."
  ],
  "recommendedAction": "Investigate or rollback deployment v2.4.1."
}
```

A resposta deve separar claramente:

- observações;
- evidências;
- hipótese;
- diagnóstico;
- recomendação.

---

# 30. Actions — fase posterior

Depois que a investigação funcionar, podemos adicionar ferramentas de ação:

```text
create_incident
add_incident_comment
notify_on_call
rollback_deployment
```

Essas tools **não fazem parte do MVP inicial**. Exemplo de fluxo com
aprovação humana:

```text
Agent
  ↓
"I recommend rolling back deployment dep_123."
  ↓
Human approval
  ↓
rollback_deployment()
```

---

# 31. MCP

MCP não faz parte do MVP. Primeiro construir:

```text
Agent
 ↓
Python tools
 ↓
NestJS API
```

MCP pode ser estudado posteriormente como uma possível evolução da
arquitetura.

---

# 32. Repository structure

Estrutura inicial desejada:

```text
incident-response-agent/
│
├── apps/
│   │
│   ├── api/
│   │   ├── src/
│   │   │   ├── services/
│   │   │   │   ├── dto/
│   │   │   │   ├── services.controller.ts
│   │   │   │   ├── services.service.ts
│   │   │   │   └── services.repository.ts
│   │   │   │
│   │   │   ├── deployments/
│   │   │   ├── metrics/
│   │   │   ├── logs/
│   │   │   ├── databases/
│   │   │   └── incidents/
│   │   │
│   │   ├── drizzle/
│   │   │   ├── schema/
│   │   │   └── migrations/
│   │   │
│   │   └── ...
│   │
│   └── agent/
│       ├── src/
│       │   ├── agent/
│       │   │   ├── graph.py
│       │   │   ├── state.py
│       │   │   └── nodes/
│       │   │
│       │   ├── tools/
│       │   │   ├── services.py
│       │   │   ├── metrics.py
│       │   │   ├── deployments.py
│       │   │   ├── logs.py
│       │   │   └── databases.py
│       │   │
│       │   └── llm/
│       │
│       └── pyproject.toml
│
├── scenarios/
│   ├── deployment-failure/
│   ├── payment-provider-degradation/
│   ├── database-overload/
│   └── healthy/
│
├── docker-compose.yml
└── README.md
```

---

# 33. Seed system

Precisamos de uma maneira simples de carregar um cenário.

Por exemplo:

```text
pnpm db:seed --scenario deployment-failure
```

O cenário deve:

1. limpar/resetar os dados relevantes;
2. criar services;
3. criar deployments;
4. criar metrics;
5. criar logs;
6. criar database metrics;
7. criar incidents quando necessário.

Depois disso, a API funciona normalmente.

---

# 34. Development order

## Phase 1 — Backend

```text
PostgreSQL
↓
Drizzle schema
↓
NestJS
↓
REST endpoints
↓
seed
```

Endpoints a testar manualmente antes de seguir:

```text
GET /services/...
GET /services/:id/health
GET /services/:id/metrics
GET /services/:id/deployments
GET /deployments/:id
GET /logs
GET /databases/:database/metrics
```

## Phase 2 — Scenarios

Implementar os quatro cenários e garantir que os dados sejam coerentes.
Testar manualmente cada cenário pela API.

## Phase 3 — Python tools

Criar as tools Python. Cada tool deve chamar a API NestJS. Testar cada tool
isoladamente antes de criar o agente.

## Phase 4 — Basic LangChain agent

```text
recebe pergunta
↓
usa tools
↓
recebe resultados
↓
responde
```

O objetivo é validar que o LLM consegue utilizar as ferramentas.

## Phase 5 — LangGraph

```text
investigation state
↓
tool calls
↓
evidence
↓
continue / stop
↓
diagnosis
```

## Phase 6 — Structured diagnosis

Fazer o agente produzir uma resposta estruturada utilizando structured
output.

## Phase 7 — Human approval

Adicionar ações como rollback apenas depois que a investigação estiver
funcionando.

---

# 35. Final technical goal

Ao final do MVP, quero conseguir executar algo próximo de:

```text
User:

"Checkout has been showing a high number of errors since last night.
Investigate what happened."
```

E o sistema deve:

```text
Agent
 ↓
decide what to investigate
 ↓
call service metrics
 ↓
observe anomaly
 ↓
call deployments
 ↓
find recent deployment
 ↓
inspect deployment
 ↓
search logs
 ↓
check database
 ↓
check payment provider
 ↓
correlate evidence
 ↓
produce structured diagnosis
```

O ponto principal é que **o agente deve investigar**, e não apenas executar
uma sequência previamente programada.