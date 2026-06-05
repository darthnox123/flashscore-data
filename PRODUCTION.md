# ScoutAI — Produção, Custos e Monetização

## Arquitectura em produção

```
Internet
    │
    ▼
[ Reverse proxy — Nginx / Caddy ]
    │
    ├──▶ :3000  NestJS (Angular SSR + API)
    │              └──▶ PostgreSQL (DB)
    │              └──▶ Redis (cache)
    │
    └──▶ :8001  FastAPI (ML service)
                   └──▶ best_model.pkl / player_stats.csv
```

---

## Deploy step-by-step

### Opção A — VPS com Docker Compose (recomendado para começar)

**Requisitos:** Ubuntu 22.04+, Docker + Docker Compose, domínio próprio.

```bash
# 1. Clonar o repositório no servidor
git clone <repo-url> scoutai && cd scoutai/platform

# 2. Copiar e preencher as variáveis de ambiente
cp .env.example .env
# Editar .env:
#   NODE_ENV=production
#   PORT=3000
#   DB_HOST=postgres
#   DB_PASS=<password-forte>
#   REDIS_URL=redis://redis:6379
#   FOOTBALL_API_KEY=<chave-api-football>
#   PREDICTION_SERVICE_URL=http://prediction:8001

# 3. Build e arranque
docker compose up --build -d

# 4. Verificar logs
docker compose logs -f
```

**Nginx como reverse proxy (HTTPS via Certbot):**

```nginx
server {
    listen 443 ssl;
    server_name scoutai.example.com;

    ssl_certificate     /etc/letsencrypt/live/scoutai.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/scoutai.example.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
# SSL gratuito com Certbot
apt install certbot python3-certbot-nginx
certbot --nginx -d scoutai.example.com
```

---

### Opção B — Cloud gerida (escala automática)

| Componente | Serviço sugerido | Notas |
|------------|-----------------|-------|
| NestJS + Angular SSR | Railway / Render / Fly.io | Deploy directo via Docker |
| ML Service (FastAPI) | Railway / Render | Separar num serviço dedicado |
| PostgreSQL | Supabase / Railway Postgres | Plano gratuito suficiente para começar |
| Redis | Upstash Redis | Pay-per-use, cobre o free tier |
| Domínio + CDN | Cloudflare | Plano gratuito |

**Deploy no Railway (exemplo mais rápido):**
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

---

## Estimativa de custos mensais

### Fase 0 — MVP / Validação (< 500 req/dia)

| Recurso | Solução | Custo |
|---------|---------|-------|
| VPS 2 vCPU / 4 GB RAM | Hetzner CX22 | ~€4/mês |
| Domínio .com | Cloudflare / Namecheap | ~€10/ano |
| SSL | Let's Encrypt / Certbot | Gratuito |
| API Football | Free tier (100 req/dia) | Gratuito |
| **Total** | | **~€5/mês** |

### Fase 1 — Crescimento (500–5 000 req/dia)

| Recurso | Solução | Custo |
|---------|---------|-------|
| VPS 4 vCPU / 8 GB RAM | Hetzner CX32 ou Railway Starter | ~€12–20/mês |
| PostgreSQL gerido | Supabase Pro ou Railway | ~€0–25/mês |
| Redis gerido | Upstash | ~€0–10/mês |
| API Football | Pro (500 req/dia) | ~€8/mês |
| **Total** | | **~€20–60/mês** |

### Fase 2 — Escala (> 5 000 req/dia, multi-liga)

| Recurso | Solução | Custo |
|---------|---------|-------|
| Kubernetes / ECS | AWS / GCP / Azure | ~€100–300/mês |
| RDS PostgreSQL | AWS RDS t3.micro | ~€15–30/mês |
| ElastiCache Redis | AWS ElastiCache | ~€15–30/mês |
| API Football | Enterprise | ~€50+/mês |
| CDN + WAF | Cloudflare Pro | ~€20/mês |
| **Total** | | **~€200–450/mês** |

---

## Formas de gerar receita

### 1. Freemium com limite de previsões
- **Free:** 5 previsões/dia, apenas modelo LR pré-treinado
- **Pro (€4.99/mês):** previsões ilimitadas, todos os modelos (RF, XGB), histórico guardado
- **Implementação:** autenticação com JWT, tabela `users` + `prediction_quota`, Stripe para pagamentos

### 2. API pública para desenvolvedores
- Expor `/api/predict` com chave de API
- **Free:** 50 req/mês
- **Starter (€9.99/mês):** 1 000 req/mês
- **Pro (€49/mês):** 10 000 req/mês + webhooks
- Implementação: tabela `api_keys` com rate limiting via Redis (`@nestjs/throttler`)

### 3. Ligas adicionais como upsell
- Actualmente cobre Primeira Liga (Portugal)
- Upsell: Premier League, La Liga, Bundesliga (cada liga = dados de scraping + modelo treinado)
- **Liga Bundle (€2.99/liga/mês)** ou **All Leagues (€9.99/mês)**

### 4. Widget embebido (B2B)
- Site de desporto ou media embebe o widget ScoutAI via `<iframe>` ou Web Component
- Modelo de licenciamento por domínio: €49–199/mês
- Parceiros naturais: portais de desporto, sites de análise táctica, newsletters desportivas

### 5. Análise aprofundada por jogo (relatórios PDF)
- Após a previsão, opção de exportar um relatório detalhado com:
  - Perfis dos 22 jogadores
  - Estatísticas comparativas
  - Histórico de confrontos (com dados da API Football)
- **€0.99 por relatório** ou incluído no plano Pro

---

## Checklist pré-produção

- [ ] Variáveis de ambiente em ficheiro `.env` (nunca em código)
- [ ] `DB_PASS` com password forte (≥ 16 chars, gerada aleatoriamente)
- [ ] `synchronize: false` no TypeORM em produção (usar migrações explícitas)
- [ ] Rate limiting na API NestJS (`@nestjs/throttler`)
- [ ] CORS configurado para o domínio de produção (não `*`)
- [ ] FastAPI `allow_origins` restrito (não `*`)
- [ ] Health check endpoint a funcionar (`/api/health`)
- [ ] Logs centralizados (Sentry, Logtail, ou similar)
- [ ] Backup automático da base de dados (cron + pg_dump)
- [ ] HTTPS obrigatório (HSTS header)
- [ ] `best_model.pkl` e `player_stats.csv` versionados e com backup
