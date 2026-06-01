# Platform — NestJS + Vue.js SSR

Stack: **NestJS** · **Vue 3** · **Vite** · **Tailwind CSS v4** · **TypeORM** · **PostgreSQL** · **Redis** · **Docker**

---

## Pré-requisitos

- [Node.js 22+](https://nodejs.org/)
- [Docker + Docker Compose](https://docs.docker.com/get-docker/)

---

## Desenvolvimento

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

### 3. Iniciar serviços (PostgreSQL + Redis)

```bash
docker compose up postgres redis -d
```

### 4. Iniciar o servidor de desenvolvimento

```bash
npm run start:dev
```

O servidor arranca em **http://localhost:3000** com HMR activo.

> O NestJS carrega o Vite como middleware — não é necessário um processo separado para o frontend.

---

## Produção

### Build completo

```bash
npm run build
```

Gera:
- `dist/` — NestJS compilado
- `dist/client/` — bundle do cliente (Vite)
- `dist/server/` — bundle SSR (Vite)

### Iniciar em produção

```bash
NODE_ENV=production node dist/main
```

### Com Docker Compose (stack completa)

```bash
docker compose up --build
```

Inicia a aplicação + PostgreSQL + Redis. Disponível em **http://localhost:3000**.

---

## Estrutura do projecto

```
src/                    # NestJS backend
├── main.ts             # Bootstrap + middleware Vite (dev)
├── app.module.ts       # Módulo raiz (TypeORM, Redis, SSR, Health)
├── ssr/
│   ├── ssr.service.ts  # Renderiza Vue → HTML (dev e prod)
│   └── ssr.controller.ts # Catch-all → SSR
└── api/
    └── health/         # GET /api/health

client/                 # Vue.js frontend
├── entry-client.ts     # Entrada browser (hydration)
├── entry-server.ts     # Entrada SSR (renderToString)
├── router.ts           # vue-router
├── layouts/
│   └── BaseLayout.vue
├── pages/
│   └── Home.vue
├── components/
│   ├── ui/             # Componentes reutilizáveis (shadcn-vue style)
│   └── shared/         # Componentes de negócio
└── lib/utils.ts        # Utilitário cn()
```

---

## Endpoints

| Método | Path | Descrição |
|--------|------|-----------|
| GET | `/api/health` | Health check |
| GET | `/*` | SSR — renderiza a página Vue correspondente |

---

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run start:dev` | Servidor de desenvolvimento com HMR |
| `npm run build` | Build completo (NestJS + Vite cliente + Vite SSR) |
| `npm start` | Iniciar em modo produção |

---

## Variáveis de ambiente

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `NODE_ENV` | `development` | Ambiente |
| `PORT` | `3000` | Porta do servidor |
| `DB_HOST` | `localhost` | Host PostgreSQL |
| `DB_PORT` | `5432` | Porta PostgreSQL |
| `DB_USER` | `postgres` | Utilizador PostgreSQL |
| `DB_PASS` | `postgres` | Password PostgreSQL |
| `DB_NAME` | `platform` | Base de dados |
| `REDIS_URL` | `redis://localhost:6379` | URL Redis |

---

## Adicionar novas páginas

1. Criar `client/pages/NovaPagina.vue`
2. Registar a rota em `client/router.ts`
3. A página é renderizada automaticamente via SSR

## Adicionar módulos NestJS

```bash
# Estrutura sugerida
src/api/
└── nome-modulo/
    ├── nome-modulo.module.ts
    ├── nome-modulo.controller.ts
    └── nome-modulo.service.ts
```

Registar o módulo em `src/app.module.ts`.
