# Prediction Service — Integração ML no Platform

Microserviço Python (FastAPI) que serve o modelo scikit-learn `best_model.pkl` para previsão de resultados de futebol português. Comunica com o backend NestJS via HTTP.

---

## Arquitetura

```
Angular (frontend)
    ↓  GET /api/predictions/players
    ↓  POST /api/predictions
NestJS PredictionController  (src/api/prediction/)
    ↓  HTTP fetch (Node 22 nativo)
FastAPI prediction-service   (localhost:8001)
    ↓
best_model.pkl + player_stats.csv  (ml-data/)
```

---

## Ficheiros criados

### Python FastAPI (`prediction-service/`)

| Ficheiro | Descrição |
|---|---|
| `predictor.py` | Carrega o CSV e o `.pkl` no arranque. Expõe `predict_match()` e `get_player_names()` |
| `main.py` | App FastAPI com dois endpoints: `GET /players` e `POST /predict` |
| `requirements.txt` | Dependências Python |
| `Dockerfile` | Imagem Python 3.12-slim para produção |

### NestJS (`src/api/prediction/`)

| Ficheiro | Descrição |
|---|---|
| `prediction.dto.ts` | Validação: `home_players` e `away_players` com exatamente 11 strings cada |
| `prediction.service.ts` | Chama o FastAPI via `fetch` nativo (Node 22). URL configurável via `PREDICTION_SERVICE_URL` |
| `prediction.controller.ts` | `GET /api/predictions/players` e `POST /api/predictions` |
| `prediction.module.ts` | Módulo NestJS sem dependências externas |

### Angular (`client/`)

| Ficheiro | Descrição |
|---|---|
| `services/prediction.service.ts` | Injectable com `getPlayers()` e `predict()` via `HttpClient` |
| `pages/prediction/prediction.component.ts` | Lógica do componente: pesquisa, seleção e chamada ao serviço |
| `pages/prediction/prediction.component.html` | UI com autocomplete para cada equipa e barras de progresso H/D/A |

### Ficheiros modificados

| Ficheiro | O que mudou |
|---|---|
| `src/app.module.ts` | Importa `PredictionModule` antes do `SsrModule` |
| `client/app.config.ts` | Adiciona `provideHttpClient(withFetch())` |
| `client/app.routes.ts` | Rota `/prediction` com lazy-load |
| `client/layouts/base-layout.component.html` | Link "Previsões" na navegação |
| `package.json` | Scripts `start:dev:prediction` e `dev` com concurrently |
| `docker-compose.yml` | Serviço `prediction` com volume `../ml-data:/data:ro` |

---

## API Endpoints

### `GET /api/predictions/players`
Devolve a lista de todos os jogadores conhecidos pelo modelo (usada para o autocomplete no frontend).

**Resposta:**
```json
["Adel T.", "Aguilar J.", "Alexsandro", "..."]
```

### `POST /api/predictions`
Recebe dois plantéis de 11 jogadores e devolve as probabilidades de resultado.

**Body:**
```json
{
  "home_players": ["Pizzi", "Moutinho J.", "..."],
  "away_players": ["Buta L.", "van Ee E.", "..."]
}
```

**Resposta:**
```json
{
  "H": 39.9,
  "D": 26.7,
  "A": 33.4
}
```

| Campo | Significado |
|---|---|
| `H` | Probabilidade de vitória da equipa casa (%) |
| `D` | Probabilidade de empate (%) |
| `A` | Probabilidade de vitória da equipa fora (%) |

---

## Como arrancar

### Desenvolvimento

```bash
cd platform

# Instalar dependências Python (primeira vez)
cd prediction-service && pip install -r requirements.txt && cd ..

# Arrancar tudo em simultâneo (NestJS + Angular + FastAPI)
npm run dev
```

Ou individualmente:

```bash
npm run start:dev             # NestJS (porta 3000)
npm run start:dev:client      # Angular (porta 4200)
npm run start:dev:prediction  # FastAPI (porta 8001)
```

### Produção (Docker)

```bash
cd platform
docker-compose up --build
```

O `ml-data/` é montado como volume read-only no container Python — o `.pkl` e o `.csv` não são copiados para a imagem.

---

## Variáveis de ambiente

### NestJS (`platform/.env`)

| Variável | Default | Descrição |
|---|---|---|
| `PREDICTION_SERVICE_URL` | `http://localhost:8001` | URL do serviço FastAPI |

### FastAPI (variáveis de ambiente do container)

| Variável | Default | Descrição |
|---|---|---|
| `MODEL_PATH` | `../../ml-data/best_model.pkl` | Caminho para o ficheiro `.pkl` |
| `DATA_PATH` | `../../ml-data/player_stats.csv` | Caminho para o CSV de stats |

Em Docker, estes são sobrepostos automaticamente pelo `docker-compose.yml` para `/data/best_model.pkl` e `/data/player_stats.csv`.

---

## Sobre o modelo

- **Algoritmo:** Logistic Regression (C=0.01, max_iter=2000)
- **Accuracy (test):** ~43.6%
- **Features por jogador:** `rating`, `xG`, `total_remates`, `passes_certos_pct`, `toques`, `toques_area_adv`, `dribles_pct`, `duelos_pct`, `position_enc`
- **Lógica de previsão:** Para cada jogador dos 22 (11+11), busca o perfil histórico médio no CSV, corre `predict_proba`, e faz a média das 22 probabilidades individuais
- **Jogadores desconhecidos:** Se um nome não for encontrado no CSV, usa vetor de zeros (sem erro)
